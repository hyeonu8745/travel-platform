import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants';

const WidgetSidebar = ({ setView }) => {
    const { isAuthenticated } = useAuth();
    const [stats, setStats] = useState({ userCount: 0, comments: [] });
    
    useEffect(() => {
        if (!isAuthenticated) return;
        
        // ⭐️ [수정] 1:1 채팅용 '사용자 목록(users/list)' 호출 제거
        // 오직 '총 멤버 수'와 '최신 댓글'만 가져옵니다.
        Promise.all([
            axios.get(`${API_BASE_URL}/auth/users/count`),
            axios.get(`${API_BASE_URL}/posts/comments/recent?limit=5`),
        ]).then(([uCount, uComm]) => {
            setStats({ userCount: uCount.data.data.count, comments: uComm.data.data });
        }).catch(console.error);
    }, [isAuthenticated]);

    // 1:1 채팅 핸들러(handlePrivateChat)도 삭제됨

    if (!isAuthenticated) return (
        <div className="w-64 p-4 bg-white border-l shadow-md space-y-4 hidden lg:block flex-shrink-0">
            <h3 className="font-bold text-gray-700 border-b pb-2">환영합니다!</h3>
            <p className="text-sm text-gray-600">로그인하고 더 많은 기능을 이용해보세요.</p>
            <button onClick={() => setView('login')} className="w-full bg-indigo-600 text-white py-2 rounded font-bold">로그인</button>
        </div>
    );

    return (
        <div className="w-64 p-4 bg-white border-l shadow-md space-y-4 hidden lg:block flex-shrink-0">
            {/* 1. 총 멤버 수 위젯 */}
            <div className="p-3 bg-indigo-50 rounded shadow-inner">
                <p className="font-bold text-indigo-700">총 멤버 수</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.userCount} 명</p>
            </div>

            {/* 2. 최신 댓글 위젯 */}
            <div className="p-3 bg-gray-50 rounded shadow-inner">
                <p className="font-bold text-gray-700 mb-2 border-b pb-1">최신 댓글</p>
                <ul className="space-y-2 text-xs">
                    {stats.comments.map((c, i) => (
                        <li key={i} className="truncate cursor-pointer hover:text-indigo-600" onClick={() => setView('post_detail', c.post_id)}>
                            {c.content} <span className="text-gray-400">by {c.CommentAuthor?.nickname}</span>
                        </li>
                    ))}
                    {stats.comments.length === 0 && <li className="text-gray-400 text-center py-2">댓글이 없습니다.</li>}
                </ul>
            </div>

            {/* ⭐️ [삭제됨] 초록색 '접속자 / 1:1 채팅' 박스가 완전히 사라졌습니다. */}
        </div>
    );
};

export default WidgetSidebar;