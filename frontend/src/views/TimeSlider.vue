<template>
  <div class="time-slider-page">
    <h1>Satellite Viewer</h1>
    <p class="subtitle">See Florida's habitat transformation over time</p>

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
            :src="currentTimePoint.image_url"
            :alt="`Satellite imagery from ${currentTimePoint.date}`"
            class="satellite-image"
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
            {{ isPlaying ? '⏸ Pause' : '▶ Play' }}
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
  name: 'TimeSlider',
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
  },
  methods: {
    async fetchLocation() {
      try {
        this.loading = true;
        this.error = null;
        // For MVP, we're hardcoding the DeBary location
        const response = await axios.get('/api/locations/debary-ryanhomes-lennar');
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
          // Loop back to start
          this.currentIndex = 0;
        }
      }, 2000); // 2 seconds per frame
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
  font-size: 1.25rem;
  margin-bottom: 2rem;
  text-align: center;
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

.card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Location Info */
.location-info h2 {
  margin: 0 0 1rem 0;
  color: var(--primary-green);
}

.location-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1rem;
  color: var(--color-text-light);
  font-size: 0.95rem;
}

.meta-item {
  display: inline-block;
}

.description {
  line-height: 1.6;
  color: var(--color-text);
}

/* Image Container */
.image-container {
  position: relative;
  padding: 0;
  overflow: hidden;
}

.image-wrapper {
  width: 100%;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.satellite-image {
  width: 100%;
  height: auto;
  display: block;
  max-height: 600px;
  object-fit: contain;
}

.image-info {
  padding: 1rem 1.5rem;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  color: white;
}

.date-display {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.description-display {
  font-size: 1rem;
  opacity: 0.9;
}

/* Timeline Controls */
.timeline-controls {
  padding: 2rem 1.5rem;
  position: relative;
}

.slider-container {
  position: relative;
  padding-bottom: 3rem;
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

.timeline-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary-green);
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;
  z-index: 2;
}

.timeline-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.timeline-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary-green);
  cursor: pointer;
  border: none;
  transition: transform 0.2s;
  position: relative;
  z-index: 2;
}

.timeline-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
}

/* Timeline Markers */
.timeline-markers {
  position: absolute;
  top: 38px;
  left: 1.5rem;
  right: 1.5rem;
  height: 60px;
  pointer-events: none;
}

.marker {
  position: absolute;
  transform: translateX(-50%);
  cursor: pointer;
  transition: all 0.2s;
  pointer-events: auto;
}

.marker-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #bbb;
  margin: 0 auto 0.5rem;
  transition: all 0.2s;
}

.marker.active .marker-dot {
  background: var(--primary-green);
  width: 16px;
  height: 16px;
  box-shadow: 0 0 0 4px rgba(44, 95, 45, 0.2);
}

.marker:hover .marker-dot {
  background: var(--primary-green);
  transform: scale(1.2);
}

.marker-label {
  font-size: 0.85rem;
  font-weight: bold;
  color: #666;
  text-align: center;
  white-space: nowrap;
}

.marker.active .marker-label {
  color: var(--primary-green);
  font-size: 0.95rem;
}

/* Playback Controls */
.playback-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.control-btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: 2px solid var(--primary-green);
  background: white;
  color: var(--primary-green);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.control-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.control-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .location-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .date-display {
    font-size: 1.2rem;
  }

  .description-display {
    font-size: 0.9rem;
  }

  .control-btn {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
