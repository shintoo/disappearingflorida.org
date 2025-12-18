<template>
  <div class="species-page">
    <h1>Affected Species</h1>
    <p class="subtitle">Wildlife impacted by Florida's habitat loss</p>

    <div class="card">
      <p class="placeholder-text">
        <strong>Coming Soon:</strong> Detailed profiles of Florida species affected by
        suburban sprawl, including population trends, habitat requirements, and conservation status.
      </p>

      <div class="feature-list">
        <h3>Featured Species Will Include:</h3>
        <ul>
          <li>Florida Panther</li>
          <li>West Indian Manatee</li>
          <li>Florida Scrub-Jay</li>
          <li>Gopher Tortoise</li>
          <li>Snail Kite</li>
          <li>And many more...</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SpeciesList',
}
</script>

<style scoped>
.subtitle {
  color: var(--color-text-light);
  /* Mobile-first */
  font-size: 1rem;
  margin-bottom: 1.5rem;
  text-align: center;
  padding: 0 1rem;
}

.placeholder-text {
  font-size: 1rem;
  padding: 1.5rem;
  background-color: #f0f8ff;
  border-left: 4px solid var(--color-primary);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.feature-list h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.feature-list ul {
  margin-left: 1.5rem;
  margin-top: 1rem;
  /* Mobile: single column */
  columns: 1;
}

.feature-list li {
  margin-bottom: 0.5rem;
  color: var(--color-text-light);
  font-size: 0.95rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .subtitle {
    font-size: 1.25rem;
    margin-bottom: 2rem;
  }

  .placeholder-text {
    font-size: 1.1rem;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .feature-list h3 {
    font-size: 1.5rem;
  }

  .feature-list ul {
    columns: 2;
    margin-left: 2rem;
  }

  .feature-list li {
    font-size: 1rem;
  }
}
</style>
