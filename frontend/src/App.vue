<template>
  <div id="app">
    <nav class="main-nav">
      <div class="nav-container">
        <h1 class="site-title">
          <router-link to="/">Disappearing Florida</router-link>
        </h1>
        <ul class="nav-menu">
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/time-slider">Time Slider</router-link></li>
          <li><router-link to="/density-calculator">Density Calculator</router-link></li>
          <li><router-link to="/species">Species</router-link></li>
        </ul>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>

    <footer class="site-footer">
      <p>&copy; 2025 Disappearing Florida. An educational project about habitat loss and sustainable development.</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
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
  background-color: #2c5f2d;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.site-title a {
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 1.5rem;
}

.nav-menu a {
  color: white;
  text-decoration: none;
  transition: opacity 0.2s;
}

.nav-menu a:hover,
.nav-menu a.router-link-active {
  opacity: 0.8;
  text-decoration: underline;
}

.main-content {
  min-height: calc(100vh - 200px);
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.site-footer {
  background-color: #1a3a1b;
  color: white;
  text-align: center;
  padding: 2rem;
  margin-top: 4rem;
}
</style>
