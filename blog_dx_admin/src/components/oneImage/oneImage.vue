<template>
  <div class="one-image">
    <img class="img" :src="src" alt="" />
    <div class="icons">
      <i class="el-icon-full-screen" @click="resizeClick" />
      <i class="el-icon-link" @click="copyClick" />
      <i class="el-icon-delete" @click="deleteClick" />
    </div>
  </div>
</template>

<script>
export default {
  name: "oneImage",
  props: {
    src: {
      type: String
    },
    index: {
      type: Number
    }
  },
  methods: {
    copyClick() {
      this.$copyText(this.src).then(
        () => {
          this.$message.success("复制链接成功！");
        },
        () => {
          this.$message.error("复制链接失败！");
        }
      );
    },
    deleteClick() {
      this.$emit("deleteClick", this.index);
    },
    resizeClick() {
      this.$emit("resizeClick", this.index);
    }
  }
};
</script>

<style lang="scss" scoped>
.one-image {
  display: inline-block;
  position: relative;
  width: 100%;
  height: auto;
  padding-bottom: 100%;
  border: 1px solid rgba(0, 0, 0, 0.08);
  .img {
    position: absolute;
    top: 1%;
    left: 50%;
    transform: translate3d(-50%, 0, 0);
    max-width: 98%;
    max-height: 98%;
  }
  .icons {
    display: flex;
    position: absolute;
    justify-content: space-around;
    bottom: 0;
    left: 0;
    padding: 4px 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.9);
    .icon {
      font-size: 28px;
      cursor: pointer;
      &:nth-child(1) {
        padding-top: 2px;
        font-size: 22px;
      }
    }
  }
}
</style>
