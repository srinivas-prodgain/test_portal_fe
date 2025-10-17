import axios from "axios";

const api_base_url = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export const api_client = axios.create({
  baseURL: api_base_url,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});
