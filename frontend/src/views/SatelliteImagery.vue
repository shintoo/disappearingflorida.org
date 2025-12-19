<template>
  <div class="satellite-imagery-page">
    <div v-if="loading" class="loading">
      Loading location data...
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="location" class="timeline-viewer">
      <!-- Location Info -->
      <div class="location-info card">
        <h2>{{ location.name }}</h2>
        <div class="location-meta">
          <span class="meta-item"><strong>County:</strong> {{ location.county }}</span>
          <span class="meta-item"><strong>Ecosystem:</strong> {{ location.ecosystem_type }}</span>
          <span class="meta-item" v-if="location.habitat_loss_acres">
            <strong>Habitat Lost:</strong> ~{{ location.habitat_loss_acres }} acres
          </span>
        </div>
        <p class="description">{{ location.description_full }}</p>
      </div>

      <!-- Image Display with Timeline Controls Overlay -->
      <div class="image-container card">
        <div class="image-wrapper">
          <img
            v-if="currentTimePoint.image_url_mobile"
            :srcset="`
              ${currentTimePoint.image_url_mobile} 640w,
              ${currentTimePoint.image_url_tablet || currentTimePoint.image_url} 1024w,
              ${currentTimePoint.image_url_desktop || currentTimePoint.image_url} 1920w
            `"
            :sizes="`(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px`"
            :src="currentTimePoint.image_url"
            :alt="`Satellite imagery from ${currentTimePoint.date}`"
            class="satellite-image"
            loading="lazy"
          />
          <img
            v-else
            :src="currentTimePoint.image_url"
            :alt="`Satellite imagery from ${currentTimePoint.date}`"
            class="satellite-image"
            loading="lazy"
          />
        </div>

        <!-- Top Overlay: Date and Description -->
        <div class="image-info top-overlay">
          <div class="date-display">{{ formatDate(currentTimePoint.date) }}</div>
          <div class="description-display">{{ currentTimePoint.description }}</div>
        </div>

        <!-- Bottom Overlay: Timeline Controls -->
        <div
          class="timeline-controls-overlay"
          @mousemove="handleMouseMove"
          @mouseleave="handleMouseLeave"
        >
          <!-- Progress Bar Container -->
          <div
            class="progress-bar-container"
          >
            <!-- Progress Bar Background -->
            <div class="progress-bar-background">
              <!-- Filled Progress -->
              <div
                class="progress-bar-filled"
                :style="{ width: `${progressPercentage}%` }"
              ></div>

              <!-- Interactive Slider Overlay -->
              <input
                type="range"
                v-model.number="currentIndex"
                :min="0"
                :max="location.time_points.length - 1"
                class="progress-slider"
              />

              <!-- Year Markers (visible when mouse is active) -->
              <div class="year-markers" :class="{ 'visible': !controlsHidden }">
                <div
                  v-for="(point, index) in location.time_points"
                  :key="index"
                  class="year-marker"
                  :style="{ left: `${(index / (location.time_points.length - 1)) * 100}%` }"
                  @click="currentIndex = index"
                >
                  <div class="year-label">{{ point.year }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Playback Controls (icon-only, bottom left) -->
          <div
            class="playback-controls"
            :class="{ 'controls-hidden': controlsHidden }"
          >
            <button
              @click="previousFrame"
              :disabled="currentIndex === 0"
              class="control-icon-btn"
              aria-label="Previous"
              title="Previous"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>
            <button
              @click="togglePlayback"
              class="control-icon-btn play-btn"
              :aria-label="isPlaying ? 'Pause' : 'Play'"
              :title="isPlaying ? 'Pause' : 'Play'"
            >
              <svg v-if="!isPlaying && currentIndex !== lastIndex" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <svg v-else-if="!isPlaying && currentIndex === lastIndex" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            </button>
            <button
              @click="nextFrame"
              :disabled="currentIndex === location.time_points.length - 1"
              class="control-icon-btn"
              aria-label="Next"
              title="Next"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SatelliteImagery',
  data() {
    return {
      location: null,
      loading: true,
      error: null,
      currentIndex: 0,
      isPlaying: false,
      playbackInterval: null,
      controlsHidden: false,
      hideControlsTimeout: null,
      showYearLabels: false,
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
    }
  },
  methods: {
    async fetchLocation() {
      try {
        this.loading = true;
        this.error = null;
        // For MVP, we're hardcoding the DeBary/Mt Dora location
        const response = await axios.get('/api/locations/mtdora');
        this.location = response.data;
      } catch (err) {
        this.error = 'Failed to load location data. Please try again later.';
        console.error('Error fetching location:', err);
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
  },
  mounted() {
    this.fetchLocation();
  },
  beforeUnmount() {
    this.stopPlayback();
    this.clearHideControlsTimer();
  },
};
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

.timeline-viewer {
  max-width: 1200px;
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

/* Image Container */
.image-container {
  position: relative;
  padding: 0 !important;
  overflow: hidden;
}

.image-wrapper {
  width: 100%;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Mobile: portrait aspect ratio for rotated images */
  aspect-ratio: 9 / 16;
  min-height: 200px;
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
  object-fit: contain;
}

/* Top Overlay: Date and Description */
.top-overlay {
  padding: 0.75rem 1rem;
  background: linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.3) 85%, transparent 100%);
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
}

.description-display {
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
  background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.3) 85%, transparent 100%);
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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
  bottom: 12px;
  left: 0;
  right: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

.year-markers.visible {
  opacity: 1;
}

.year-marker {
  position: absolute;
  transform: translateX(-50%);
  pointer-events: auto;
  cursor: pointer;
}

.year-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  text-align: center;
  white-space: nowrap;
  text-shadow: 0 1px 3px rgba(0,0,0,0.8);
  padding: 2px 4px;
  background: rgba(0,0,0,0.6);
  border-radius: 3px;
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
}

.control-icon-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.control-icon-btn:disabled:hover {
  transform: none;
}

/* Tablet and up */
@media (min-width: 768px) {
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

  .year-label {
    font-size: 0.75rem;
  }

  .control-icon-btn {
    width: 44px;
    height: 44px;
  }

  .control-icon-btn svg {
    width: 22px;
    height: 22px;
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
    font-size: 0.8rem;
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
}
</style>
