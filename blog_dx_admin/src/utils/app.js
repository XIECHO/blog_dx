import cookie from "cookie_js";

const adminToken = "token";
const username = "username";

export function getToken() {
  return cookie.get(adminToken);
}

export function setToken(token) {
  return cookie.set(adminToken, token);
}

export function removeToken() {
  return cookie.remove(adminToken);
}

export function getUsername() {
  return cookie.get(username);
}

export function setUsername(value) {
  return cookie.set(username, value);
}

export function removeUsername() {
  return cookie.remove(username);
}
