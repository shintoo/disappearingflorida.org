import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import SatelliteImagery from '../views/SatelliteImagery.vue'
import DensityCalculator from '../views/DensityCalculator.vue'
import SpeciesList from '../views/SpeciesList.vue'
import About from '../views/About.vue'
import TakeAction from '../views/TakeAction.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/satellite-imagery',
    name: 'SatelliteImagery',
    component: SatelliteImagery,
  },
  {
    path: '/satellite-imagery/:locationId',
    name: 'SatelliteImageryLocation',
    component: SatelliteImagery,
    props: true
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
  {
    path: '/about',
    name: 'About',
    component: About,
  },
  {
    path: '/take-action',
    name: 'TakeAction',
    component: TakeAction,
  },
]

const router = createRouter({
  history: createWebHistory('/'),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return {
      top: 0
    }
  }
})

export default router
