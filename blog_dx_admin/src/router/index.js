import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  // mode: 'history',
  routes: [
    {
      path: "/",
      redirect: "/login"
    },
    {
      path: "/admin",
      component: () => import("@/views/admin/index"),
      redirect: "/admin/management",
      children: [
        {
          path: "management",
          component: () => import("@/views/admin/management")
        },
        {
          path: "newArticle",
          component: () => import("@/views/admin/newArticle")
        },
        {
          path: "modifyArticle",
          component: () => import("@/views/admin/modifyArticle")
        },
        {
          path: "imageManagement",
          component: () => import("@/views/admin/imageManagement")
        }
      ]
    },
    {
      path: "/login",
      component: () => import("@/views/login/login")
    },
    {
      path: "*",
      component: () => import("@/views/page404")
    }
  ]
});
