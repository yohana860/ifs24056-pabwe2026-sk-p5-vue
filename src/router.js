import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "./features/auth/pages/LoginPage.vue";
import RegisterPage from "./features/auth/pages/RegisterPage.vue";
import HomePage from "./features/aucations/pages/HomePage.vue";
import DetailPage from "./features/aucations/pages/DetailPage.vue";
import ProfilePage from "./features/users/pages/ProfilePage.vue";
import UsersPage from "./features/users/pages/UsersPage.vue";
import NotFoundPage from "./features/common/pages/NotFoundPage.vue";

const router=createRouter({history:createWebHistory(),routes:[
 {path:"/auth/login",component:LoginPage},{path:"/auth/register",component:RegisterPage},
 {path:"/",component:HomePage},{path:"/aucations/:aucationId",component:DetailPage},
 {path:"/users",component:UsersPage},{path:"/profile",component:ProfilePage},
 {path:"/:pathMatch(.*)*",component:NotFoundPage}
]});
router.beforeEach((to)=>{const token=localStorage.getItem("access_token"); if(to.path.startsWith("/auth")&&token)return "/"; if(!to.path.startsWith("/auth")&&!token)return "/auth/login";});
export default router;