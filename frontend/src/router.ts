import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'courses', component: () => import('./views/CoursesList.vue') },
    { path: '/courses/new', name: 'course-new', component: () => import('./views/CourseCreate.vue') },
    { path: '/courses/:id/edit', name: 'course-edit', component: () => import('./views/CourseEditor.vue') },
    { path: '/source-sets', name: 'source-sets', component: () => import('./views/SourceSets.vue') },
    { path: '/audit', name: 'audit', component: () => import('./views/AuditView.vue') },
    { path: '/estudiante', name: 'student-home', component: () => import('./views/student/StudentHome.vue') },
    { path: '/estudiante/cursos/:id', name: 'student-course', component: () => import('./views/student/StudentCourse.vue') },
    { path: '/estudiante/cursos/:id/evaluacion', name: 'student-evaluation', component: () => import('./views/student/StudentEvaluation.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

export default router;
