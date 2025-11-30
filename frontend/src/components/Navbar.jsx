// src/components/Navbar.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ view, setView }) => {
    const { isAuthenticated, logout, user, isAdmin } = useAuth();
    
    return (
        <div className="flex justify-between items-center px-6 py-4 bg-gray-800 text-white shadow-md sticky top-0 z-50">
            <div className="text-2xl font-bold cursor-pointer" onClick={() => setView('home')}>✈️ Trip Community</div>
            <div className="flex space-x-4 items-center">
                {isAuthenticated ? (
                    <>
                        <span className="hidden sm:inline text-gray-300 mr-2">{user?.nickname}님</span>
                        
                        {/* ⭐️ [수정] 관리자 버튼 클릭 시 'mypage_admin' 뷰로 이동 */}
                        {isAdmin && (
                            <button 
                                onClick={() => setView('mypage_admin')} 
                                className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm font-bold transition flex items-center gap-1"
                            >
                                🛡️ 관리자 페이지
                            </button>
                        )}

                        <button onClick={() => setView('mypage')} className="hover:text-indigo-300 transition">마이페이지</button>
                        <button onClick={logout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-bold transition">로그아웃</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setView('login')} className="hover:text-indigo-300 transition">로그인</button>
                        <button onClick={() => setView('register')} className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded text-sm font-bold transition">회원가입</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Navbar;