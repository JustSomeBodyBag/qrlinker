import axios from "axios";

const config = {
  BACKEND_DOMAIN: "",
  FRONTEND_DOMAIN: ""
};

export async function loadConfig() {
  try {
    const res = await axios.get("/api/config"); // proxy или полный URL
    config.BACKEND_DOMAIN = res.data.BACKEND_DOMAIN;
    config.FRONTEND_DOMAIN = res.data.FRONTEND_DOMAIN;
  } catch (error) {
    console.error("Failed to load config", error);
  }
}

export default config;
