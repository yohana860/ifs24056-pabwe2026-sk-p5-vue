import { defineStore } from "pinia"; import { login as loginApi,register as registerApi } from "../api/authApi"; import { putAccessToken } from "../../../helpers/apiHelper";
export const useAuthStore=defineStore("auth",{state:()=>({user:null,isAuthLogin:false,isAuthRegister:false}),getters:{isLoggedIn:()=>!!localStorage.getItem("access_token")},actions:{
async login(data){this.isAuthLogin=true;try{const r=await loginApi(data);const token=r.data?.token||r.token||r.data?.access_token; if(token)putAccessToken(token);this.user=r.data?.user||r.user||null;return r}finally{this.isAuthLogin=false}},
async register(data){this.isAuthRegister=true;try{return await registerApi(data)}finally{this.isAuthRegister=false}},
logout(){putAccessToken("");this.user=null;location.href="/auth/login"}}});