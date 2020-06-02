import service from "@/utils/request";

export const Login = data => {
  return service.request({
    method: "post",
    url: "/api/login",
    data
  });
};

export const Logout = () => {
  return service.request({
    method: "post",
    url: "/api/logout"
  });
};
