<template>
  <div class="satellite-imagery-page">
    <!-- Location Selection Map -->

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="header">
      <FloridaMap v-if="availableLocations.length > 0" :locations="availableLocations"
        :current-location-id="currentLocationId" @location-selected="handleLocationSelected" />

      <div class="overview" v-if="location">
        <div>
          <h2>{{ location.name }}</h2>
        </div>

        <div class="overview-items">
          <div class="overview-item">
            <span class="overview-label">Counties</span>
            <span class="overview-value">{{ location.county }}</span>
          </div>
          <div class="overview-item">
            <span class="overview-label">Ecosystems</span>
            <span class="overview-value">{{ location.ecosystem_type }}</span>
          </div>
          <div class="overview-item">
            <span class="overview-label">Development Footprint</span>
            <span class="overview-value">{{ location.habitat_loss_acres.toLocaleString('en-US') }} acres</span>
          </div>
        </div>
        <p class="description">{{ location.description_full }}</p>
        <p class="habitat-loss">A total of over {{ location.habitat_loss_acres.toLocaleString('en-US') }} acres has been
          lost to development at
          this location over the past 20 years.</p>
      </div>
    </div>


    <div v-if="location">
      <div class="timeline-viewer">
        <!-- Image Display with Timeline Controls Overlay -->
        <div class="image-container">
          <div class="image-wrapper">
            <img v-if="currentTimePoint.image_url_mobile" :srcset="`
              ${currentTimePoint.image_url_mobile} 640w,
              ${currentTimePoint.image_url_tablet || currentTimePoint.image_url} 1024w,
              ${currentTimePoint.image_url_desktop || currentTimePoint.image_url} 1920w
            `" :sizes="`(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px`" :src="currentTimePoint.image_url"
              :alt="`Satellite imagery from ${currentTimePoint.date}`" class="satellite-image" />
            <img v-else :src="currentTimePoint.image_url" :alt="`Satellite imagery from ${currentTimePoint.date}`"
              class="satellite-image" />
          </div>

          <!-- Top Overlay: Date and Description -->
          <div class="image-info top-overlay">
            <div class="date-display">{{ formatDate(currentTimePoint.date) }}</div>
            <div class="description-display">{{ currentTimePoint.description }}</div>
          </div>

          <!-- Bottom Overlay: Timeline Controls -->
          <div class="timeline-controls-overlay" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
            <!-- Progress Bar Container -->
            <div class="progress-bar-container">
              <!-- Progress Bar Background -->
              <div class="progress-bar-background">
                <!-- Filled Progress -->
                <div class="progress-bar-filled" :style="{ width: `${progressPercentage}%` }"></div>

                <!-- Interactive Slider Overlay -->
                <input type="range" v-model.number="currentIndex" :min="0" :max="location.time_points.length - 1"
                  class="progress-slider" />

                <!-- Year Markers (visible when mouse is active) -->
                <div class="year-markers" :class="{ 'visible': !controlsHidden }">
                  <div v-for="(point, index) in location.time_points" :key="index" class="year-marker"
                    :style="{ left: `${(index / (location.time_points.length - 1)) * 100}%` }"
                    @click="currentIndex = index">
                    <div class="year-label">{{ point.year }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Playback Controls (icon-only, bottom left) -->
            <div class="playback-controls" :class="{ 'controls-hidden': controlsHidden }">
              <button @click="previousFrame" :disabled="currentIndex === 0" class="control-icon-btn"
                aria-label="Previous" title="Previous">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>
              <button @click="togglePlayback" class="control-icon-btn play-btn"
                :aria-label="isPlaying ? 'Pause' : 'Play'" :title="isPlaying ? 'Pause' : 'Play'">
                <svg v-if="!isPlaying && currentIndex !== lastIndex" xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <svg v-else-if="!isPlaying && currentIndex === lastIndex" xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              </button>
              <button @click="nextFrame" :disabled="currentIndex === location.time_points.length - 1"
                class="control-icon-btn" aria-label="Next" title="Next">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Impacted Species Highlight -->
      <div class="impacted-species">
        <h1>Who lived here?</h1>
        <div class="species-features">
          <div v-for="species in this.impactedSpecies" class="species-feature">
            <img :src="species.image_url" />
            <span>{{ species.name }}</span>
          </div>
        </div>
      </div>

      <!-- Before/After Image Slider -->
      <p v-if="location?.street_view" class="before-after-slider-description">{{ location.street_view.description }}</p>

      <div v-if="location?.street_view" class="before-after-slider">
        <div class="slider-container" @mousedown="startDragging" @mousemove="drag" @mouseup="stopDragging"
          @mouseleave="stopDragging" @touchstart="startDragging" @touchmove="drag" @touchend="stopDragging">
          <!-- After Image (full width, behind) -->
          <div class="image-layer after-image">
            <img :src="location.street_view.after.image_url" alt="After" />
            <div class="image-label after-label">{{ location.street_view.after.date }}</div>
          </div>

          <!-- Before Image (clipped by slider position) -->
          <div class="image-layer before-image" :style="{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }">
            <img :src="location.street_view.before.image_url" alt="Before" />
            <div class="image-label before-label">{{ location.street_view.before.date }}</div>
          </div>

          <!-- Slider Handle -->
          <div class="slider-handle" :style="{ left: `${sliderPosition}%` }">
            <div class="handle-line"></div>
            <div class="handle-grip">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" transform="translate(-5, 0)" />
                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"
                  transform="translate(30, 24) rotate(180)" />
              </svg>
            </div>
            <div class="handle-line"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FloridaMap from '../components/FloridaMap.vue';
import { fetchAllLocationsMetadata, fetchLocationById } from '../utils/locationsIndex.js';

export default {
  name: 'SatelliteImagery',
  components: {
    FloridaMap
  },
  props: {
    locationId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      location: null,
      species: null,
      availableLocations: [],
      currentLocationId: null,
      loading: true,
      error: null,
      currentIndex: 0,
      isPlaying: false,
      playbackInterval: null,
      controlsHidden: false,
      hideControlsTimeout: null,
      showYearLabels: false,
      // Before/After slider state
      sliderPosition: 50,
      isDragging: false,
      // Image preloading
      imagesPreloaded: false,
      preloadedImages: [],
    };
  },
  computed: {
    currentTimePoint() {
      return this.location?.time_points[this.currentIndex] || {};
    },
    lastIndex() {
      return this.location.time_points.length - 1
    },
    progressPercentage() {
      if (!this.location || this.location.time_points.length <= 1) return 0;
      return (this.currentIndex / (this.location.time_points.length - 1)) * 100;
    },
    impactedSpecies() {
      if (!this.location || !this.species) return [];

      // Filter the species list based on impacted species at this location
      return Object.fromEntries(
        Object.entries(this.species).filter(([key]) => this.location.impacted_species.includes(key))
      )
    }
  },
  methods: {
    async fetchAvailableLocations() {
      try {
        this.availableLocations = await fetchAllLocationsMetadata();
      } catch (err) {
        console.error('Error fetching available locations:', err);
      }
    },

    async fetchLocation(locationId) {
      try {
        this.loading = true;
        this.error = null;
        this.location = await fetchLocationById(locationId);
        this.currentLocationId = locationId;
        // Reset playback state when changing locations
        this.currentIndex = 0;
        this.stopPlayback();
        // Reset preload state
        this.imagesPreloaded = false;
        this.preloadedImages = [];
        // Start preloading images for this location
        this.preloadImages();
      } catch (err) {
        this.error = 'Failed to load location data. Please try again later.';
        console.error('Error fetching location:', err);
      } finally {
        this.loading = false;
      }
    },
    handleLocationSelected(locationId) {
      // Update route to the selected location
      this.$router.push({ name: 'SatelliteImageryLocation', params: { locationId } });
    },
    preloadImages() {
      if (!this.location || !this.location.time_points) return;

      // Preload all images in the timeline
      this.location.time_points.forEach((timePoint) => {
        // Preload the main image
        const img = new Image();
        img.src = timePoint.image_url;
        this.preloadedImages.push(img);

        // Preload responsive images if they exist
        if (timePoint.image_url_mobile) {
          const mobileImg = new Image();
          mobileImg.src = timePoint.image_url_mobile;
          this.preloadedImages.push(mobileImg);
        }
        if (timePoint.image_url_tablet) {
          const tabletImg = new Image();
          tabletImg.src = timePoint.image_url_tablet;
          this.preloadedImages.push(tabletImg);
        }
        if (timePoint.image_url_desktop) {
          const desktopImg = new Image();
          desktopImg.src = timePoint.image_url_desktop;
          this.preloadedImages.push(desktopImg);
        }
      });

      // Mark as preloaded once all image objects are created
      // (they will continue loading in the background)
      this.imagesPreloaded = true;
    },
    async fetchSpecies() {
      try {
        this.loading = true;
        this.error = null;
        const response = await fetch(`/data/species.json`);
        if (!response.ok) {
          throw new Error(`Error loading species information`);
        }
        this.species = await response.json();
      } catch (err) {
        this.error = 'Failed to load species data. Please try again later.';
        console.error('Error fetching species:', err);
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    nextFrame() {
      if (this.currentIndex < this.location.time_points.length - 1) {
        this.currentIndex++;
      } else if (this.isPlaying) {
        // Loop back to start when playing
        this.currentIndex = 0;
      }
    },
    previousFrame() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      }
    },
    togglePlayback() {
      if (this.isPlaying) {
        this.stopPlayback();
      } else if (this.currentIndex == this.location.time_points.length - 1) {
        this.currentIndex = 0;
        this.startPlayback();
      } else {
        this.startPlayback();
      }
    },
    startPlayback() {
      this.isPlaying = true;
      this.playbackInterval = setInterval(() => {
        if (this.currentIndex < this.location.time_points.length - 1) {
          this.nextFrame();
        } else {
          this.stopPlayback();
        }
      }, 500);
      // Start auto-hide timer when playback starts
      this.startHideControlsTimer();
    },
    stopPlayback() {
      this.isPlaying = false;
      if (this.playbackInterval) {
        clearInterval(this.playbackInterval);
        this.playbackInterval = null;
      }
      // Show controls when playback stops
      this.showControls();
    },
    handleMouseMove() {
      // Show controls on mouse move
      this.showControls();
      // Restart the hide timer if playing
      if (this.isPlaying) {
        this.startHideControlsTimer();
      }
    },
    handleMouseLeave() {
      // Hide controls immediately when mouse leaves if playing
      if (this.isPlaying) {
        this.controlsHidden = true;
        this.clearHideControlsTimer();
      }
    },
    showControls() {
      this.controlsHidden = false;
      this.clearHideControlsTimer();
    },
    startHideControlsTimer() {
      this.clearHideControlsTimer();
      // Hide controls after 2 seconds of inactivity
      this.hideControlsTimeout = setTimeout(() => {
        if (this.isPlaying) {
          this.controlsHidden = true;
        }
      }, 2000);
    },
    clearHideControlsTimer() {
      if (this.hideControlsTimeout) {
        clearTimeout(this.hideControlsTimeout);
        this.hideControlsTimeout = null;
      }
    },
    // Before/After slider methods
    startDragging(event) {
      this.isDragging = true;
      this.updateSliderPosition(event);
    },
    drag(event) {
      if (!this.isDragging) return;
      event.preventDefault();
      this.updateSliderPosition(event);
    },
    stopDragging() {
      this.isDragging = false;
    },
    updateSliderPosition(event) {
      const container = event.currentTarget;
      const rect = container.getBoundingClientRect();
      let clientX;

      // Handle both mouse and touch events
      if (event.type.startsWith('touch')) {
        if (event.touches.length === 0) return;
        clientX = event.touches[0].clientX;
      } else {
        clientX = event.clientX;
      }

      const x = clientX - rect.left;
      const percentage = (x / rect.width) * 100;

      // Clamp between 0 and 100
      this.sliderPosition = Math.max(0, Math.min(100, percentage));
    },
  },
  async mounted() {
    // Fetch available locations for the map
    await this.fetchAvailableLocations();

    // Determine which location to load
    const targetLocationId = this.locationId || this.$route.params.locationId || 'mtdora';

    // Fetch the location data and species data
    await Promise.all([
      this.fetchLocation(targetLocationId),
      this.fetchSpecies()
    ]);
  },
  beforeUnmount() {
    this.stopPlayback();
    this.clearHideControlsTimer();
  },
  watch: {
    // Watch for route changes to update the displayed location
    '$route.params.locationId': {
      handler(newLocationId) {
        if (newLocationId && newLocationId !== this.currentLocationId) {
          this.fetchLocation(newLocationId);
        }
      }
    }
  },
};
</script>

<style scoped>

h2 {
  font-size: 3rem;
}

.satellite-imagery-page {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 1rem;
}

.subtitle {
  color: var(--color-text-light);
  /* Mobile-first */
  font-size: 1rem;
  margin-bottom: 1.5rem;
  text-align: center;
  padding: 0 1rem;
}

.loading,
.error-message {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
}

.error-message {
  color: #d32f2f;
  background-color: #ffebee;
  border-radius: 8px;
}

.header {
  display: flex;
  flex-direction: column;
}

/* Overview items */
.overview-items {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.overview-item {
  width: 100%;
  height: 75px;
  display: flex;
  flex-direction: column;
  padding: 10px;
  margin: 5px;
  background-color: var(--color-background-alt);
  border-radius: 4px;
}

.overview-label {
  font-size: 0.85rem;
  color: var(--color-text-light);
  margin-bottom: 0.25rem;
  width: 100%;
}

.overview-value {
  font-weight: bold;
  color: var(--color-primary);
  align-self: flex-end;
  font-size: 1.25rem;
}

/* Timeline Viewer */
.timeline-viewer {
  margin: 0 auto;
}

/* Location Info */
.location-info h2 {
  margin: 0 0 0.75rem 0;
  color: var(--color-primary);
  font-size: 1.5rem;
}

.location-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.75rem;
  color: var(--color-text-light);
  font-size: 0.875rem;
}

.meta-item {
  display: inline-block;
}

.description {
  line-height: 1.6;
  color: var(--color-text);
  font-size: 0.95rem;
}

.habitat-loss {
  font-size: 1.2rem;
  text-align: center;
  margin: 3rem 0.5rem;
}

/* Image Container */
.image-container {
  position: relative;
  padding: 0 !important;
  overflow: hidden;
  border-radius: 16px;
}

.image-wrapper {
  width: 100%;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 9 / 16;
  min-height: 200px;
  max-height: 90vh;
}

.satellite-image {
  width: 100%;
  height: auto;
  display: block;
  /* Mobile: rotate 90 degrees and adjust sizing */
  transform: rotate(90deg);
  max-height: none;
  /* Make the rotated image fill the portrait container */
  height: 100%;
  width: auto;
  object-fit: container;
}

/* For some reason, the timelapse viewer and the "x acres has been lost" text
  is not wrapping/is stretching way beyond the viewport. Fix that so you can push
  your cool map pin selector thingy!!

/* Top Overlay: Date and Description */
.top-overlay {
  padding: 0.75rem 1rem;
  background: linear-gradient(to bottom,  rgba(0, 0, 0, 0.6) 0%, transparent 70%);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  color: white;
  z-index: 2;
}

.date-display {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
  line-height: 1.2;
  text-shadow: 0 0 5px black;
}

.description-display {
  display: none; /* Not necessary? */
  font-size: 0.8rem;
  opacity: 0.95;
  line-height: 1.3;
}

/* Bottom Overlay: Timeline Controls */
.timeline-controls-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.75rem 1rem 1rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 60%);  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Progress Bar Container */
.progress-bar-container {
  position: relative;
  opacity: 1;
  order: 2;
}

.progress-bar-background {
  position: relative;
  height: 5px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  cursor: pointer;
  overflow: visible;
}

.progress-bar-filled {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--color-highlight);
  border-radius: 3px;
  pointer-events: none;
  transition: width 0.1s ease-out;
}

/* Interactive Slider Overlay */
.progress-slider {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 20px;
  transform: translateY(-50%);
  margin: 0;
  padding: 0;
  cursor: pointer;
  opacity: 0;
  z-index: 2;
  -webkit-appearance: none;
  appearance: none;
}

.progress-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 0;
  height: 0;
}

.progress-slider::-moz-range-thumb {
  width: 0;
  height: 0;
  border: none;
}

/* Year Markers */
.year-markers {
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

.year-markers.visible {
  opacity: 1;
}

/* Hide all but first and last on mobile. Show all on desktop. */
.year-marker {
  position: absolute;
  pointer-events: auto;
  cursor: pointer;
  visibility: hidden;
}

.year-marker:hover,
.year-marker:first-child,
.year-marker:last-child {
  visibility: visible;
}

.year-marker:last-child {
  transform: translateX(-100%);
}

.year-marker:first-child {
  transform: translateX(0)
}


.year-label {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  text-align: left;
  white-space: nowrap;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  padding: 2px 4px;
  border-radius: 3px;
  transform: translateY(-20px);
}


/* Playback Controls */
.playback-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  opacity: 1;
  transition: opacity 0.3s ease-in-out;
  order: 1;
}

.playback-controls.controls-hidden {
  opacity: 0;
  pointer-events: none;
}

.control-icon-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #1a3a1b;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
}

.control-icon-btn svg {
  width: 20px;
  height: 20px;
}

.control-icon-btn:hover:not(:disabled) {
  background: white;
  transform: scale(1.1);
  filter: grayscale();
}

.control-icon-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.control-icon-btn:disabled:hover {
  transform: none;
}

/* Species feature */
.impacted-species {
  margin-top: 5rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}

.species-features {
  /* Mobile: horizontal scrolling carousel */
  display: flex;
  gap: 1.5rem;
  padding: 0 1rem;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  width: 100%;
  /* Hide scrollbar but keep functionality */
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE/Edge */
}

.species-features::-webkit-scrollbar {
  display: none;
  /* Chrome/Safari/Opera */
}

.species-feature {
  /* Mobile: each item is a carousel card */
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  scroll-snap-align: center;
  padding: 2rem 1rem;
  min-width: 200px;
}

.species-feature img {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 100%;
}

.species-feature span {
  margin-top: 15px;
  text-align: center;
}

/* Before/After Slider */
.before-after-slider {
  margin: 2rem auto;
}

.before-after-slider h3 {
  margin: 0 0 1rem 0;
  color: var(--color-primary);
  font-size: 1.25rem;
}

.slider-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  cursor: ew-resize;
  user-select: none;
  -webkit-user-select: none;
  border-radius: 16px;
  background: #000;
  aspect-ratio: 1 / 1;
}

.image-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.image-layer img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}

.after-image {
  z-index: 1;
}

.before-image {
  z-index: 2;
}

.image-label {
  position: absolute;
  top: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 16px;
  letter-spacing: 0.5px;
  z-index: 10;
}

.before-label {
  left: 1rem;
}

.after-label {
  right: 1rem;
}

.slider-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4px;
  background: white;
  z-index: 3;
  transform: translateX(-50%);
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.handle-line {
  flex: 1;
  width: 100%;
  background: white;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
}

.handle-grip {
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  color: var(--color-primary);
  flex-shrink: 0;
}

.handle-grip svg {
  width: 28px;
  height: 28px;
}

.before-after-slider-description {
  text-align: center;
  font-size: 1.2rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .header {
    width: 95%;
    flex-direction: row;
  }

  .overview {
    margin-right: 3rem;
  }

  .overview-items {
    flex-direction: row;
  }

  .overview-value {
    align-self: flex-start;
  }

  .slider-container {
    aspect-ratio: 16 / 9;
  }

  .subtitle {
    font-size: 1.25rem;
    margin-bottom: 2rem;
  }

  .card {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .location-info h2 {
    font-size: 1.75rem;
    margin-bottom: 1rem;
  }

  .location-meta {
    gap: 1.5rem;
    margin-bottom: 1rem;
    font-size: 0.95rem;
  }

  .description {
    font-size: 1rem;
  }

  .image-wrapper {
    min-height: 300px;
    /* Reset to landscape aspect ratio for tablet+ */
    aspect-ratio: auto;
  }

  .satellite-image {
    max-height: 500px;
    /* Reset rotation for tablet+ */
    transform: none;
    width: 100%;
    height: auto;
  }

  .top-overlay {
    padding: 1rem 1.5rem;
  }

  .date-display {
    font-size: 1.2rem;
    margin-bottom: 0.35rem;
  }

  .description-display {
    font-size: 0.9rem;
  }

  .timeline-controls-overlay {
    padding: 1rem 1.5rem 1.25rem;
  }

  .progress-bar-background {
    height: 6px;
  }

  .progress-bar-background:hover {
    height: 8px;
    transition: height 0.1s ease-in-out;
  }

  .year-markers {
    bottom: 14px;
  }

  .year-marker {
    visibility: visible;
    transform: translateX(-50%);
  }

  .year-label {
    font-size: 1rem;
  }

  .control-icon-btn {
    width: 44px;
    height: 44px;
  }

  .control-icon-btn svg {
    width: 22px;
    height: 22px;
  }

  .before-after-slider-description {
    margin: 5rem;
    font-size: 1.5rem;
  }

  .before-after-slider h3 {
    font-size: 1.5rem;
  }

  .image-label {
    font-size: 0.95rem;
    padding: 0.6rem 1.2rem;
  }

  .handle-grip {
    width: 56px;
    height: 56px;
  }

  .handle-grip svg {
    width: 32px;
    height: 32px;
  }

  /* Desktop: static row, no scrolling */
  .species-features {
    overflow-x: visible;
    scroll-snap-type: none;
    justify-content: center;
    flex-wrap: wrap;
  }

  .species-feature {
    scroll-snap-align: none;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .satellite-image {
    max-height: 600px;
  }

  .top-overlay {
    padding: 1.25rem 2rem;
  }

  .date-display {
    font-size: 1.4rem;
    margin-bottom: 0.5rem;
  }

  .description-display {
    font-size: 1rem;
  }

  .timeline-controls-overlay {
    padding: 1.25rem 2rem 1.5rem;
  }

  .progress-bar-background {
    height: 7px;
  }

  .progress-bar-background:hover {
    height: 10px;
  }

  .year-markers {
    bottom: 16px;
  }

  .year-label {
    font-size: 1rem;
    padding: 3px 6px;
  }

  .control-icon-btn {
    width: 48px;
    height: 48px;
  }

  .control-icon-btn svg {
    width: 24px;
    height: 24px;
  }

  .before-after-slider h3 {
    font-size: 1.75rem;
  }

  .image-label {
    font-size: 1rem;
    padding: 0.75rem 1.5rem;
  }

  .handle-grip {
    width: 64px;
    height: 64px;
  }

  .handle-grip svg {
    width: 36px;
    height: 36px;
  }
}
</style>
