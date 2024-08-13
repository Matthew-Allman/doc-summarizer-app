const axios = require("axios");

const backendUrl = process.env.PYBACKEND_URL;

const pyBackendAPI = axios.create({
  baseURL: backendUrl,
});

module.exports = pyBackendAPI;
