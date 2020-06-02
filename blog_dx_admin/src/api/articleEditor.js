import service from "@/utils/request";

export const SaveArticle = data => {
  return service.request({
    method: "post",
    url: "/api/article/save",
    data
  });
};

export const ChangeArticle = data => {
  return service.request({
    method: "post",
    url: "/api/article/change",
    data
  });
};

export const GetArticle = data => {
  return service.request({
    method: "get",
    url: "/api/article/single",
    params: data
  });
};
