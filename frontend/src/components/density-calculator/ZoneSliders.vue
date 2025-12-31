<template>
  <div class="zone-sliders">
    <div class="sliders-header">
      <h4>Density Mix</h4>
      <span class="total-indicator" :class="{ valid: totalPercentage === 100 }">
        {{ totalPercentage }}%
      </span>
    </div>

    <div class="slider-group" v-for="zone in zoneConfig" :key="zone.id">
      <div class="slider-label">
        <span
          class="zone-color"
          :style="{ backgroundColor: zone.color }"
        ></span>
        <span class="zone-name">{{ zone.name }}</span>
        <span class="zone-value">{{ getZoneValue(zone.id) }}%</span>
      </div>
      <input
        type="range"
        :id="zone.id"
        min="0"
        max="100"
        :value="getZoneValue(zone.id)"
        @input="handleSliderChange(zone.id, $event)"
        class="slider"
        :style="{ '--slider-color': zone.color }"
      />
    </div>

    <div class="preset-buttons">
      <button
        v-for="preset in presets"
        :key="preset.name"
        @click="applyPreset(preset)"
        class="preset-btn"
      >
        {{ preset.name }}
      </button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { zoneColors } from '@/utils/three/buildingTypes.js';

export default {
  name: 'ZoneSliders',
  props: {
    modelValue: {
      type: Array,
      required: true
      // Array of { type: string, percentage: number }
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const zoneConfig = [
      { id: 'high-rise-urban', name: 'High-Rise', color: zoneColors['high-rise-urban'] },
      { id: 'mixed-use-midrise', name: 'Midrise', color: zoneColors['mixed-use-midrise'] },
      { id: 'townhomes', name: 'Townhomes', color: zoneColors['townhomes'] },
      { id: 'suburban-sprawl', name: 'Single-Family', color: zoneColors['suburban-sprawl'] }
    ];

    const presets = [
      {
        name: 'Urban Core',
        zones: [
          { type: 'high-rise-urban', percentage: 40 },
          { type: 'mixed-use-midrise', percentage: 40 },
          { type: 'townhomes', percentage: 20 },
          { type: 'suburban-sprawl', percentage: 0 }
        ]
      },
      {
        name: 'Mixed',
        zones: [
          { type: 'high-rise-urban', percentage: 10 },
          { type: 'mixed-use-midrise', percentage: 25 },
          { type: 'townhomes', percentage: 30 },
          { type: 'suburban-sprawl', percentage: 35 }
        ]
      },
      {
        name: 'Suburban',
        zones: [
          { type: 'high-rise-urban', percentage: 0 },
          { type: 'mixed-use-midrise', percentage: 0 },
          { type: 'townhomes', percentage: 20 },
          { type: 'suburban-sprawl', percentage: 80 }
        ]
      },
      {
        name: 'All Sprawl',
        zones: [
          { type: 'high-rise-urban', percentage: 0 },
          { type: 'mixed-use-midrise', percentage: 0 },
          { type: 'townhomes', percentage: 0 },
          { type: 'suburban-sprawl', percentage: 100 }
        ]
      }
    ];

    const totalPercentage = computed(() => {
      return props.modelValue.reduce((sum, zone) => sum + zone.percentage, 0);
    });

    const getZoneValue = (zoneId) => {
      const zone = props.modelValue.find(z => z.type === zoneId);
      return zone ? zone.percentage : 0;
    };

    const handleSliderChange = (zoneId, event) => {
      const newValue = parseInt(event.target.value, 10);
      const currentValue = getZoneValue(zoneId);
      const difference = newValue - currentValue;

      // Find other zones to adjust
      const otherZones = props.modelValue.filter(z => z.type !== zoneId);
      const otherTotal = otherZones.reduce((sum, z) => sum + z.percentage, 0);

      // Calculate new values for other zones
      const newZones = props.modelValue.map(zone => {
        if (zone.type === zoneId) {
          return { ...zone, percentage: newValue };
        }

        // Proportionally adjust other zones
        if (otherTotal > 0 && difference !== 0) {
          const ratio = zone.percentage / otherTotal;
          const adjustment = Math.round(difference * ratio);
          const newPercentage = Math.max(0, Math.min(100, zone.percentage - adjustment));
          return { ...zone, percentage: newPercentage };
        }

        return zone;
      });

      // Normalize to ensure total is 100
      const newTotal = newZones.reduce((sum, z) => sum + z.percentage, 0);
      if (newTotal !== 100) {
        // Find the largest non-changed zone and adjust it
        const adjustableZones = newZones.filter(z => z.type !== zoneId && z.percentage > 0);
        if (adjustableZones.length > 0) {
          const diff = 100 - newTotal;
          // Sort by percentage descending
          adjustableZones.sort((a, b) => b.percentage - a.percentage);
          const zoneToAdjust = newZones.find(z => z.type === adjustableZones[0].type);
          if (zoneToAdjust) {
            zoneToAdjust.percentage = Math.max(0, zoneToAdjust.percentage + diff);
          }
        } else if (newValue !== 100) {
          // If this is the only zone, cap it
          const thisZone = newZones.find(z => z.type === zoneId);
          if (thisZone) thisZone.percentage = 100;
        }
      }

      emit('update:modelValue', newZones);
    };

    const applyPreset = (preset) => {
      emit('update:modelValue', [...preset.zones]);
    };

    return {
      zoneConfig,
      presets,
      totalPercentage,
      getZoneValue,
      handleSliderChange,
      applyPreset
    };
  }
};
</script>

<style scoped>
.zone-sliders {
  padding: 1rem 0;
}

.sliders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.sliders-header h4 {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text);
}

.total-indicator {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: #fee2e2;
  color: #991b1b;
}

.total-indicator.valid {
  background: #dcfce7;
  color: #166534;
}

.slider-group {
  margin-bottom: 1.25rem;
}

.slider-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.zone-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.zone-name {
  flex: 1;
  font-size: 0.9rem;
  color: var(--color-text);
}

.zone-value {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-primary);
  min-width: 3rem;
  text-align: right;
}

.slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--slider-color, var(--color-primary));
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.15s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--slider-color, var(--color-primary));
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.preset-btn {
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  border: 1px solid var(--color-primary);
  background: transparent;
  color: var(--color-primary);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-btn:hover {
  background: var(--color-primary);
  color: white;
}

@media (max-width: 768px) {
  .slider-group {
    margin-bottom: 1.5rem;
  }

  .slider {
    height: 10px;
  }

  .slider::-webkit-slider-thumb {
    width: 24px;
    height: 24px;
  }

  .preset-buttons {
    justify-content: center;
  }
}
</style>
