import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DetalleView from '../views/DetalleView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/lugar/:id', component: DetalleView }
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})
