import axios from 'axios';

const runtimeApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const resolvedBaseUrl = runtimeApiBaseUrl || '/api';

/** 개발 시 Vite 프록시 사용: /api → json-server:3000 */
export const http = axios.create({
  baseURL: resolvedBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});
