<template>
  <div class="home">
    <section class="hero">
      <div class="hero-content">
        <h1>Disappearing Florida</h1>
        <p class="hero-subtitle">
          Irresponsible development threatens to eliminate Florida's beautiful natural landscapes and the habitats of our wildlife.
        </p>
        <div class="hero-actions">
          <router-link to="/satellite-imagery" class="btn btn-secondary">See Timelapse</router-link>
        </div>
      </div>
      <div class="scroll-indicator">
        <span class="scroll-arrow">↓</span>
        <!---<span class="scroll-text">Scroll to</span>-->
      </div>
    </section>

    <section class="content-section">
      <div class="tools-preview">
        <h2 class="text-center mb-2">Interactive Tools</h2>
        <div class="tools-grid">
          <div class="tool-card">
            <h3>Satellite Timelapse</h3>
            <p>See decades of habitat transformation in Florida's most affected areas</p>
            <router-link to="/satellite-imagery" class="btn">Explore</router-link>
          </div>
          <div class="tool-card">
            <h3>Species Impact</h3>
            <p>Learn about wildlife affected by habitat loss</p>
            <router-link to="/species" class="btn">Discover</router-link>
          </div>
          <div class="tool-card">
            <h3>Build Better</h3>
            <p>Compare land use between sprawl and smarter development</p>
            <router-link to="/density-calculator" class="btn">Calculate</router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Home',
  mounted() {
    window.addEventListener('scroll', this.handleParallax)
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleParallax)
  },
  methods: {
    handleParallax() {
      const hero = this.$el.querySelector('.hero')
      if (hero) {
        const scrolled = window.pageYOffset
        // Move background at 0.5x speed (slower than scroll) for parallax effect
        hero.style.backgroundPositionY = `${scrolled * 0.5}px`
      }
    }
  }
}
</script>

<style scoped>
.home {
  margin: 0;
  padding: 0;
}

.hero {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  /* Dynamic viewport height for mobile */
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-image: url(/images/landing/landing-hero-desktop.jpg);
  color: white;
  padding: 0 1rem;

  /* Parallax background setup */
  background-position: center 0;
  background-repeat: no-repeat;
  background-size: cover;
  /* Ensures the image covers the whole container */
}

/* Mobile-specific background image */
@media (max-width: 767px) {
  .hero {
    background: url('/images/landing/landing-hero-mobile.jpg') no-repeat center center;
    background-size: cover;
    /* Add overlay to ensure text readability */
    position: relative;
  }

  .hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    /* Semi-transparent overlay */
    z-index: 0;
  }

  .hero-content {
    position: relative;
    z-index: 1;
  }

  .scroll-indicator {
    z-index: 1;
  }
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.hero h1 {
  /* Mobile-first: readable size */
  font-size: 1.75rem;
  margin-bottom: 0.75rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1rem;
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Scroll indicator */
.scroll-indicator {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  animation: bounce 2s infinite;
  cursor: pointer;
}

.scroll-arrow {
  font-size: 2rem;
  line-height: 1;
}

.scroll-text {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

@keyframes bounce {

  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateX(-50%) translateY(0);
  }

  40% {
    transform: translateX(-50%) translateY(-10px);
  }

  60% {
    transform: translateX(-50%) translateY(-5px);
  }
}

@media (min-width: 768px) {
  .scroll-indicator {
    bottom: 3rem;
  }
}

/* Content section with standard padding */
.content-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .hero-content {
    padding: 3rem 1.5rem;
  }

  .hero h1 {
    font-size: 2.75rem;
    margin-bottom: 1rem;
  }

  .hero-subtitle {
    font-size: 1.125rem;
    margin-bottom: 1.75rem;
  }

  .hero-actions {
    gap: 1rem;
  }

  .content-section {
    padding: 4rem 1.5rem;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .hero-content {
    padding: 4rem 2rem;
  }

  .hero h1 {
    font-size: 3.5rem;
  }

  .hero-subtitle {
    font-size: 1.25rem;
    margin-bottom: 2rem;
  }

  .content-section {
    padding: 5rem 2rem;
  }
}

.intro {
  display: grid;
  /* Mobile: single column */
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.tools-grid {
  display: grid;
  /* Mobile: single column */
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.tool-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.tool-card h3 {
  color: var(--color-primary);
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
}

.tool-card p {
  margin-bottom: 1.25rem;
  color: var(--color-text-light);
  font-size: 0.95rem;
}

/* Tablet: 2 columns where space allows */
@media (min-width: 768px) {
  .intro {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 3.5rem;
  }

  .tools-grid {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
  }

  .tool-card {
    padding: 2rem;
  }

  .tool-card h3 {
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  .tool-card p {
    margin-bottom: 1.5rem;
    font-size: 1rem;
  }
}

/* Desktop: enforce minimum column width */
@media (min-width: 1024px) {
  .intro {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    margin-bottom: 4rem;
  }

  .tools-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}
</style>
