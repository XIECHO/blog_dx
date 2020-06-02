<template>
  <div class="editor">
    <el-form :inline="true" class="editor-row">
      <el-form-item label="文章标题：">
        <el-input
          placeholder="文章标题..."
          class="title-input"
          v-model="title"
        ></el-input>
      </el-form-item>
      <el-form-item label="添加标签：">
        <el-input placeholder="标签..." class="title-input" v-model="newTag">
          <el-button
            slot="append"
            type="primary"
            icon="el-icon-plus"
            @click="handleAddTag"
          ></el-button>
        </el-input>
      </el-form-item>
    </el-form>

    <el-row class="editor-row">
      <el-col>
        <span>文章标签：</span>
        <el-tag
          closable
          type="info"
          size="mini"
          v-for="(tag, index) in tags"
          :key="index"
          @close="handleDeleteTag(index)"
          >{{ tag }}</el-tag
        >
      </el-col>
    </el-row>

    <el-row class="editor-row" :gutter="30">
      <el-col :span="12" class="content-md">
        <el-input
          type="textarea"
          class="content-textarea"
          placeholder="正文"
          v-model="mdContent"
          ref="mdContent"
        ></el-input>
        <div class="img-upload">
          <i
            class="el-icon-picture"
            v-show="!isUploadShow"
            @click="isUploadShow = true"
          ></i>
          <i
            class="el-icon-close"
            v-show="isUploadShow"
            @click="isUploadShow = false"
          ></i>
          <!-- <el-upload
            class="upload-demo"
            drag
            action="https://jsonplaceholder.typicode.com/posts/"
            multiple
            v-show="isUploadShow"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
          </el-upload> -->

          <div class="img-form" v-show="isUploadShow" @click="uploadImgClick">
            <input
              class="img-input"
              type="file"
              ref="imgInput"
              @change="uploadImg"
            />
            <div class="img-content">
              <div class="text">点击或者拖拽上传图片</div>
              <i class="el-icon-upload"></i>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="content-show" v-html="htmlText" ref="htmlContent"></div>
      </el-col>
    </el-row>

    <el-row class="editor-row" :gutter="30">
      <el-col>
        <span class="text title-text">文章摘要：</span>
        <el-input
          class="digest-textarea"
          :rows="3"
          placeholder="文章摘要..."
          type="textarea"
          v-model="abstract"
        />
      </el-col>
    </el-row>

    <div class="editor-row">
      <el-button v-if="isNew" type="success" @click="handleSendArticle(0)"
        >公开发布</el-button
      >
      <el-button v-if="isNew" type="success" @click="handleSendArticle(1)"
        >私密发布</el-button
      >
      <el-button v-if="!isNew" type="success" @click="handleChangeArticle()"
        >发布修改</el-button
      >
    </div>

    <el-dialog :visible.sync="showModal" title="修改成功">
      <p>是否返回【内容管理页面】？</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showModal = !showModal">取 消</el-button>
        <el-button type="primary" @click="modalClickOk">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="本地存档"
      :visible.sync="showLocalStorageModal"
      width="30%"
    >
      <p>检测到有未发布的本地存档，是否恢复存档继续上次的编辑？</p>
      <p>ps:取消则会删除本地存档!</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="modalLocalStorageClickCancel">取 消</el-button>
        <el-button type="primary" @click="modalLocalStorageClickOk"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Marked from "marked";
import highlight from "highlight.js";
import * as qiniu from "qiniu-js";
import { GetQiniuToken, Domain, config } from "@/api/qiniu";
import { SaveImg } from "@/api/img";
import { SaveArticle, ChangeArticle, GetArticle } from "@/api/articleEditor";

export default {
  props: {
    isNew: {
      type: Boolean
    },
    articleId: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      title: "",
      tags: [],
      newTag: "",
      mdContent: "",
      abstract: "",
      isUploadShow: false,
      showModal: false,
      showLocalStorageModal: false,
      form: {},
      timer: null,
      catalog: [],
      content: ""
    };
  },
  methods: {
    handleDeleteTag(index) {
      this.tags.splice(index, 1);
    },
    handleAddTag() {
      if (!this.newTag.length) {
        this.$message.warning("拒绝添加空标签！");
        return;
      }
      if (this.tags.includes(this.newTag)) {
        this.$message.warning("拒绝添加重复标签！");
        return;
      }
      this.tags.push(this.newTag);
      this.newTag = "";
    },
    setLocalStorage() {
      let articleData = {
        title: this.title,
        tags: this.tags,
        abstract: this.abstract,
        mdContent: this.mdContent
      };
      window.localStorage.setItem("_article", JSON.stringify(articleData));
    },
    createCatalog() {
      let tree = [];
      const title = { H1: 1, H2: 1, H3: 1, H4: 1, H5: 1 };
      traverseNode(this.$refs["htmlContent"]);

      function traverseNode(node) {
        let tag = node.tagName,
          children = node.children;

        if (title[tag]) {
          let id = tag + "-" + title[tag];
          tree.push({
            lev: parseInt(tag.slice(1)),
            text: node.innerText,
            id: id
          });
          node.setAttribute("id", id);
          title[tag]++;
        }
        for (let i = 0, len = children.length; i < len; i++) {
          traverseNode(children[i]);
        }
      }

      this.catalog = tree;
      this.content = this.$refs["htmlContent"].innerHTML;
    },
    validateForm(data) {
      const list = [
        { type: "title", msg: "还没写标题呢！" },
        { type: "tags", msg: "不加标签怎么归档？" },
        { type: "content", msg: "正文都没有发个啥！！" },
        { type: "abstract", msg: "加上摘要首页才好看啊！" }
      ];
      for (let i = 0; i < list.length; i++) {
        let type = list[i].type;
        if (!data[type].length) {
          this.$message.error(list[i].msg);
          return false;
        }
      }
      return true;
    },
    clearForm() {
      this.title = "";
      this.mdContent = "";
      this.tags = [];
      this.abstract = "";
    },
    handleSendArticle(type) {
      this.setLocalStorage();
      this.createCatalog();
      let time = new Date().getTime();
      let articleData = {
        title: this.title,
        date: time,
        lastDate: time,
        tags: this.tags,
        readCount: 0,
        abstract: this.abstract,
        content: this.content,
        mdContent: this.mdContent,
        type: type,
        catalog: this.catalog
      };
      if (!this.validateForm(articleData)) {
        return;
      }
      SaveArticle(articleData)
        .then(res => {
          this.$message.success(res.data.resMsg);
          this.clearForm();
          window.localStorage.removeItem("_article"); // 移除存档
        })
        .catch(err => {
          console.log(err);
        });
    },
    handleChangeArticle() {
      this.setLocalStorage();
      this.createCatalog();
      let newData = {
        title: this.title,
        tags: this.tags,
        lastDate: new Date().getTime(),
        abstract: this.abstract,
        content: this.content,
        mdContent: this.mdContent,
        catalog: this.catalog
      };
      ChangeArticle({ _id: this.articleId, newData: newData }).then(() => {
        this.showModal = true;
        window.localStorage.removeItem("_article");
      });
    },
    autoSave() {
      if (
        this.title.length ||
        this.tags.length ||
        this.mdContent.length ||
        this.abstract.length
      ) {
        this.setLocalStorage();
        this.$message.success("自动保存成功！");
      }
      this.timer = setTimeout(this.autoSave, 1000 * 60);
    },
    modalLocalStorageClickCancel() {
      this.showLocalStorageModal = false;
      window.localStorage.removeItem("_article");
      this.autoSave();
    },
    modalLocalStorageClickOk() {
      this.showLocalStorageModal = false;
      let articleData = JSON.parse(window.localStorage.getItem("_article"));
      this.title = articleData.title;
      this.tags = articleData.tags;
      this.abstract = articleData.abstract;
      this.mdContent = articleData.mdContent;
      this.autoSave();
    },
    checkIsSameAsLocalStorage() {
      if (window.localStorage.getItem("_article")) {
        let articleData = JSON.parse(window.localStorage.getItem("_article"));
        if (
          articleData.title !== this.title ||
          articleData.tags.join("") !== this.tags.join("") ||
          articleData.mdContent !== this.mdContent ||
          articleData.abstract !== this.abstract
        ) {
          this.showLocalStorageModal = true;
        } else {
          this.autoSave();
        }
      } else {
        this.autoSave();
      }
    },
    uploadImgClick() {
      this.$refs.imgInput.click();
    },
    uploadImg(event) {
      let files = event.target.files;
      if (files.length === 0) {
        return;
      }
      let file = files[0];

      //文件名(加一个前缀相当于目录)
      let filename = "mdImg/" + btoa(Date.now()) + file.name;
      let putExtra = {
        fname: filename,
        params: {},
        mimeType: null
      };
      let completeUrl = "";
      let self = this;

      let observer = {
        next(res) {
          console.log(res);
        },
        error(err) {
          console.log(err);
        },
        complete(res) {
          let { key } = res;
          completeUrl = `${Domain}/${key}`;
          self.mdContent += `![${filename}](${completeUrl})`;
          let imgData = {
            filename,
            url: completeUrl
          };
          SaveImg(imgData).then(() => {
            self.$message.success("图片上传成功！");
          });
        }
      };
      GetQiniuToken().then(res => {
        let token = res.data.resData.qiniuToken;
        let observable = qiniu.upload(file, filename, token, putExtra, config);
        observable.subscribe(observer);
      });
    },
    modalClickOk() {
      this.$router.push({ path: "/admin" });
    }
  },
  computed: {
    htmlText() {
      return Marked(this.mdContent);
    }
  },
  mounted() {
    Marked.setOptions({
      renderer: new Marked.Renderer(),
      smartLists: true,
      highlight: function(code) {
        return highlight.highlightAuto(code).value;
      }
    });

    let mdContent = this.$refs.mdContent.$el;
    let _this = this;
    mdContent.addEventListener(
      "scroll",
      function() {
        let realArea = this.children[0];
        let scrollTop = realArea.scrollTop;
        let scrollHeight = realArea.scrollHeight - realArea.offsetHeight;
        let htmlContent = _this.$refs.htmlContent;
        htmlContent.scrollTop =
          (htmlContent.scrollHeight - htmlContent.offsetHeight) *
          (scrollTop / scrollHeight);
      },
      true
    );
  },
  created() {
    if (!this.isNew) {
      GetArticle({ _id: this.articleId }).then(res => {
        let data = res.data;
        let articleData = data.resData[0];
        this.title = articleData.title;
        this.tags = articleData.tags;
        this.mdContent = articleData.mdContent;
        this.abstract = articleData.abstract;
        this.checkIsSameAsLocalStorage();
      });
    } else {
      this.checkIsSameAsLocalStorage();
    }
  },
  beforeDestroy() {
    clearTimeout(this.timer);
  }
};
</script>

