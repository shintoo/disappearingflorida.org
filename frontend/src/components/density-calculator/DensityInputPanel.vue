<template>
  <div class="density-input-panel">
    <div class="intro-text">
      <p>
        Below, you can control how many homes of each housing type are constructed in a new community. Adjust
        with the sliders to see how a community's design can significantly impact the amount of land destroyed.
      </p>
    </div>

    <ZoneSliders
      :modelValue="zones"
      @update:modelValue="$emit('update:zones', $event)"
    />
  </div>
</template>

<script>
import ZoneSliders from './ZoneSliders.vue';

export default {
  name: 'DensityInputPanel',
  components: {
    ZoneSliders
  },
  props: {
    zones: {
      type: Array,
      required: true
    }
  },
  emits: ['update:zones']
};
</script>

<style scoped>
.density-input-panel {
  padding: 0;
}

.intro-text {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.intro-text p {
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
  color: var(--color-text);
  font-size: 0.95rem;
}

.intro-text p:last-child {
  margin-bottom: 0;
  color: var(--color-text-light);
  font-size: 0.9rem;
}

.intro-text strong {
  color: var(--color-primary);
}
</style>
