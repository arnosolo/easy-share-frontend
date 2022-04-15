import { createRouter, createWebHashHistory} from "vue-router"

import FilePage from '../views/FilePage.vue'
import Setting from '../views/Setting.vue';
import Login from '../views/Login.vue';
import NotFound from '../views/NotFound.vue';

const routes = [
  { path: '/', component: FilePage },
  { path: '/setting', component: Setting },
  { path: '/login', component: Login },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export { router }