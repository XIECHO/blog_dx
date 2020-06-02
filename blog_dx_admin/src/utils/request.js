import axios from "axios";
import { Message } from "element-ui";
import { getToken, getUsername } from "@/utils/app";
import Router from "@/router";

// const BASEURL = process.env.NODE_ENV === "production" ? "" : "/devApi";
const service = axios.create({
  //baseURL: BASEURL,
  timeout: 15000
});

service.interceptors.request.use(
  function(config) {
    config.headers["token"] = getToken();
    config.headers["username"] = getUsername();
    return config;
  },
  function(error) {
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  function(response) {
    let data = response.data;
    if (data.resCode !== 0) {
      Message.error(data.resMsg);
      if (data.resCode === 100) {
        Router.push({ path: "/login" });
      }
      return Promise.reject(response);
    } else {
      return response;
    }
  },
  function(error) {
    return Promise.reject(error);
  }
);

export default service;
