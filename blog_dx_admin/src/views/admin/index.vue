<template>
  <div class="admin-base">
    <el-menu :default-active="activeIndex" mode="horizontal" router>
      <el-menu-item index="/admin/management">
        <i class="el-icon-document"></i>
        <span>内容管理</span>
      </el-menu-item>
      <el-menu-item index="/admin/imageManagement">
        <i class="el-icon-picture-outline"></i>
        <span>图片管理</span>
      </el-menu-item>
      <el-menu-item index="/admin/newArticle">
        <i class="el-icon-plus"></i>
        <span>新增文章</span>
      </el-menu-item>
      <div class="user">
        <span class="user-name">Hi,{{ username }}</span>
        <span class="log-out" @click="logout">退出</span>
      </div>
    </el-menu>
    <router-view></router-view>
  </div>
</template>

<script>
import { Logout } from "@/api/login";
import { getUsername, removeUsername, removeToken } from "@/utils/app";
export default {
  data() {
    return {
      username: ""
    };
  },
  computed: {
    activeIndex() {
      return this.$route.path;
    }
  },
  methods: {
    logout() {
      Logout().then(() => {
        removeUsername();
        removeToken();
        this.$router.push({ path: "/login" });
      });
    }
  },
  created() {
    this.username = getUsername();
  }
};
</script>

<style lang="scss" scoped>
.admin-base {
  .user {
    float: right;
    padding-top: 30px;
    padding-right: 40px;
    .log-out {
      margin-left: 10px;
      text-decoration: underline;
      cursor: pointer;
    }
  }
}
</style>
