// src/constants.js

export const API_BASE_URL = '/api';
export const SOCKET_BASE_URL = 'http://localhost:3000';
export const UPLOAD_BASE_URL = 'http://localhost:3000/uploads';
export const ANNOUNCEMENT_BOARD_ID = 4;

// Vite 환경 변수에서 API 키 로드 (없으면 빈 문자열)
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
export const GOOGLE_MAPS_LIBRARIES = ['places'];