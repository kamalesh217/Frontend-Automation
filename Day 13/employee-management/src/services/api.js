import axios from "axios";

const API = axios.create({
  baseURL: "https://dummyjson.com",
});

export default API;