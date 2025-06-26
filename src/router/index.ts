import { createRouter, createWebHistory } from 'vue-router'
import CharacterSelectView from "@/views/CharacterSelectView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: CharacterSelectView,
    },
  ],
})

export default router
