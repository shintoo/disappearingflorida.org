<template>
  <div class="density-calculator-page">
    <header class="page-header">
      <h1>Density Calculator</h1>
      <p class="subtitle">
        Explore how different development patterns affect land use, housing capacity, and environmental impact.
      </p>
    </header>

    <div class="calculator-layout">
      <aside class="controls-panel">
        <div class="panel-content">
          <DensityInputPanel
            v-model:landSize="landSize"
            v-model:population="population"
            v-model:zones="zones"
          />

          <DensityResults
            :results="calculatedResults"
            :landSize="landSize"
          />
        </div>
      </aside>

      <main class="visualization-panel">
        <CityVisualization
          :zones="zones"
        />
      </main>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import DensityInputPanel from '@/components/density-calculator/DensityInputPanel.vue';
import DensityResults from '@/components/density-calculator/DensityResults.vue';
import CityVisualization from '@/components/density-calculator/CityVisualization.vue';
import { calculateZonedDensityImpact, defaultPatterns } from '@/utils/densityCalculations';

export default {
  name: 'DensityCalculator',
  components: {
    DensityInputPanel,
    DensityResults,
    CityVisualization
  },
  setup() {
    // State
    const population = ref(25000);
    const landSize = ref(500);
    const patterns = ref([]);

    // Default zone distribution - mixed development
    const zones = ref([
      { type: 'high-rise-urban', percentage: 10 },
      { type: 'mixed-use-midrise', percentage: 25 },
      { type: 'townhomes', percentage: 30 },
      { type: 'suburban-sprawl', percentage: 35 }
    ]);

    // Load density patterns from JSON
    const loadPatterns = async () => {
      try {
        const response = await fetch('/data/density-patterns.json');
        if (!response.ok) throw new Error('Failed to load patterns');
        patterns.value = await response.json();
      } catch (error) {
        console.warn('Using default patterns:', error);
        patterns.value = defaultPatterns;
      }
    };

    // Computed results based on current inputs
    const calculatedResults = computed(() => {
      if (patterns.value.length === 0) return null;
      if (population.value <= 0) return null;

      return calculateZonedDensityImpact(
        population.value,
        2.5, // people per unit
        zones.value,
        patterns.value
      );
    });

    onMounted(() => {
      loadPatterns();
    });

    return {
      population,
      landSize,
      zones,
      calculatedResults
    };
  }
};
</script>

<style scoped>
.density-calculator-page {
  padding-top: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-bottom: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: var(--color-text-light);
  font-size: 1rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.5;
}

.calculator-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.controls-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.panel-content {
  padding: 1.5rem;
}

.visualization-panel {
  background: white;
  overflow: hidden;
  min-height: 350px;
}

/* Tablet: 3D on top */
@media (min-width: 768px) {
  .calculator-layout {
    flex-direction: column-reverse;
  }

  .visualization-panel {
    min-height: 450px;
  }

  .subtitle {
    font-size: 1.1rem;
  }
}

/* Desktop: side by side */
@media (min-width: 1024px) {
  .calculator-layout {
    flex-direction: row;
    align-items: flex-start;
  }

  .controls-panel {
    flex: 0 0 380px;
    position: sticky;
    top: 5rem;
    max-height: calc(100vh - 6rem);
    overflow-y: auto;
  }

  .visualization-panel {
    flex: 1;
    min-height: 600px;
  }

  .page-header {
    margin-bottom: 2.5rem;
  }
}

/* Large desktop */
@media (min-width: 1200px) {
  .controls-panel {
    flex: 0 0 420px;
  }

  .visualization-panel {
    min-height: 650px;
  }
}
</style>
