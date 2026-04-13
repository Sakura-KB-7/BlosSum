import axios from 'axios';

const runtimeApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const resolvedBaseUrl = (() => {
  if (!runtimeApiBaseUrl) return '/api';
  if (/^https?:\/\//i.test(runtimeApiBaseUrl)) return runtimeApiBaseUrl;
  return `https://${runtimeApiBaseUrl}`;
})();

/** 개발 시 Vite 프록시 사용: /api → json-server:3000 */
export const http = axios.create({
  baseURL: resolvedBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});
