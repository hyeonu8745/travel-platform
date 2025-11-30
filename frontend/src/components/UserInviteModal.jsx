// src/components/UserInviteModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../constants';

const UserInviteModal = ({ onClose, onInvite }) => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. 전체 사용자 목록 불러오기 (본인 제외됨)
        axios.get(`${API_BASE_URL}/auth/users/list`)
            .then(res => {
                setUsers(res.data.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    // 2. 검색어로 필터링
    const filteredUsers = users.filter(u => 
        u.nickname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[500px]">
                {/* 헤더 */}
                <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg">사용자 초대</h3>
                    <button onClick={onClose} className="text-indigo-100 hover:text-white text-xl font-bold">&times;</button>
                </div>

                {/* 검색창 */}
                <div className="p-4 border-b">
                    <input 
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="닉네임 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* 사용자 목록 */}
                <div className="flex-grow overflow-y-auto p-2">
                    {loading ? (
                        <p className="text-center text-gray-400 py-4">로딩 중...</p>
                    ) : filteredUsers.length === 0 ? (
                        <p className="text-center text-gray-400 py-4">검색 결과가 없습니다.</p>
                    ) : (
                        <ul className="space-y-1">
                            {filteredUsers.map(user => (
                                <li key={user.user_id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg group transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                                            {user.nickname.charAt(0)}
                                        </div>
                                        <span className="font-medium text-gray-700">{user.nickname}</span>
                                    </div>
                                    <button 
                                        onClick={() => onInvite(user.nickname)}
                                        className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-full font-bold transition opacity-0 group-hover:opacity-100"
                                    >
                                        초대
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserInviteModal;