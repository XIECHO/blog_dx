<template>
  <div class="management">
    <el-table :data="formatArticles" border>
      <el-table-column
        align="center"
        fixed
        prop="articleTitle"
        label="标题"
        min-width="200"
      ></el-table-column>
      <el-table-column
        align="center"
        prop="tags"
        label="标签"
        min-width="100"
      ></el-table-column>
      <el-table-column
        align="center"
        prop="date"
        label="创建时间"
        min-width="120"
      ></el-table-column>
      <el-table-column
        align="center"
        prop="lastDate"
        label="最后编辑时间"
        min-width="120"
      ></el-table-column>
      <el-table-column
        align="center"
        prop="readCount"
        label="阅读量"
        min-width="80"
      ></el-table-column>
      <el-table-column
        align="center"
        prop="type"
        label="类型"
        min-width="80"
      ></el-table-column>
      <el-table-column
        align="center"
        fixed="right"
        label="编辑"
        min-width="200"
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            @click="handleModify(scope.$index)"
            >编辑</el-button
          >
          <el-button
            type="primary"
            size="small"
            @click="handleTypeChange(scope.$index)"
            >切换</el-button
          >
          <el-button
            type="error"
            size="small"
            @click="handleRemove(scope.$index)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <div class="page">
      <el-pagination
        background
        prev-text="上一页"
        next-text="下一页"
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </div>
    <el-dialog title="提示" :visible.sync="confirmRemove" width="30%">
      <span>确定删除吗？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="confirmRemove = false">取 消</el-button>
        <el-button type="primary" @click="dialogClickOk">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { formatDate } from "@/utils/formatDate";
import { GetArticleList, ChangeState, RemoveArticle } from "@/api/management";

export default {
  data() {
    return {
      total: 0,
      page: 1,
      pageSize: 10,
      articles: [],
      confirmRemove: false,
      removeId: ""
    };
  },
  computed: {
    formatArticles() {
      return this.articles.map(val => {
        let list = {};
        list._id = val._id;
        list.articleTitle = val.title;
        list.tags = val.tags.reduce((a, b) => a + "," + b);
        list.date = formatDate(new Date(val.date), "yyyy-MM-dd hh:mm");
        list.lastDate = formatDate(
          new Date(val.lastDate || list.date),
          "yyyy-MM-dd hh:mm"
        );
        list.readCount = val.readCount;
        list.type = val.type === 1 ? "私密" : "公开";
        return list;
      });
    }
  },
  created() {
    this.loadArticles();
  },
  methods: {
    loadArticles() {
      let param = {
        page: this.page,
        pageSize: this.pageSize
      };
      GetArticleList(param).then(res => {
        let data = res.data;
        this.$nextTick(function() {
          this.total = data.resData.total;
          this.articles = data.resData.list;
        });
      });
    },
    handleModify(index) {
      let id = this.articles[index]._id;
      this.$router.push({ path: "modifyArticle", query: { _id: id } });
    },
    handleTypeChange(i) {
      let id = this.articles[i]._id;
      let newData = this.articles[i].type === 1 ? { type: 0 } : { type: 1 };
      ChangeState({ _id: id, newData: newData }).then(() => {
        this.$message.success("切换成功!");
        this.loadArticles();
      });
    },
    handleRemove(index) {
      this.confirmRemove = true;
      this.removeId = this.articles[index]._id;
    },
    dialogClickOk() {
      this.confirmRemove = false;
      RemoveArticle({ _id: this.removeId }).then(() => {
        this.$message.success("删除成功!");
        this.loadArticles();
      });
    },
    handleCurrentChange(val) {
      this.page = val;
      this.loadArticles();
    }
  }
};
</script>

<style lang="scss" scoped>
.management {
  padding: 60px 20px;
  margin: 0 auto;
  max-width: 1264px;
  .page {
    margin-top: 20px;
  }
  .btn {
    margin: 6px 0;
  }
}
</style>
