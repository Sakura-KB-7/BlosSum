import axios from 'axios';

const runtimeApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const normalizedApiBaseUrl = runtimeApiBaseUrl?.replace(/\/$/, '');

if (import.meta.env.PROD && !normalizedApiBaseUrl) {
  console.warn(
    '[http] VITE_API_BASE_URL is not set. Falling back to same-origin /api. Set Railway URL in Vercel env for production.'
  );
}

/** 개발 시 Vite 프록시 사용: /api → json-server:3000 */
export const http = axios.create({
  baseURL: normalizedApiBaseUrl || '/api',
  headers: { 'Content-Type': 'application/json' },
});
