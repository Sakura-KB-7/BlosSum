import axios from 'axios';

/** 개발 시 Vite 프록시 사용: /api → json-server:3000 */
export const http = axios.create({
  baseURL: import.meta.env.DEV ? '/api' : 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});
