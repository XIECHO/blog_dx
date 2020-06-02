<template>
  <articleEditor :isNew="isNew"></articleEditor>
</template>

<script>
import articleEditor from "@/components/articleEditor/articleEditor";

export default {
  data() {
    return {
      isNew: true
    };
  },
  components: {
    articleEditor
  }
};
</script>
