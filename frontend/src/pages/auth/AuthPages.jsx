// src/pages/auth/AuthPages.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useGlobalModal } from '../../context/ModalContext';
import { API_BASE_URL } from '../../constants';

// ----------------------------------------------------------------------
// 1. 로그인 화면 (변경 없음)
// ----------------------------------------------------------------------
export const LoginScreen = ({ setView }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const handleSubmit = async (e) => { e.preventDefault(); const res = await login(email, password); if (res.success) setView('home'); };
    return (
        <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-6">로그인</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input className="w-full p-3 border rounded" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} required />
                <input className="w-full p-3 border rounded" type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} required />
                <button className="w-full bg-indigo-600 text-white py-3 rounded font-bold hover:bg-indigo-700">로그인</button>
            </form>
            <p className="text-center mt-4 text-sm text-gray-600 cursor-pointer hover:underline" onClick={() => setView('register')}>회원가입</p>
        </div>
    );
};

// ----------------------------------------------------------------------
// 2. 회원가입 화면 (수정됨)
// ----------------------------------------------------------------------
export const RegisterScreen = ({ setView }) => {
    const { register } = useAuth(); // AuthContext에서 제공하는 register 함수 사용
    const { alert } = useGlobalModal(); // 전역 모달 사용
    
    const [form, setForm] = useState({ 
        email: '', 
        username: '', // 아이디
        nickname: '', 
        password: '', 
        confirm: '' 
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { email, username, nickname, password, confirm } = form;

        // 1. 프론트엔드 유효성 검사 (즉시 피드백)
        
        // 이메일 형식
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return alert('오류', '올바른 이메일 형식이 아닙니다.');

        // 비밀번호 길이
        if (password.length < 6) return alert('오류', '비밀번호는 6자리 이상이어야 합니다.');

        // 비밀번호 일치
        if (password !== confirm) return alert('오류', '비밀번호가 일치하지 않습니다.');

        // 빈 값 체크 (HTML required가 있지만 한번 더)
        if (!username.trim() || !nickname.trim()) return alert('오류', '모든 정보를 입력해주세요.');

        // 2. 서버로 전송 (Context의 register 함수 호출)
        // register 함수 내부에서 axios 호출 후 성공/실패 여부를 반환한다고 가정
        const res = await register({ email, username, nickname, password });
        
        if (res.success) {
            alert('성공', '회원가입이 완료되었습니다! 로그인 해주세요.');
            setView('login'); // 로그인 화면으로 전환
        } else {
            // 실패 시 (중복된 이메일 등)
            // res.message에 서버 에러 메시지가 들어있다고 가정
            alert('가입 실패', res.message || '회원가입 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-6">회원가입</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
                
                <input 
                    name="email"
                    className="w-full p-3 border rounded focus:outline-none focus:border-indigo-500" 
                    placeholder="이메일" 
                    onChange={handleChange} 
                    required 
                />
                
                <input 
                    name="username"
                    className="w-full p-3 border rounded focus:outline-none focus:border-indigo-500" 
                    placeholder="아이디" 
                    onChange={handleChange} 
                    required 
                />
                
                <input 
                    name="nickname"
                    className="w-full p-3 border rounded focus:outline-none focus:border-indigo-500" 
                    placeholder="닉네임" 
                    onChange={handleChange} 
                    required 
                />
                
                <input 
                    name="password"
                    className="w-full p-3 border rounded focus:outline-none focus:border-indigo-500" 
                    type="password" 
                    placeholder="비밀번호 (6자리 이상)" 
                    onChange={handleChange} 
                    required 
                />
                
                <input 
                    name="confirm"
                    className="w-full p-3 border rounded focus:outline-none focus:border-indigo-500" 
                    type="password" 
                    placeholder="비밀번호 확인" 
                    onChange={handleChange} 
                    required 
                />
                
                <button className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition duration-200">
                    가입하기
                </button>
            </form>
            
            <p className="text-center mt-4 text-sm text-gray-600 cursor-pointer hover:underline" onClick={() => setView('login')}>
                이미 계정이 있으신가요? 로그인
            </p>
        </div>
    );
};

// ----------------------------------------------------------------------
// 3. [대폭 수정] 마이페이지 (관리자 탭 추가)
// ----------------------------------------------------------------------
export const MyPageScreen = ({ initialTab = 'profile' }) => { // ⭐️ initialTab prop 추가
    const { user, isAdmin, updateProfile, deleteAccount } = useAuth();
    const { alert, confirm } = useGlobalModal();
    
    // ⭐️ 초기 탭 설정: props로 받은 값을 기본값으로 사용
    const [activeTab, setActiveTab] = useState(initialTab);

    // 내 정보 수정용 state
    const [nick, setNick] = useState(user?.nickname || '');
    const [pw, setPw] = useState('');
    const [delPw, setDelPw] = useState('');

    // 관리자용 회원 목록 state
    const [userList, setUserList] = useState([]);

    // 관리자 탭을 눌렀을 때 회원 목록 불러오기
    useEffect(() => {
        if (activeTab === 'admin' && isAdmin) {
            axios.get(`${API_BASE_URL}/admin/users/all`)
                .then(res => setUserList(res.data.data))
                .catch(err => console.error("관리자 목록 로드 실패", err));
        }
    }, [activeTab, isAdmin]);

    const handleNick = async (e) => { e.preventDefault(); const res = await updateProfile({ nickname: nick, currentPassword: pw }); if (res.success) { alert('성공', '변경됨'); setPw(''); } };
    const handleDel = async (e) => { e.preventDefault(); confirm('탈퇴', '정말 탈퇴하시겠습니까?', async (yes) => { if(yes) deleteAccount({ currentPassword: delPw }); }); };

    const handleUserStatusUpdate = (targetUser, newStatus) => {
        const action = newStatus === 'SUSPENDED' ? '이용 정지' : '정지 해제';
        const endpoint = newStatus === 'SUSPENDED' ? 'suspend' : 'activate';

        confirm(`[관리자] ${action}`, `${targetUser.nickname}님을 ${action} 하시겠습니까?`, async (yes) => {
            if (yes) {
                try {
                    await axios.put(`${API_BASE_URL}/admin/users/${targetUser.user_id}/${endpoint}`);
                    alert('성공', '처리되었습니다.');
                    const res = await axios.get(`${API_BASE_URL}/admin/users/all`);
                    setUserList(res.data.data);
                } catch (e) { alert('오류', '실패했습니다.'); }
            }
        });
    };

    if (!user) return <div>로딩...</div>;

    return (
        <div className="max-w-4xl mx-auto mt-6 bg-white rounded-xl shadow-lg overflow-hidden flex min-h-[500px]">
            {/* 왼쪽 사이드바 탭 */}
            <div className="w-1/4 bg-gray-50 border-r border-gray-200 p-4">
                <div className="mb-6 text-center">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full mx-auto flex items-center justify-center text-3xl mb-2">👤</div>
                    <p className="font-bold">{user.nickname}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    {isAdmin && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold mt-1 inline-block">ADMIN</span>}
                </div>
                
                <nav className="space-y-1">
                    <button onClick={() => setActiveTab('profile')} className={`w-full text-left px-4 py-2 rounded font-medium ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}>내 정보 관리</button>
                    {isAdmin && (
                        <button onClick={() => setActiveTab('admin')} className={`w-full text-left px-4 py-2 rounded font-medium ${activeTab === 'admin' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}>🛡️ 관리자 패널</button>
                    )}
                </nav>
            </div>

            {/* 오른쪽 컨텐츠 */}
            <div className="w-3/4 p-8">
                {activeTab === 'profile' && (
                    <div className="space-y-8 animate-fade-in">
                        <h2 className="text-2xl font-bold border-b pb-2">내 정보 수정</h2>
                        <form onSubmit={handleNick} className="space-y-4 max-w-md">
                            <div><label className="block text-sm font-bold mb-1">닉네임</label><input className="w-full p-2 border rounded" value={nick} onChange={e => setNick(e.target.value)} /></div>
                            <div><label className="block text-sm font-bold mb-1">현재 비밀번호 확인</label><input className="w-full p-2 border rounded" type="password" value={pw} onChange={e => setPw(e.target.value)} /></div>
                            <button className="bg-indigo-600 text-white px-4 py-2 rounded font-bold hover:bg-indigo-700">정보 수정</button>
                        </form>
                        <div className="pt-8 border-t">
                            <h3 className="text-xl font-bold text-red-600 mb-4">회원 탈퇴</h3>
                            <form onSubmit={handleDel} className="space-y-4 max-w-md p-4 bg-red-50 rounded border border-red-100">
                                <input className="w-full p-2 border rounded" type="password" placeholder="비밀번호 확인" value={delPw} onChange={e => setDelPw(e.target.value)} />
                                <button className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700">탈퇴하기</button>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'admin' && isAdmin && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold border-b pb-2 text-red-600">🛡️ 관리자 패널 - 회원 관리</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border rounded-lg overflow-hidden">
                                <thead className="bg-gray-100 text-gray-700">
                                    <tr>
                                        <th className="py-3 px-4 text-left">닉네임</th>
                                        <th className="py-3 px-4 text-left">이메일</th>
                                        <th className="py-3 px-4 text-left">상태</th>
                                        <th className="py-3 px-4 text-left">관리</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {userList.map(u => (
                                        <tr key={u.user_id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 font-bold">{u.nickname}</td>
                                            <td className="py-3 px-4 text-sm text-gray-500">{u.email}</td>
                                            <td className="py-3 px-4">
                                                {u.status === 'ACTIVE' ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">정상</span> : <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">정지됨</span>}
                                            </td>
                                            <td className="py-3 px-4">
                                                {u.role !== 'ADMIN' && (u.status === 'ACTIVE' ? <button onClick={() => handleUserStatusUpdate(u, 'SUSPENDED')} className="bg-red-500 text-white text-xs px-3 py-1 rounded">정지</button> : <button onClick={() => handleUserStatusUpdate(u, 'ACTIVE')} className="bg-green-500 text-white text-xs px-3 py-1 rounded">해제</button>)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};