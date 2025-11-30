import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ANNOUNCEMENT_BOARD_ID } from '../constants';

// ⭐️ setView 함수가 (viewName, postId, boardId, searchQuery) 순서로 인자를 받는다고 가정합니다.
const Sidebar = ({ setView, currentView, boardFilterId }) => {
    const { isAuthenticated } = useAuth();
    
    // ⭐️ 검색어 상태
    const [searchInput, setSearchInput] = useState('');

    // ⭐️ 검색 핸들러
    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchInput.trim()) return; // 빈 값 검색 방지

        // 'postlist' 뷰로 이동, postId=null, boardId=0(전체), searchQuery=입력값
        setView('postlist', null, 0, searchInput.trim()); 
        
        // 입력창 초기화 (선택사항)
        // setSearchInput(''); 
    };

    const menus = [
        // 1. 🏠 카페 홈 (진한 검정색 + 굵게 강조)
        { name: "🏠 카페 홈", view: "home", auth: false, check: 'home', color: 'text-gray-900 font-extrabold' },
        
        // 2. 📌 공지사항 (위치 이동: 홈 바로 아래, 빨간색)
        { name: "📌 공지사항", view: `board_${ANNOUNCEMENT_BOARD_ID}`, auth: false, check: `board_${ANNOUNCEMENT_BOARD_ID}`, color: 'text-red-600 font-bold' },

        // 3. 🗺️ 여행 코스 공유 (남색)
        { name: "🗺️ 여행 코스 공유", view: "trip_list", auth: true, check: 'trip_list', color: 'text-indigo-600 font-bold' },
        
        // 4. 📂 전체 게시판 (주황색)
        { name: "📂 전체 게시판", view: "board_0", auth: false, check: 'board_0', color: 'text-amber-600 font-bold' },

        // 나머지 일반 게시판들
        { name: "자유 게시판", view: "board_1", auth: false, check: 'board_1' },
        { name: "여행 후기", view: "board_2", auth: false, check: 'board_2' },
        { name: "질문과 답변", view: "board_3", auth: false, check: 'board_3' },
        { name: "💬 채팅방 목록", view: "chatlist", auth: true, check: 'chatlist' },
    ];

    return (
        <div className="w-full md:w-64 p-4 bg-white rounded-xl shadow-md h-fit space-y-1 flex-shrink-0">
            
            {/* ⭐️ [신규] 사이드바 검색창 */}
            <form onSubmit={handleSearch} className="mb-4 px-1">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="통합 검색..." 
                        className="w-full border-2 border-gray-200 bg-gray-50 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <button 
                        type="submit"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600"
                    >
                        {/* 돋보기 아이콘 */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>
            </form>

            {/* 기존 메뉴 목록 */}
            {menus.map((menu, idx) => {
                if (menu.auth && !isAuthenticated) return null;
                const isBoard = menu.view.startsWith('board_');
                const isTripActive = menu.check === 'trip_list' && ['trip_list', 'trip_create', 'trip_detail'].includes(currentView);
                
                const isActive = currentView === menu.check || (currentView === 'postlist' && boardFilterId === Number(menu.view.split('_')[1])) || isTripActive;
                
                return (
                    <div key={idx} 
                        onClick={() => isBoard ? setView('postlist', null, Number(menu.view.split('_')[1])) : setView(menu.view)}
                        className={`px-4 py-3 rounded-lg cursor-pointer transition ${isActive ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
                        {/* ⭐️ color 속성이 있으면 해당 클래스 적용 */}
                        <span className={menu.color || ''}>{menu.name}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default Sidebar;
