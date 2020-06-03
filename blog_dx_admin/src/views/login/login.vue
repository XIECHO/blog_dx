<template>
  <div class="login-wrapper">
    <h1 class="login-title">管理后台登陆</h1>
    <el-form ref="login" :model="formItem" :rules="rules">
      <el-form-item prop="username">
        <el-input v-model="formItem.username" placeholder="用户名">
          <el-button slot="prepend" icon="el-icon-user"></el-button>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          type="password"
          v-model="formItem.password"
          placeholder="密码"
        >
          <el-button slot="prepend" icon="el-icon-lock"></el-button>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit('login')"
          >登录</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { Login } from "@/api/login";
import { setToken, setUsername } from "@/utils/app";
export default {
  data() {
    return {
      formItem: {
        username: "root",
        password: "12345a"
      },
      rules: {
        username: [
          {
            required: true,
            message: "请输入用户名",
            trigger: "blur"
          }
        ],
        password: [
          {
            required: true,
            message: "请输入密码",
            trigger: "blur"
          },
          {
            type: "string",
            min: 6,
            message: "长度在至少为6个字符",
            trigger: "blur"
          }
        ]
      }
    };
  },
  methods: {
    handleSubmit(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.login();
        } else {
          this.$message.error("格式错误");
        }
      });
    },
    login() {
      Login({
        username: this.formItem.username,
        password: this.formItem.password
      })
        .then(res => {
          let data = res.data;
          setToken(data.resData.token);
          setUsername(data.resData.username);
          this.$message({
            message: data.resMsg,
            type: "success"
          });
          this.$router.replace({ path: "/admin" });
        })
        .catch(err => {
          this.$message.error("登录失败! " + err.data.resMsg);
        });
    }
  }
};
</script>
<style lang="scss" scoped>
.login-wrapper {
  box-sizing: border-box;
  position: absolute;
  top: 100px;
  left: 50%;
  padding: 40px 40px;
  width: 500px;
  height: 350px;
  border-radius: 4px;
  margin-left: -250px;
  box-shadow: 0 0 10px #ccc;
  .login-title {
    margin-bottom: 40px;
  }
  .login-input {
    margin: 0 auto;
  }
}
</style>
