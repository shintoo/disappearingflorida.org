<template>
  <div id="app">
    <nav class="main-nav" :class="{ 'is-transparent': isHomePage && !isScrolled, 'is-opaque': !isHomePage || isScrolled }">
      <div class="nav-container">
        <h1 class="site-title">
          <router-link to="/">Disappearing Florida</router-link>
        </h1>

        <!-- Hamburger button for mobile -->
        <button
          class="hamburger-btn"
          @click="mobileMenuOpen = !mobileMenuOpen"
          :aria-expanded="mobileMenuOpen"
          aria-label="Toggle navigation menu"
        >
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>

        <!-- Navigation menu with mobile toggle -->
        <ul class="nav-menu" :class="{ 'is-open': mobileMenuOpen }">
          <li><router-link to="/satellite-imagery" @click="closeMobileMenu">Satellite Imagery</router-link></li>
          <li><router-link to="/species" @click="closeMobileMenu">Impact</router-link></li>
          <li><router-link to="/density-calculator" @click="closeMobileMenu">Build Better</router-link></li>
          <li><router-link to="/about" @click="closeMobileMenu">About</router-link></li>
        </ul>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>

    <footer class="site-footer">
      <p>&copy; 2025 Disappearing Florida</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      mobileMenuOpen: false,
      isScrolled: false,
      isHomePage: true
    }
  },
  methods: {
    closeMobileMenu() {
      this.mobileMenuOpen = false
    },
    handleScroll() {
      // Only track scroll on home page
      if (this.isHomePage) {
        // Change to opaque after scrolling past hero (100vh)
        this.isScrolled = window.scrollY > window.innerHeight * 0.8
      }
    },
    updateHomePage() {
      this.isHomePage = this.$route.path === '/'
      // Reset scroll state when leaving home page
      if (!this.isHomePage) {
        this.isScrolled = false
      }
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
    this.updateHomePage()
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  watch: {
    $route() {
      this.closeMobileMenu()
      this.updateHomePage()
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
}

.main-nav {
  background-color: var(--color-primary);
  color: white !important;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: background-color 0.3s ease, box-shadow 0.3s ease,
              opacity 0.3s ease;
}

.main-nav.is-transparent {
  background-color: transparent;
  box-shadow: none;
}

.main-nav.is-opaque {
  background-color: var(--color-primary);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.site-title a {
  color: white;
  text-decoration: none;
  /* Mobile-first smaller */
  font-size: 1.25rem;
}

/* Hamburger button - mobile only */
.hamburger-btn {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 44px;
  height: 44px;
  padding: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 10;
}

.hamburger-line {
  width: 100%;
  height: 3px;
  background-color: white;
  border-radius: 2px;
  transition: all 0.3s ease;
  transform-origin: center;
}

/* Hamburger animation when open */
.hamburger-btn[aria-expanded="true"] .hamburger-line:nth-child(1) {
  transform: translateY(9px) rotate(45deg);
}

.hamburger-btn[aria-expanded="true"] .hamburger-line:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.hamburger-btn[aria-expanded="true"] .hamburger-line:nth-child(3) {
  transform: translateY(-9px) rotate(-45deg);
}

/* Mobile menu - hidden by default */
.nav-menu {
  list-style: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--color-primary);
  flex-direction: column;
  padding: 0;
  gap: 0;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  overflow: hidden;
  opacity: 0;
  transition: max-height 0.4s ease, opacity 0.3s ease, padding 0.4s ease, background-color 0.3s ease;
  z-index: 100;
}

.nav-menu.is-open {
  display: flex;
  max-height: 400px;
  opacity: 1;
  padding: 1rem 0;
}

.nav-menu li {
  width: 100%;
  opacity: 0;
  transform: translateX(-20px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

/* Staggered animation for menu items */
.nav-menu.is-open li {
  opacity: 1;
  transform: translateX(0);
}

.nav-menu.is-open li:nth-child(1) {
  transition-delay: 0.1s;
}

.nav-menu.is-open li:nth-child(2) {
  transition-delay: 0.15s;
}

.nav-menu.is-open li:nth-child(3) {
  transition-delay: 0.2s;
}

.nav-menu.is-open li:nth-child(4) {
  transition-delay: 0.25s;
}

.nav-menu a {
  color: white;
  text-decoration: none;
  transition: opacity 0.2s;
  display: block;
  padding: 1rem 1.5rem;
  min-height: 44px;
}

.nav-menu a:hover,
.nav-menu a.router-link-active {
  opacity: 1.0;
}

/* Tablet breakpoint - show horizontal menu */
@media (min-width: 768px) {
  .site-title a {
    font-size: 1.75rem;
  }

  .hamburger-btn {
    display: none;
  }

  .nav-menu {
    display: flex;
    flex-direction: row;
    position: static;
    box-shadow: none;
    gap: 5rem;
    padding: 0;
    opacity: 1.0;
    background: transparent;
    overflow: unset;
  }

  .nav-menu li {
    width: auto;
    opacity: 1.0;
  }

  .nav-menu a {
    padding: 0.5rem 0;
    min-height: auto;
    opacity: 0.8;
  }

  .nav-menu a:hover,
  .nav-menu a.router-link-active {
    opacity: 1.0;
  }
}

.main-content {
  min-height: calc(100vh - 200px);
}

.site-footer {
  background-color: var(--color-primary);
  color: white;
  text-align: center;
  padding: 2rem;
  height: 15rem;
  margin-top: 4rem;
}
</style>
