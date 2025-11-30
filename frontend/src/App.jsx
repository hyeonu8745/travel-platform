import React, { useState } from 'react';
import { ModalProvider, useGlobalModal } from './context/ModalContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider, useChat } from './context/ChatContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import WidgetSidebar from './components/WidgetSidebar';

// Pages
import HomeScreen from './pages/home/HomeScreen';
import { LoginScreen, RegisterScreen, MyPageScreen } from './pages/auth/AuthPages';
import { PostListScreen, PostDetailScreen, PostEditScreen } from './pages/board/BoardPages';
import { ChatListScreen, ChatCreateScreen, ChatRoomScreen } from './pages/chat/ChatPages';
import { TripListScreen, TripDetailScreen, TripCreateScreen } from './pages/trip/TripPages';

const AppContent = () => {
    const { isAuthenticated } = useAuth();
    const { currentRoom } = useChat();
    const { alert } = useGlobalModal();
    
    // 네비게이션 상태
    const [view, setView] = useState('home');
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [boardFilterId, setBoardFilterId] = useState(null);
    
    // ⭐️ 검색어 상태 추가
    const [searchQuery, setSearchQuery] = useState('');

    // 라우터 역할을 하는 함수
    const navigate = (newView, id = null, boardId = null, query = '') => {
        const protectedViews = ['mypage', 'chatlist', 'chat_create', 'post_edit', 'trip_create'];
        
        if (!isAuthenticated && protectedViews.includes(newView)) { 
            return alert('로그인 필요', '로그인이 필요한 기능입니다.'); 
        }
        
        if (newView === 'post_detail' || newView === 'post_edit') {
            setSelectedPostId(id);
        }

        if (newView === 'trip_detail') {
            setSelectedTripId(id);
        }
        
        setBoardFilterId(boardId); 
        
        // ⭐️ 검색어 상태 업데이트 (검색어가 없으면 초기화)
        setSearchQuery(query);
        
        setView(newView);
    };

    // 채팅방 오버레이 (채팅방에 입장했을 때 전체 화면 덮음)
    if (currentRoom) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar view={view} setView={navigate} />
                <main className="p-4 max-w-4xl mx-auto">
                    <ChatRoomScreen />
                </main>
            </div>
        );
    }

    // 화면 렌더링 로직
    let Component;
    switch (view) {
        // ⭐️ TripListScreen에도 검색어 전달
        case 'trip_list': Component = <TripListScreen setView={navigate} initialSearchQuery={searchQuery} />; break;
        case 'trip_create': Component = <TripCreateScreen setView={navigate} />; break;
        case 'trip_detail': Component = <TripDetailScreen setView={navigate} tripId={selectedTripId} />; break;
        
        case 'login': Component = <LoginScreen setView={navigate} />; break;
        case 'register': Component = <RegisterScreen setView={navigate} />; break;
        case 'mypage': Component = <MyPageScreen initialTab="profile" />; break; 
        case 'mypage_admin': Component = <MyPageScreen initialTab="admin" />; break;

        // ⭐️ PostListScreen에도 검색어 전달
        case 'postlist': Component = <PostListScreen setView={navigate} boardIdFilter={boardFilterId} initialSearchQuery={searchQuery} />; break;
        case 'post_detail': Component = <PostDetailScreen setView={navigate} postId={selectedPostId} />; break;
        case 'post_edit': Component = <PostEditScreen setView={navigate} postId={selectedPostId} boardIdFilter={boardFilterId} />; break;

        case 'chatlist': Component = <ChatListScreen setView={navigate} />; break;
        case 'chat_create': Component = <ChatCreateScreen setView={navigate} />; break;
        
        default: Component = <HomeScreen setView={navigate} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar view={view} setView={navigate} />
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row p-4 gap-6">
                
                {/* 사이드바 */}
                <div className="hidden md:block w-64 flex-shrink-0 mt-10">
                    <Sidebar setView={navigate} currentView={view} boardFilterId={boardFilterId} />
                    <div className="mt-6"><WidgetSidebar setView={navigate} /></div>
                </div>
                
                {/* 메인 컨텐츠 영역 */}
                <div className="flex-grow w-full">{Component}</div>
            </div>
        </div>
    );
};

// 최상위 프로바이더 래핑
const App = () => (
    <ModalProvider>
        <AuthProvider>
            <ChatProvider>
                <AppContent />
            </ChatProvider>
        </AuthProvider>
    </ModalProvider>
);

export default App;