<style lang="scss" scoped>
@import "@//assets/css/md2html";
@import "~highlight.js/styles/atom-one-light.css";

.editor {
  padding: 10px 0 20px;

  .editor-row {
    width: 100%;
    padding: 6px 10px;
    text-align: left;

    .title-input {
      width: 500px;
    }
  }

  .content-md {
    position: relative;

    .img-upload {
      position: absolute;
      bottom: 4px;
      right: 20px;
      text-align: right;
    }

    .icon {
      font-size: 28px;
      cursor: pointer;
    }

    .img-form {
      position: relative;
      margin: 0 0 1% 20%;
      width: 80%;
      height: 100px;
      border: 1px dashed rgba(0, 0, 0, 0.08);
      background: rgba(255, 255, 255, 0.8);

      &:hover {
        border-color: rgba(0, 0, 0, 0.5);
      }
    }

    .img-input {
      opacity: 0;
      width: 60%;
    }

    .img-content {
      position: absolute;
      top: 0;
      left: 0;
      box-sizing: border-box;
      padding: 20px 0 0 0;
      text-align: center;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }

    .text {
      margin-bottom: 10px;
    }
  }

  .content-textarea {
    & > textarea {
      height: 700px;
      resize: none;
    }
  }

  .digest-textarea {
    & > textarea {
      resize: none;
    }
  }

  .content-show {
    border: 1px solid #dcdee2;
    height: 700px;
    resize: none;
  }
}
</style>
