import service from "@/utils/request";

export const SaveImg = data => {
  return service.request({
    method: "post",
    url: "/api/img/save",
    data
  });
};

export const GetImgList = data => {
  return service.request({
    method: "get",
    url: "/api/img/list",
    params: data
  });
};

export const RemoveImg = data => {
  return service.request({
    method: "post",
    url: "/api/img/remove",
    data
  });
};
