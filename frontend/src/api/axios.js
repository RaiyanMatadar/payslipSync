// axios.js - single place to configure the base API url
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export default api;