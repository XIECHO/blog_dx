<template>
  <div class="image-management">
    <el-row :gutter="16">
      <el-col
        v-for="(item, index) in imgList"
        :key="index"
        :xs="12"
        :sm="6"
        :md="4"
        class="img-col"
      >
        <oneImage
          :src="item.url"
          :index="index"
          @deleteClick="deleteClick"
          @resizeClick="resizeClick"
        ></oneImage>
      </el-col>
    </el-row>

    <div class="page" v-if="total > 10">
      <el-pagination
        prev-text="上一页"
        next-text="下一页"
        :total="total"
        :page-size="pageSize"
        @on-change="handlePageChange"
      ></el-pagination>
    </div>

    <el-dialog :visible.sync="deleteModal" title="修改成功">
      <p>
        确定要删除图片 <b>{{ currentImgFileName }}</b> 么？
      </p>
      <p>由于使用第三方图床，该操作会有一定延迟。</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteModal = !deleteModal">取 消</el-button>
        <el-button type="primary" @click="modalClickOk">确 定</el-button>
      </span>
    </el-dialog>
    <transition name="fade">
      <div
        class="image-enlargement"
        v-show="isEnlargementShow"
        @click="isEnlargementShow = !isEnlargementShow"
      >
        <img class="img-current" :src="currentImgSrc" alt="" />
      </div>
    </transition>
  </div>
</template>

<script>
import oneImage from "@/components/oneImage/oneImage";
import { GetImgList, RemoveImg } from "@/api/img";

export default {
  name: "imageManagement",
  data() {
    return {
      page: 1,
      pageSize: 24,
      total: 0,
      imgList: [],
      currentImgFileName: "",
      currentImgSrc: "",
      currentImgId: "",
      deleteModal: false,
      isEnlargementShow: false
    };
  },
  /* eslint-disable */
  methods: {
    loadImgs() {
      let param = {
        page: this.page,
        pageSize: this.pageSize
      };
      GetImgList(param).then(res => {
        this.$nextTick(function() {
          this.total = res.data.resData.total;
          this.imgList = res.data.resData.list;
        });
      });
    },
    // 点击删除
    deleteClick(index) {
      let currentImgData = this.imgList[index];
      this.currentImgFileName = currentImgData.filename;
      this.currentImgId = currentImgData._id;
      this.deleteModal = true;
    },
    // 删除确认模态框
    modalClickOk() {
      this.deleteModal = !this.deleteModal;
      RemoveImg({ _id: this.currentImgId }).then(res => {
        this.$message.success("本地删除成功!");
        this.loadImgs();
      });
    },
    resizeClick(index) {
      this.currentImgSrc = this.imgList[index].url;
      this.isEnlargementShow = true;
    },
    handlePageChange(val) {
      this.page = val;
      this.loadImgs();
    }
  },
  created() {
    this.loadImgs();
  },
  components: {
    oneImage
  }
};
</script>

<style lang="scss" scoped>
.image-management {
  padding: 20px 10px;
  margin: 0 auto;
  max-width: 1264px;
  .img-col {
    margin-bottom: 10px;
  }
  .image-enlargement {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    .img-current {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate3d(-50%, -50%, 0);
      max-width: 100%;
      max-height: 100%;
    }
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s;
  }
  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }
}
</style>
