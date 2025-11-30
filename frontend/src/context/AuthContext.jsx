import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useGlobalModal } from './ModalContext';
import { API_BASE_URL } from '../constants';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const { alert } = useGlobalModal();
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    const logout = useCallback(() => {
        setToken(null); 
        setUser(null); 
        localStorage.removeItem('token');
    }, []);

    // 1. 초기 로드 및 토큰 변경 시 헤더 설정 & 프로필 로드
    useEffect(() => {
        axios.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : null;
        if (!token) return;
        axios.get(`${API_BASE_URL}/auth/profile`)
            .then(res => setUser(res.data.data))
            .catch(() => logout());
    }, [token, logout]);

    // 2. Axios 인터셉터: 401 에러(세션 만료) 시 자동 로그아웃
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    console.log("세션 만료: 자동 로그아웃 처리");
                    logout(); 
                }
                return Promise.reject(error);
            }
        );
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [logout]);

    const login = async (email, password) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
            setToken(res.data.token); 
            localStorage.setItem('token', res.data.token);
            return { success: true };
        } catch (e) { 
            // 로그인 실패는 여기서 바로 alert 띄워도 무방
            alert('실패', e.response?.data?.message || '로그인 실패'); 
            return { success: false }; 
        }
    };

    // ⭐️ [수정됨] 회원가입: 에러 메시지를 반환하도록 변경
    const register = async (data) => {
        try { 
            await axios.post(`${API_BASE_URL}/auth/register`, data); 
            return { success: true }; 
        }
        catch (e) { 
            // alert를 여기서 띄우지 않고 메시지 반환
            const message = e.response?.data?.message || '회원가입 중 오류가 발생했습니다.';
            console.log("Register Error:", message);
            return { success: false, message: message }; 
        }
    };

    const updateProfile = async (data) => {
        try { 
            await axios.put(`${API_BASE_URL}/auth/users/${user.user_id}`, data); 
            if(data.nickname) setUser(p => ({...p, nickname: data.nickname})); 
            return { success: true }; 
        }
        catch (e) { 
            alert('오류', e.response?.data?.message); 
            return { success: false }; 
        }
    };

    const deleteAccount = async ({ currentPassword }) => {
        try { 
            await axios.delete(`${API_BASE_URL}/auth/users/${user.user_id}`, { data: { currentPassword } }); 
            logout(); 
            return { success: true }; 
        }
        catch (e) { 
            alert('오류', e.response?.data?.message); 
            return { success: false }; 
        }
    };

    const value = { 
        user, 
        token, 
        login, 
        logout, 
        register, 
        updateProfile, 
        deleteAccount, 
        isAuthenticated: !!user, 
        isAdmin: user?.role === 'ADMIN' 
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
