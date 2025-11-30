import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useGlobalModal } from './ModalContext';
import { API_BASE_URL, SOCKET_BASE_URL } from '../constants';

const ChatContext = createContext(null);
export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const { token, isAuthenticated, isAdmin } = useAuth();
    const { alert, confirm } = useGlobalModal();
    
    // ⭐️ socket을 useRef로 변경 (렌더링과 무관하게 유지)
    const socketRef = useRef(null);
    const [socketConnected, setSocketConnected] = useState(false);
    
    const [messages, setMessages] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [chatrooms, setChatrooms] = useState([]);
    const [popularChatrooms, setPopularChatrooms] = useState([]);

    useEffect(() => {
        if (isAuthenticated && token) {
            // 이미 연결되어 있다면 스킵
            if (socketRef.current && socketRef.current.connected) return;

            
            // 소켓 생성
            socketRef.current = io(SOCKET_BASE_URL, { 
                query: { token }, 
                transports: ['websocket'],
                reconnection: true, // 재연결 허용
            });

            const socket = socketRef.current;

            socket.on('connect', () => {
                setSocketConnected(true);
            });

            socket.on('disconnect', () => {
                setSocketConnected(false);
            });

            socket.on('newMessage', (msg) => {
                // 현재 방의 메시지인지 확인 (선택 사항)
                setMessages(prev => [...prev, msg]);
            });

            socket.on('roomJoined', ({ roomId, messages }) => {
                setMessages(messages || []);
            });

            socket.on('notification', (data) => {
                if(data.type === 'invite') fetchChatrooms();
            });

            // cleanup
            return () => { 
                if (socket) socket.disconnect();
                socketRef.current = null;
                setSocketConnected(false);
            };
        }
    }, [isAuthenticated, token]);

    const fetchChatrooms = useCallback(async () => {
        if (!isAuthenticated) return;
        try { 
            const res = await axios.get(`${API_BASE_URL}/chatrooms`); 
            setChatrooms(res.data.data || []); 
        } catch (e) { console.error(e); }
    }, [isAuthenticated]);

    const fetchPopularChatrooms = useCallback(async () => {
        try { 
            const res = await axios.get(`${API_BASE_URL}/chatrooms/popular`); 
            setPopularChatrooms(res.data.data || []); 
        } catch (e) { console.error(e); }
    }, []);

    // UI에서 호출하는 함수 (상태만 변경)
    const joinRoom = (roomId) => { 
        setMessages([]); 
        setCurrentRoom(roomId);
    };

    // ⭐️ 소켓으로 실제 입장 요청 보내는 함수 (socketRef 사용)
    const enterSocketRoom = useCallback((roomId) => {
        const socket = socketRef.current;
        if (socket && socket.connected) {
            socket.emit('joinRoom', roomId);
        } else {
            console.warn("⚠️ 소켓이 연결되지 않아 joinRoom을 보낼 수 없습니다.");
        }
    }, []); // 의존성 없음 (ref 사용하므로)

    const sendMessage = (content) => { 
        // API로 전송 (백엔드가 처리 후 소켓 emit)
        // 만약 소켓으로 직접 보낸다면:
        // if(socketRef.current && currentRoom) socketRef.current.emit('sendMessage', { roomId: currentRoom, content });
        
        // 여기서는 API 호출 방식 유지 (기존 로직 따름)
        if (currentRoom) {
             // API 호출 로직은 컴포넌트나 여기서 axios로 수행
             // (기존 코드에 sendMessage가 API 호출이었는지 소켓 호출이었는지 확인 필요)
             // ChatPages.jsx를 보니 sendMessage 함수 내부 구현이 안 보였는데, 
             // ChatProvider.js 원본에는 socket.emit('sendMessage')로 되어 있었음.
             // 백엔드 server.js에도 socket.on('sendMessage')가 있으므로 소켓 전송 사용
             if(socketRef.current) socketRef.current.emit('sendMessage', { roomId: currentRoom, content });
        }
    };
    
    const createRoom = async (name) => {
        try { 
            const res = await axios.post(`${API_BASE_URL}/chatrooms`, { room_name: name });
            await fetchChatrooms(); 
            return { success: true, data: res.data.data }; 
        }
        catch (e) { alert('오류', e.response?.data?.message); return { success: false }; }
    };

    const adminDeleteRoom = (roomId, name) => {
        if (!isAdmin) return;
        confirm('[관리자] 삭제', `삭제하시겠습니까?`, async (yes) => {
            if (yes) { 
                await axios.delete(`${API_BASE_URL}/admin/chatrooms/${roomId}`); 
                fetchChatrooms(); 
            }
        });
    };

    const inviteUser = async (roomId, nickname) => {
        try {
            await axios.post(`${API_BASE_URL}/chatrooms/${roomId}/invite`, { nickname }); 
            alert('성공', `초대했습니다.`);
        } catch (e) { alert('실패', '초대 실패'); }
    };

    const value = { 
        socket: socketRef.current, // ref.current를 보내야 함 (주의: 렌더링 시점엔 null일 수 있음)
        messages, currentRoom, chatrooms, popularChatrooms, 
        joinRoom, sendMessage, createRoom, fetchChatrooms, fetchPopularChatrooms, 
        setCurrentRoom, adminDeleteRoom, inviteUser, 
        enterSocketRoom, 
        socketStatus: socketConnected // 상태값 사용
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
