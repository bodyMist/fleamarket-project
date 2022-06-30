import Vue from "vue";
import VueRouter from "vue-router";
// import Home from "../views/Home.vue";
import Enroll from "../views/Enroll.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Enroll",
    component: Enroll,
  },
  {
    path: "/showDetail/:id&:publisher&:author&:title",
    name: "showDetail",
    component: () => import("@/views/showDetailAdmin.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
