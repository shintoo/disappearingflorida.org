<template>
  <div class="cta-section">
    <div class="cta-content">
      <h2 class="cta-heading">Ready to Make a Difference?</h2>
      <p class="cta-text">
        Habitat destruction doesn't have to be inevitable. Learn how policy changes and smart development can protect Florida's remaining ecosystems.
      </p>
      <router-link to="/take-action" class="btn solid">
        <b>Take Action</b>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CallToAction'
}
</script>

<style scoped>
/* Call to Action Section */
.cta-section {
  padding: 3rem 1.5rem;
  border-radius: 16px;
  text-align: center;
}

.cta-content {
  max-width: 700px;
  margin: 0 auto;
}

.cta-heading {
  margin: 0 0 1rem 0;
  font-size: 2rem;
}

.cta-text {
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0 0 2rem 0;
}

@media (min-width: 768px) {
  .cta-section {
    padding: 4rem 2rem;
  }

  .cta-heading {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
  }

  .cta-text {
    font-size: 1.2rem;
    margin-bottom: 2.5rem;
  }
}

@media (min-width: 1024px) {
  .cta-section {
    padding: 5rem 3rem;
  }

  .cta-heading {
    font-size: 3rem;
  }

  .cta-text {
    font-size: 1.3rem;
  }
}
</style>
