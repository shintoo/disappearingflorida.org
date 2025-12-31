<template>
  <div class="city-visualization" ref="containerRef">
    <canvas ref="canvasRef"></canvas>
    <div v-if="!webglSupported" class="webgl-fallback">
      <p>3D visualization requires WebGL support.</p>
      <p>Please use a modern browser with WebGL enabled.</p>
    </div>
    <div class="controls-hint" v-if="webglSupported">
      Drag to rotate | Scroll to zoom
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import * as THREE from 'three';
import {
  createScene,
  createCamera,
  createRenderer,
  createLighting,
  createControls,
  createGround,
  checkWebGLSupport
} from '@/utils/three/sceneSetup.js';
import { createBuilding } from '@/utils/three/buildingGenerator.js';
import { generateCityLayout } from '@/utils/three/cityLayout.js';
import { generateVegetationPositions, createInstancedTrees } from '@/utils/three/vegetation.js';
import { debounce } from '@/utils/debounce.js';
import { buildingTypes } from '@/utils/three/buildingTypes.js';

export default {
  name: 'CityVisualization',
  props: {
    zones: {
      type: Array,
      required: true,
      // Array of { type: string, percentage: number }
    },
    totalUnits: {
      type: Number,
      default: 250  // Fixed units tuned so 100% single-family nearly fills the grid
    }
  },
  emits: ['update:totalAcres'],
  setup(props, { emit }) {
    const containerRef = ref(null);
    const canvasRef = ref(null);
    const webglSupported = ref(true);

    // Three.js objects
    let scene = null;
    let camera = null;
    let renderer = null;
    let controls = null;
    let animationId = null;
    let buildingsGroup = null;
    let vegetationGroup = null;
    let ground = null;

    // Persistent vegetation data - generated once
    let persistentVegetationPositions = null;
    let persistentVegetationScales = null;

    const isMobile = computed(() => {
      if (typeof window === 'undefined') return false;
      return window.innerWidth < 768;
    });

    // Initialize Three.js scene
    const initScene = () => {
      if (!checkWebGLSupport()) {
        webglSupported.value = false;
        return;
      }

      const container = containerRef.value;
      const canvas = canvasRef.value;
      if (!container || !canvas) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      // Create scene
      scene = createScene();

      // Create camera
      camera = createCamera(width / height);

      // Create renderer
      renderer = createRenderer(canvas, width, height, isMobile.value);

      // Create lighting
      createLighting(scene, isMobile.value);

      // Create ground - fixed size for visualization
      const gridSize = 80; // Fixed grid size
      ground = createGround(scene, gridSize + 20);

      // Create controls
      controls = createControls(camera, renderer.domElement);

      // Create buildings group
      buildingsGroup = new THREE.Group();
      scene.add(buildingsGroup);

      // Create vegetation group
      vegetationGroup = new THREE.Group();
      scene.add(vegetationGroup);

      // Initial building generation
      updateBuildings();

      // Start animation loop
      animate();
    };

    // Animation loop
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (controls) {
        controls.update();
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };

    // Update buildings based on zones
    const updateBuildings = () => {
      if (!buildingsGroup || !scene) return;

      // Generate new layout with fixed units
      const gridSize = 80; // Fixed grid size for visualization
      const { buildings } = generateCityLayout(
        props.zones,
        gridSize,
        props.totalUnits
      );

      // Calculate total acres consumed by all buildings
      let totalAcres = 0;
      buildings.forEach(buildingData => {
        const config = buildingTypes[buildingData.type];
        if (config && buildingData.units) {
          // Calculate acres for this building based on its units and density
          const acres = buildingData.units / config.densityPerAcre;
          totalAcres += acres;
        }
      });

      // Emit total acres to parent component
      emit('update:totalAcres', totalAcres);

      // Clear existing buildings
      while (buildingsGroup.children.length > 0) {
        const child = buildingsGroup.children[0];
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
        buildingsGroup.remove(child);
      }

      // Create new buildings
      const buildingPositions = [];
      buildings.forEach(buildingData => {
        const building = createBuilding(
          buildingData.type,
          buildingData.position,
          null, // height (let it be calculated)
          buildingData.units // pass unit count for proportional sizing
        );
        if (building) {
          buildingsGroup.add(building);
          buildingPositions.push(buildingData.position);
        }
      });

      // Update vegetation to avoid buildings
      updateVegetation(buildingPositions, gridSize);

      // Update ground and streets size
      if (ground) {
        ground.geometry.dispose();
        ground.geometry = new THREE.PlaneGeometry(gridSize + 20, gridSize + 20);
      }
    };

    // Update vegetation layer
    const updateVegetation = (buildingPositions, gridSize) => {
      if (!vegetationGroup) return;

      // Generate vegetation positions only once (on first call)
      if (!persistentVegetationPositions) {
        const maxTrees = isMobile.value ? 100 : 200;
        const density = isMobile.value ? 0.2 : 0.3;

        // Generate with no buildings initially (full vegetation coverage)
        const { positions, scales } = generateVegetationPositions(
          [],
          gridSize,
          density,
          maxTrees
        );

        persistentVegetationPositions = positions;
        persistentVegetationScales = scales;
      }

      // Clear existing vegetation
      while (vegetationGroup.children.length > 0) {
        const child = vegetationGroup.children[0];
        child.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach(m => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
        vegetationGroup.remove(child);
      }

      // Filter out trees that conflict with buildings
      const filteredPositions = [];
      const filteredScales = [];
      const cellSize = 2;

      // Create occupancy map from building positions
      const occupiedSet = new Set();
      buildingPositions.forEach(pos => {
        const cellX = Math.floor(pos.x / cellSize);
        const cellZ = Math.floor(pos.z / cellSize);

        // Mark surrounding cells as occupied (clearance radius)
        for (let dx = -3; dx <= 3; dx++) {
          for (let dz = -3; dz <= 3; dz++) {
            occupiedSet.add(`${cellX + dx},${cellZ + dz}`);
          }
        }
      });

      // Keep only trees that don't conflict with buildings
      persistentVegetationPositions.forEach((pos, i) => {
        const cellX = Math.floor(pos.x / cellSize);
        const cellZ = Math.floor(pos.z / cellSize);

        if (!occupiedSet.has(`${cellX},${cellZ}`)) {
          filteredPositions.push(pos);
          filteredScales.push(persistentVegetationScales[i]);
        }
      });

      // Create vegetation with filtered positions
      if (filteredPositions.length > 0) {
        const vegetation = createInstancedTrees(filteredPositions, filteredScales);
        if (vegetation) {
          vegetationGroup.add(vegetation);
        }
      }
    };

    // Debounced update for smooth slider interaction
    const debouncedUpdate = debounce(updateBuildings, 50);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.value || !camera || !renderer) return;

      const width = containerRef.value.clientWidth;
      const height = containerRef.value.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    // Watch for zone changes
    watch(
      () => [props.zones, props.totalUnits],
      () => {
        debouncedUpdate();
      },
      { deep: true }
    );

    // Lifecycle hooks
    onMounted(() => {
      initScene();
      window.addEventListener('resize', handleResize);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);

      if (animationId) {
        cancelAnimationFrame(animationId);
      }

      // Cleanup Three.js resources
      if (renderer) {
        renderer.dispose();
      }

      if (scene) {
        scene.traverse((object) => {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    });

    return {
      containerRef,
      canvasRef,
      webglSupported
    };
  }
};
</script>

<style scoped>
.city-visualization {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 300px;
  border-radius: 8px;
  overflow: hidden;
}

.city-visualization canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.webgl-fallback {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
}

.webgl-fallback p {
  margin: 0.5rem 0;
  color: var(--color-text);
}

.controls-hint {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.5);
  background: rgba(255, 255, 255, 0.7);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .city-visualization {
    min-height: 250px;
  }

  .controls-hint {
    font-size: 0.65rem;
  }
}
</style>
