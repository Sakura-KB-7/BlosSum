import axios from 'axios';

const runtimeApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

/** 개발 시 Vite 프록시 사용: /api → json-server:3000 */
export const http = axios.create({
  baseURL: runtimeApiBaseUrl || (import.meta.env.DEV ? '/api' : 'http://localhost:3000'),
  headers: { 'Content-Type': 'application/json' },
});
