import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'simulations', component: () => import('./views/SimulationsList.vue') },
    { path: '/simulations/:id', name: 'simulation-detail', component: () => import('./views/SimulationDetail.vue') },
    { path: '/attempts/:id', name: 'attempt', component: () => import('./views/AttemptView.vue') },
    { path: '/attempts/:id/result', name: 'attempt-result', component: () => import('./views/ResultView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

export default router;
