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

      <!-- Image Display -->
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

        <!-- Image Info Overlay -->
        <div class="image-info">
          <div class="date-display">{{ formatDate(currentTimePoint.date) }}</div>
          <div class="description-display">{{ currentTimePoint.description }}</div>
        </div>
      </div>

      <!-- Timeline Slider -->
      <div class="timeline-controls card">
        <div class="slider-container">
          <input
            type="range"
            v-model.number="currentIndex"
            :min="0"
            :max="location.time_points.length - 1"
            class="timeline-slider"
          />
        </div>

        <!-- Timeline Markers -->
        <div class="timeline-markers">
          <div
            v-for="(point, index) in location.time_points"
            :key="index"
            class="marker"
            :class="{ active: index === currentIndex }"
            :style="{ left: `${(index / (location.time_points.length - 1)) * 100}%` }"
            @click="currentIndex = index"
          >
            <div class="marker-dot"></div>
            <div class="marker-label">{{ point.year }}</div>
          </div>
        </div>

        <!-- Playback Controls -->
        <div class="playback-controls">
          <button @click="previousFrame" :disabled="currentIndex === 0" class="control-btn">
            ← Previous
          </button>
          <button @click="togglePlayback" class="control-btn play-btn">
            {{ isPlaying ? '⏸ Pause' : (currentIndex == lastIndex ? '⟳ Replay' : '▶ Play' )}}
          </button>
          <button
            @click="nextFrame"
            :disabled="currentIndex === location.time_points.length - 1"
            class="control-btn"
          >
            Next →
          </button>
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
    };
  },
  computed: {
    currentTimePoint() {
      return this.location?.time_points[this.currentIndex] || {};
    },
    lastIndex() {
      return this.location.time_points.length - 1
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
    },
    stopPlayback() {
      this.isPlaying = false;
      if (this.playbackInterval) {
        clearInterval(this.playbackInterval);
        this.playbackInterval = null;
      }
    },
  },
  mounted() {
    this.fetchLocation();
  },
  beforeUnmount() {
    this.stopPlayback();
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
  /* Mobile: allow taller aspect ratio */
  min-height: 200px;
}

.satellite-image {
  width: 100%;
  height: auto;
  display: block;
  /* Mobile: allow more vertical space */
  max-height: 400px;
  object-fit: contain;
}

.image-info {
  padding: 0.75rem 1rem;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  color: white;
}

.date-display {
  font-size: 1.125rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.description-display {
  font-size: 0.875rem;
  opacity: 0.95;
}

/* Timeline Controls */
.timeline-controls {
  /* Mobile: compact padding */
  padding: 1.5rem 1rem;
  position: relative;
}

.slider-container {
  position: relative;
  padding-bottom: 2.5rem;
}

.timeline-slider {
  width: 100%;
  height: 5px;
  border-radius: 4px;
  background: #ddd;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

input[type="range"] {
  /* Required to allow styling the thumb in Webkit/Blink browsers */
  -webkit-appearance: none;
  /* Standard property for styling in compliant browsers */
  appearance: none;
  /* Optional: removes the focus outline for aesthetic purposes */
  outline: none;
}

/* Chrome, Safari, Edge, Opera (Webkit/Blink browsers) */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  /* Set width and height to 0 or a very small value to hide it */
  width: 0;
  height: 0;
  /* Alternatively, you can use display: none, but this can cause issues in some contexts */
}

/* Firefox */
input[type="range"]::-moz-range-thumb {
  /* Set width and height to 0 or a very small value to hide it */
  width: 0;
  height: 0;
  border: none;
  /* Removes the default grey border in Firefox */
}

/* Timeline Markers */
.timeline-markers {
  position: absolute;
  top: 32px;
  left: 1rem;
  right: 1rem;
  height: 50px;
  pointer-events: none;
}

.marker {
  position: absolute;
  transform: translateX(-50%);
  cursor: pointer;
  transition: all 0.2s;
  pointer-events: auto;
  /* Mobile: larger touch target */
  padding: 4px;
}

.marker-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #bbb;
  margin: 0 auto 0.4rem;
  transition: all 0.2s;
}

.marker.active .marker-dot {
  background: var(--color-primary);
  width: 14px;
  height: 14px;
  box-shadow: 0 0 0 3px rgba(44, 95, 45, 0.2);
}

.marker-label {
  font-size: 0.75rem;
  font-weight: bold;
  color: #666;
  text-align: center;
  white-space: nowrap;
}

.marker.active .marker-label {
  color: var(--color-primary);
  font-size: 0.85rem;
}

/* Playback Controls */
.playback-controls {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.control-btn {
  /* Mobile: touch-friendly sizing */
  padding: 0.875rem 1.25rem;
  min-height: 44px;
  font-size: 0.9rem;
  border: 2px solid var(--color-primary);
  background: white;
  color: var(--color-primary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  touch-action: manipulation;
}

.control-btn:hover:not(:disabled) {
  background: var(--color-primary);
  color: white;
}

.control-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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
  }

  .satellite-image {
    max-height: 500px;
  }

  .image-info {
    padding: 1rem 1.5rem;
  }

  .date-display {
    font-size: 1.35rem;
    margin-bottom: 0.4rem;
  }

  .description-display {
    font-size: 0.95rem;
  }

  .timeline-controls {
    padding: 2rem 1.5rem;
  }

  .slider-container {
    padding-bottom: 3rem;
  }
/*
  .timeline-slider::-webkit-slider-thumb {
    width: 20px;
    height: 20px;
  }

  .timeline-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  .timeline-slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
  }

  .timeline-slider::-moz-range-thumb:hover {
    transform: scale(1.2);
  }
*/
  .timeline-markers {
    top: 38px;
    left: 1.5rem;
    right: 1.5rem;
    height: 60px;
  }

  .marker-dot {
    width: 12px;
    height: 12px;
    margin-bottom: 0.5rem;
  }

  .marker.active .marker-dot {
    width: 16px;
    height: 16px;
    box-shadow: 0 0 0 4px rgba(44, 95, 45, 0.2);
  }

  .marker:hover .marker-dot {
    background: var(--color-primary);
    transform: scale(1.2);
  }

  .marker-label {
    font-size: 0.85rem;
  }

  .marker.active .marker-label {
    font-size: 0.95rem;
  }

  .playback-controls {
    gap: 1rem;
  }

  .control-btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }

  .control-btn:hover:not(:disabled) {
    transform: translateY(-2px);
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .satellite-image {
    max-height: 600px;
  }

  .date-display {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .description-display {
    font-size: 1rem;
  }
}
</style>
