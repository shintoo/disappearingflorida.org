import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import TimeSlider from '../views/TimeSlider.vue'
import DensityCalculator from '../views/DensityCalculator.vue'
import SpeciesList from '../views/SpeciesList.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/time-slider',
    name: 'TimeSlider',
    component: TimeSlider,
  },
  {
    path: '/density-calculator',
    name: 'DensityCalculator',
    component: DensityCalculator,
  },
  {
    path: '/species',
    name: 'SpeciesList',
    component: SpeciesList,
  },
]

const router = createRouter({
  history: createWebHistory('/'),
  routes,
})

export default router
