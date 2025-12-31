<template>
  <div class="density-results" v-if="results">
    <h3>Land Impact</h3>
    <p class="results-intro">
      To house 250 units with this mix, you would need:
    </p>

    <div class="results-grid">
      <div class="result-card">
        <div class="result-icon">🌳</div>
        <div class="result-content">
          <span class="result-value">{{ formatNumber(results.total_acres) }}</span>
          <span class="result-label">Acres of Land</span>
        </div>
      </div>

      <div class="result-card">
        <div class="result-icon">🏈</div>
        <div class="result-content">
          <span class="result-value">{{ formatNumber(results.football_fields) }}</span>
          <span class="result-label">Football Fields</span>
        </div>
      </div>
    </div>

    <div class="comparison-text">
      <p>
        <strong>{{ efficiencyDescription }}</strong>
      </p>
      <p class="comparison-detail">
        {{ comparisonText }}
      </p>
    </div>

    <div class="breakdown-toggle">
      <button @click="showBreakdown = !showBreakdown" class="toggle-btn">
        {{ showBreakdown ? 'Hide' : 'Show' }} Breakdown by Type
      </button>
    </div>

    <div v-if="showBreakdown && results.breakdown" class="zone-breakdown">
      <div
        v-for="zone in results.breakdown"
        :key="zone.pattern_name"
        class="breakdown-row"
      >
        <span class="breakdown-name">{{ zone.pattern_name }}</span>
        <span class="breakdown-units">{{ formatNumber(zone.total_units) }} units</span>
        <span class="breakdown-acres">{{ zone.total_acres }} acres</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'DensityResults',
  props: {
    results: {
      type: Object,
      default: null
    }
  },
  setup(props) {
    const showBreakdown = ref(false);

    const formatNumber = (num) => {
      if (num == null) return '—';
      return num.toLocaleString();
    };

    // Calculate efficiency rating based on acres needed
    // Reference points: 100% sprawl = ~40 acres, 100% high-rise = ~0.8 acres
    const efficiencyScore = computed(() => {
      if (!props.results) return 0;
      const acres = props.results.total_acres;
      // Score from 0 (sprawl) to 100 (high-rise)
      // 40 acres = 0%, 0.8 acres = 100%
      const score = Math.max(0, Math.min(100, 100 - ((acres - 0.8) / (40 - 0.8)) * 100));
      return Math.round(score);
    });

    const efficiencyDescription = computed(() => {
      const score = efficiencyScore.value;
      if (score >= 80) return 'Highly Efficient';
      if (score >= 60) return 'Moderately Efficient';
      if (score >= 40) return 'Less Efficient';
      if (score >= 20) return 'Low Efficiency';
      return 'Very Low Efficiency';
    });

    const comparisonText = computed(() => {
      if (!props.results) return '';
      const acres = props.results.total_acres;

      if (acres < 5) {
        return 'This dense mix preserves significantly more natural habitat compared to suburban sprawl.';
      } else if (acres < 15) {
        return 'This moderate density saves substantial land compared to traditional suburban development.';
      } else if (acres < 30) {
        return 'This lower density consumes considerably more land than denser alternatives.';
      } else {
        return 'This sprawling pattern consumes dramatically more land, destroying much more habitat.';
      }
    });

    return {
      showBreakdown,
      formatNumber,
      efficiencyScore,
      efficiencyDescription,
      comparisonText
    };
  }
};
</script>

<style scoped>
.density-results {
  padding: 1rem 0;
}

.density-results h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: var(--color-text);
}

.results-intro {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: var(--color-text-light);
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.result-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  background: var(--color-background-alt);
  border-radius: 8px;
  border-left: 3px solid var(--color-primary);
}

.result-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.result-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
}

.result-label {
  font-size: 0.75rem;
  color: var(--color-text-light);
}

.comparison-text {
  margin-bottom: 1.25rem;
  padding: 1rem;
  background: var(--color-background-alt);
  border-radius: 8px;
  border-left: 3px solid var(--color-primary);
}

.comparison-text p {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: var(--color-text);
}

.comparison-text p:last-child {
  margin-bottom: 0;
}

.comparison-detail {
  font-size: 0.85rem;
  color: var(--color-text-light);
  line-height: 1.5;
}

.breakdown-toggle {
  margin-bottom: 1rem;
}

.toggle-btn {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  background: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: var(--color-primary);
  color: white;
}

.zone-breakdown {
  background: var(--color-background-alt);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.25rem;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.85rem;
}

.breakdown-row:last-child {
  border-bottom: none;
}

.breakdown-name {
  flex: 1;
  color: var(--color-text);
}

.breakdown-units,
.breakdown-acres {
  color: var(--color-text-light);
  margin-left: 1rem;
}

@media (min-width: 768px) {
  .results-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .result-card {
    flex-direction: row;
    padding: 1rem;
  }

  .result-value {
    font-size: 1.5rem;
  }
}
</style>
