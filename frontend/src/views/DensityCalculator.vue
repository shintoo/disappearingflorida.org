<template>
  <div class="density-calculator-page">
    <h1>Density Calculator</h1>
    <p class="subtitle">Compare land use between different development patterns</p>

    <div class="card">
      <div class="calculator">
        <h3>Calculate Land Impact</h3>

        <div class="input-group">
          <label for="population">Population to House:</label>
          <input
            type="number"
            id="population"
            v-model.number="population"
            min="100"
            step="100"
          />
        </div>

        <div class="input-group">
          <label for="pattern">Development Pattern:</label>
          <select id="pattern" v-model="selectedPattern">
            <option value="">-- Select Pattern --</option>
            <option v-for="pattern in patterns" :key="pattern.id" :value="pattern.id">
              {{ pattern.name }}
            </option>
          </select>
        </div>

        <button @click="calculate" class="btn" :disabled="!canCalculate">
          Calculate
        </button>

        <div v-if="result" class="results">
          <h3>Results</h3>
          <div class="result-grid">
            <div class="result-item">
              <span class="result-label">Total Acres Needed:</span>
              <span class="result-value">{{ result.total_acres }}</span>
            </div>
            <div class="result-item">
              <span class="result-label">Football Fields:</span>
              <span class="result-value">{{ result.comparison_football_fields }}</span>
            </div>
            <div class="result-item">
              <span class="result-label">CO₂ Emissions/Year:</span>
              <span class="result-value">{{ result.estimated_co2_tons_per_year.toLocaleString() }} tons</span>
            </div>
            <div class="result-item">
              <span class="result-label">Housing Units:</span>
              <span class="result-value">{{ result.total_units_needed }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { calculateDensityImpact } from '@/utils/densityCalculations'

export default {
  name: 'DensityCalculator',
  data() {
    return {
      population: 10000,
      selectedPattern: '',
      patterns: [],
      result: null,
    }
  },
  computed: {
    canCalculate() {
      return this.population > 0 && this.selectedPattern !== ''
    },
  },
  async mounted() {
    await this.loadPatterns()
  },
  methods: {
    async loadPatterns() {
      try {
        const response = await fetch('/data/density-patterns.json')
        if (!response.ok) {
          throw new Error('Failed to load density patterns')
        }
        this.patterns = await response.json()
      } catch (error) {
        console.error('Error loading patterns:', error)
      }
    },
    calculate() {
      if (!this.canCalculate) return

      const selectedPatternData = this.patterns.find(
        p => p.id === this.selectedPattern
      )

      if (!selectedPatternData) {
        console.error('Selected pattern not found')
        return
      }

      try {
        const calculationResult = calculateDensityImpact(
          this.population,
          2.5, // people_per_unit
          selectedPatternData
        )

        // Map the result to match the template's expected field names
        this.result = {
          total_acres: calculationResult.total_acres,
          comparison_football_fields: calculationResult.football_fields,
          estimated_co2_tons_per_year: calculationResult.co2_tons_per_year,
          total_units_needed: calculationResult.total_units,
        }
      } catch (error) {
        console.error('Error calculating:', error)
      }
    },
  },
}
</script>

<style scoped>
.subtitle {
  color: var(--color-text-light);
  /* Mobile-first */
  font-size: 1rem;
  margin-bottom: 1.5rem;
  padding: 0 1rem;
  text-align: center;
}

.calculator {
  max-width: 600px;
  margin: 0 auto;
}

.input-group {
  margin-bottom: 1.25rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.95rem;
}

.input-group input,
.input-group select {
  width: 100%;
  /* Mobile: larger touch target */
  padding: 0.875rem;
  min-height: 44px;
  border: 1px solid #ddd;
  border-radius: 4px;
  /* Prevent iOS zoom */
  font-size: 16px;
}

.results {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid var(--color-primary);
}

.result-grid {
  display: grid;
  /* Mobile: single column */
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.result-item {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background-color: var(--color-background-alt);
  border-radius: 4px;
}

.result-label {
  font-size: 0.85rem;
  color: var(--color-text-light);
  margin-bottom: 0.25rem;
}

.result-value {
  font-size: 1.35rem;
  font-weight: bold;
  color: var(--color-primary);
}

/* Tablet and up */
@media (min-width: 768px) {
  .subtitle {
    font-size: 1.25rem;
    margin-bottom: 2rem;
  }

  .input-group {
    margin-bottom: 1.5rem;
  }

  .input-group label {
    font-size: 1rem;
  }

  .input-group input,
  .input-group select {
    padding: 0.75rem;
  }

  .results {
    margin-top: 2rem;
    padding-top: 2rem;
  }

  .result-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .result-value {
    font-size: 1.5rem;
  }

  .result-label {
    font-size: 0.9rem;
  }
}

/* Desktop - 4 columns if space allows */
@media (min-width: 1024px) {
  .result-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}
</style>
