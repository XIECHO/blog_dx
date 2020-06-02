import service from "@/utils/request";
import * as qiniu from "qiniu-js";

export const GetQiniuToken = () => {
  return service.request({
    method: "get",
    url: "/api/qiniuToken"
  });
};

export let config = {
  useCdnDomain: true,
  region: qiniu.region.z2
};

export let Domain = "http://qaq42jnlq.bkt.clouddn.com";
