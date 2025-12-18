<template>
  <div class="home">
    <section class="hero">
      <h1>Florida's Disappearing Habitats</h1>
      <p class="hero-subtitle">
        Visualizing the impact of suburban sprawl on Florida's unique ecosystems
      </p>
      <div class="hero-actions">
        <router-link to="/time-slider" class="btn">Explore Time-Lapse</router-link>
        <router-link to="/density-calculator" class="btn btn-secondary">Try Density Calculator</router-link>
      </div>
    </section>

    <section class="intro">
      <div class="card">
        <h2>The Problem</h2>
        <p>
          Florida's unique ecosystems—home to endangered panthers, manatees, and scrub-jays—are
          disappearing under suburban sprawl. But this isn't inevitable.
        </p>
      </div>

      <div class="card">
        <h2>The Solution</h2>
        <p>
          The same population can be housed with dramatically less habitat destruction through
          higher-density, walkable development. Better neighborhoods, preserved nature.
        </p>
      </div>
    </section>

    <section class="tools-preview">
      <h2 class="text-center mb-2">Interactive Tools</h2>
      <div class="tools-grid">
        <div class="tool-card">
          <h3>Satellite Time-Slider</h3>
          <p>See decades of habitat transformation in Florida's most affected areas</p>
          <router-link to="/time-slider" class="btn">Explore</router-link>
        </div>
        <div class="tool-card">
          <h3>Density Calculator</h3>
          <p>Compare land use between sprawl and compact development</p>
          <router-link to="/density-calculator" class="btn">Calculate</router-link>
        </div>
        <div class="tool-card">
          <h3>Species Impact</h3>
          <p>Learn about wildlife affected by habitat loss</p>
          <router-link to="/species" class="btn">Discover</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Home',
}
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #2c5f2d 0%, #1a3a1b 100%);
  color: white;
  border-radius: 8px;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.intro {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.tool-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
}

.tool-card h3 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.tool-card p {
  margin-bottom: 1.5rem;
  color: var(--color-text-light);
}
</style>
