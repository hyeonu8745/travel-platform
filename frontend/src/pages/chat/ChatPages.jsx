import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useGlobalModal } from '../../context/ModalContext';
import UserInviteModal from '../../components/UserInviteModal'; 

// ----------------------------------------------------------------------
// 1. 채팅방 목록 화면 (ChatListScreen)
// ----------------------------------------------------------------------
export const ChatListScreen = ({ setView }) => {
    const { chatrooms, fetchChatrooms, joinRoom, adminDeleteRoom, deleteRoomAsOwner } = useChat();
    const { isAdmin, user } = useAuth();
    
    useEffect(() => { fetchChatrooms(); }, [fetchChatrooms]);

    return (
        <div className="p-6 bg-white rounded-xl shadow-md">
            <div className="flex justify-between mb-4">
                <h2 className="text-2xl font-bold">채팅방 목록</h2>
                <button onClick={() => setView('chat_create')} className="bg-green-600 text-white px-3 py-1 rounded font-bold">+ 방 만들기</button>
            </div>
            <div className="space-y-2">
                {chatrooms.map(r => {
                    const isOwner = user?.user_id === r.creator_id;
                    return (
                        <div key={r.room_id} onClick={() => joinRoom(r.room_id)} className="p-4 border rounded hover:bg-indigo-50 cursor-pointer flex justify-between items-center">
                            <span className="font-bold">{r.room_name}</span>
                            <div className="flex gap-2">
                                <button className="text-sm bg-indigo-600 text-white px-2 py-1 rounded">입장</button>
                                {isAdmin && <button onClick={(e) => { e.stopPropagation(); adminDeleteRoom(r.room_id, r.room_name); }} className="text-sm bg-red-800 text-white px-2 py-1 rounded">관리자 삭제</button>}
                                {isOwner && !isAdmin && (
                                    <button onClick={(e) => { e.stopPropagation(); deleteRoomAsOwner(r.room_id, r.room_name); }} className="text-sm bg-red-500 text-white px-2 py-1 rounded">삭제</button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 2. 채팅방 생성 화면 (ChatCreateScreen)
// ----------------------------------------------------------------------
export const ChatCreateScreen = ({ setView }) => {
    const { createRoom, joinRoom } = useChat();
    const [name, setName] = useState('');
    const handle = async (e) => { 
        e.preventDefault(); 
        const res = await createRoom(name); 
        if(res.success) { joinRoom(res.data.room_id); } 
    };
    return (
        <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">채팅방 생성</h2>
            <form onSubmit={handle}>
                <input className="w-full p-2 border rounded mb-4" placeholder="방 이름" value={name} onChange={e => setName(e.target.value)} required />
                <button className="w-full bg-indigo-600 text-white py-2 rounded font-bold">만들기</button>
            </form>
        </div>
    );
};

// ----------------------------------------------------------------------
// 3. 채팅방 상세 화면 (ChatRoomScreen) - ⭐️ 로그 및 방어 로직 추가됨
// ----------------------------------------------------------------------
export const ChatRoomScreen = () => {
    // ⭐️ socket, enterSocketRoom, socketStatus 추가
    const { currentRoom, messages, sendMessage, setCurrentRoom, inviteUser, joinRoom, enterSocketRoom, socket, socketStatus } = useChat();
    const { user } = useAuth();
    
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [input, setInput] = useState('');
    const scrollRef = useRef();
    
    // ⭐️ [핵심] 소켓 연결 상태 확인 후 방 입장 요청 (enterSocketRoom)
    useEffect(() => {
        if (currentRoom && socket && socketStatus) {
            enterSocketRoom(currentRoom);
        } else if (currentRoom && (!socket || !socketStatus)) {
        }
    }, [currentRoom, socket, socketStatus, enterSocketRoom]); 

    // 스크롤 자동 이동
    useEffect(() => { 
        if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; 
    }, [messages]);
    
    const send = (e) => { 
        e.preventDefault(); 
        if(input.trim()) { 
            sendMessage(input); 
            setInput(''); 
        } 
    };

    const handleInviteUser = (nickname) => {
        inviteUser(currentRoom, nickname);
        setShowInviteModal(false);
    };

    

    if (!currentRoom) return <ChatListScreen />;
    
    return (
        <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-2xl overflow-hidden relative">
            {/* 상단 바 */}
            <div className="bg-indigo-600 text-white p-4 font-bold flex justify-between items-center">
                <span>Chat Room #{currentRoom}</span>
                <div className="flex gap-2">
                    <button onClick={() => setShowInviteModal(true)} className="text-xs bg-green-500 hover:bg-green-600 px-3 py-1 rounded transition">+ 초대</button>
                    <button onClick={() => setCurrentRoom(null)} className="text-xs bg-indigo-800 hover:bg-indigo-900 px-2 py-1 rounded transition">나가기</button>
                </div>
            </div>

            {/* 메시지 영역 */}
            <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50" ref={scrollRef}>
                {messages.map((m, i) => {
                    // ⭐️ [안전한 데이터 파싱] 서버 데이터 구조 방어 로직
                    
                    // 1. 메시지 내용
                    const content = m.content || m.message || ""; 

                    // 2. 보낸 사람 정보 찾기 (대소문자, 중첩 구조 모두 체크)
                    const senderObj = m.sender || m.Sender || m.user || {}; 
                    
                    // 3. 보낸 사람 ID 찾기 (가장 중요!)
                    // senderObj 안에 id가 있을 수도, user_id가 있을 수도 있음.
                    // 혹은 m 객체 자체에 sender_id나 user_id가 있을 수도 있음.
                    const senderId = senderObj.id || senderObj.user_id || m.sender_id || m.user_id || m.userId;
                    
                    // 4. 보낸 사람 닉네임
                    const senderNickname = senderObj.nickname || senderObj.name || "알 수 없음";

                    // 5. 내 메시지 여부 판별
                    // user.user_id와 비교 (둘 다 문자열로 변환해서 비교해야 안전)
                    const myId = user?.user_id || user?.id;
                    const isMyMessage = String(senderId) === String(myId);

                    return (
                        <div key={i} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs px-4 py-2 rounded-lg shadow-sm text-sm ${isMyMessage ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-white border rounded-tl-none'}`}>
                                {/* 상대방 메시지일 때만 닉네임 표시 */}
                                {!isMyMessage && (
                                    <div className="font-bold text-xs mb-1 text-gray-500">
                                        {senderNickname}
                                    </div>
                                )}
                                {content}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 입력 폼 */}
            <form onSubmit={send} className="p-3 bg-white border-t flex gap-2">
                <input 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    className="flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder="메시지..." 
                />
                <button className="bg-indigo-600 text-white px-4 rounded font-bold">전송</button>
            </form>

            {/* 초대 모달 */}
            {showInviteModal && (
                <UserInviteModal 
                    onClose={() => setShowInviteModal(false)} 
                    onInvite={handleInviteUser} 
                />
            )}
        </div>
    );
};
