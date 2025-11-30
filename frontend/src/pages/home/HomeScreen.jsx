import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useChat } from '../../context/ChatContext';
import { API_BASE_URL, ANNOUNCEMENT_BOARD_ID } from '../../constants';

// ⭐️ 채팅방 위젯 (높이 축소: h-[340px])
const PopularChatRoomsWidget = ({ rooms, joinRoom, setView }) => (
    <div className="bg-white p-5 rounded-xl shadow-md border border-indigo-100 flex flex-col h-[340px]">
        <div className="flex justify-between items-center mb-3 border-b pb-2 flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-900">🔥 인기 채팅방</h2>
            <button onClick={() => setView('chatlist')} className="text-xs text-gray-400 hover:text-indigo-600 font-medium">전체 보기</button>
        </div>
        
        <div className="flex-grow overflow-hidden">
            {rooms.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    활성화된 방이 없습니다.
                </div>
            ) : (
                <ul className="space-y-2">
                    {/* 채팅방은 높이가 낮으므로 4~5개 표시 가능 */}
                    {rooms.slice(0, 5).map((r, i) => (
                        <li key={r.room_id} onClick={() => joinRoom(r.room_id)} className="flex justify-between items-center p-2 hover:bg-indigo-50 rounded-lg cursor-pointer transition border border-transparent hover:border-indigo-100">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <span className={`text-sm font-bold w-4 flex-shrink-0 ${i < 3 ? 'text-red-500' : 'text-gray-400'}`}>{i+1}.</span>
                                <span className="font-medium text-gray-700 truncate text-sm">{r.room_name}</span>
                            </div>
                            <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-medium">{r.message_count} msg</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    </div>
);

const HomeScreen = ({ setView }) => {
    const { fetchPopularChatrooms, popularChatrooms, joinRoom } = useChat();
    const [recentPosts, setRecentPosts] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [recentTrips, setRecentTrips] = useState([]);

    useEffect(() => {
        fetchPopularChatrooms();
        
        // 1. 최신 글 (높이에 맞춰 4개로 조정)
        axios.get(`${API_BASE_URL}/posts?limit=4&exclude_board_id=${ANNOUNCEMENT_BOARD_ID}`)
            .then(r => setRecentPosts(r.data.data))
            .catch(console.error);
            
        // 2. 공지사항 (높이에 맞춰 4개로 조정)
        axios.get(`${API_BASE_URL}/posts?limit=4&board_id=${ANNOUNCEMENT_BOARD_ID}`)
            .then(r => setAnnouncements(r.data.data))
            .catch(console.error);

        // 3. 최신 여행 코스 (카드 형태라 높이가 커서 3개로 조정)
        axios.get(`${API_BASE_URL}/trips`)
            .then(r => {
                const trips = r.data.data || [];
                setRecentTrips(trips.slice(0, 3)); 
            })
            .catch(console.error);

    }, [fetchPopularChatrooms]);

    return (
        <div className="p-4 space-y-5 max-w-7xl mx-auto">
            {/* 상단 배너 */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-2xl shadow-xl text-center">
                <h1 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">Trip Community</h1>
                <p className="text-base md:text-lg opacity-90 mb-6 font-light">여행을 계획하고, 소중한 이야기를 나누세요.</p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => setView('trip_create')} className="bg-white text-indigo-600 px-6 py-2 rounded-full font-bold shadow-lg hover:bg-gray-100 transition text-sm">🗺️ 코스 짜기</button>
                    <button onClick={() => setView('postlist', null, 1)} className="border-2 border-white text-white px-6 py-2 rounded-full font-bold hover:bg-white hover:text-indigo-600 transition text-sm">🗣️ 구경하기</button>
                </div>
            </div>

            {/* 메인 그리드 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                
                {/* --- 왼쪽 컬럼 --- */}
                <div className="space-y-5">
                    {/* ⭐️ 공지사항 위젯 (h-[340px]) */}
                    <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-red-500 flex flex-col h-[340px]">
                        <div className="flex justify-between items-center mb-3 border-b pb-2 flex-shrink-0">
                            <h3 className="font-bold text-lg text-gray-800">📌 공지사항</h3>
                            <button onClick={() => setView('postlist', null, ANNOUNCEMENT_BOARD_ID)} className="text-xs text-gray-400 hover:text-indigo-600 font-medium">더보기</button>
                        </div>
                        <div className="flex-grow overflow-hidden">
                            {announcements.length === 0 ? <p className="text-gray-400 text-center py-20 text-sm">등록된 공지가 없습니다.</p> :
                                <ul className="space-y-2">
                                    {announcements.map(p => (
                                        <li key={p.post_id} onClick={() => setView('post_detail', p.post_id)} className="cursor-pointer hover:text-indigo-600 truncate py-2 border-b border-dashed border-gray-100 last:border-0 flex justify-between items-center group">
                                            <span className="truncate text-sm group-hover:font-medium transition">{p.title}</span>
                                            <span className="text-xs text-gray-400 flex-shrink-0 bg-gray-50 px-1.5 py-0.5 rounded">{new Date(p.created_at).toLocaleDateString()}</span>
                                        </li>
                                    ))}
                                </ul>
                            }
                        </div>
                    </div>

                    {/* ⭐️ 최신 글 위젯 (h-[340px]) */}
                    <div className="bg-white p-5 rounded-xl shadow-md flex flex-col h-[340px]">
                        <div className="flex justify-between items-center mb-3 border-b pb-2 flex-shrink-0">
                            <h3 className="font-bold text-lg text-gray-800">📝 최신 글</h3>
                            <button onClick={() => setView('postlist')} className="text-xs text-gray-400 hover:text-indigo-600 font-medium">더보기</button>
                        </div>
                        <div className="flex-grow overflow-hidden">
                            {recentPosts.length === 0 ? <p className="text-gray-400 text-center py-20 text-sm">게시글이 없습니다.</p> :
                                <ul className="space-y-2">
                                    {recentPosts.map(p => (
                                        <li key={p.post_id} onClick={() => setView('post_detail', p.post_id)} className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition flex justify-between items-center border border-gray-100 hover:border-indigo-200">
                                            <div className="truncate text-sm font-medium text-gray-700 w-2/3">
                                                {p.title} 
                                            </div>
                                            <div className="flex items-center text-xs text-gray-400 gap-2 flex-shrink-0">
                                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{p.Author?.nickname}</span>
                                                <span className="flex items-center text-indigo-400">view {p.view_count || 0}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            }
                        </div>
                    </div>
                </div>

                {/* --- 오른쪽 컬럼 --- */}
                <div className="space-y-5">
                    {/* 인기 채팅방 위젯 */}
                    <PopularChatRoomsWidget rooms={popularChatrooms} joinRoom={joinRoom} setView={setView} />

                    {/* ⭐️ 최신 여행 코스 위젯 (h-[340px]) */}
                    <div className="bg-white p-5 rounded-xl shadow-md border-t-4 border-indigo-500 flex flex-col h-[340px]">
                        <div className="flex justify-between items-center mb-3 border-b pb-2 flex-shrink-0">
                            <h3 className="font-bold text-lg text-gray-800">🗺️ 최신 여행 코스</h3>
                            <button onClick={() => setView('trip_list')} className="text-xs text-gray-400 hover:text-indigo-600 font-medium">더보기</button>
                        </div>
                        
                        <div className="flex-grow overflow-hidden">
                            {recentTrips.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                                    <p className="mb-1">공유된 여행 코스가 없습니다.</p>
                                    <button onClick={() => setView('trip_create')} className="text-indigo-600 underline font-bold hover:text-indigo-800">첫 코스 만들기</button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {/* ⭐️ 여행 코스는 카드 크기가 커서 3개만 표시 */}
                                    {recentTrips.map(t => (
                                        <div key={t.trip_id} onClick={() => setView('trip_detail', t.trip_id)} className="cursor-pointer bg-gray-50 hover:bg-indigo-50 p-3 rounded-lg transition border border-gray-100 hover:border-indigo-200 group">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-sm text-gray-800 truncate pr-2 group-hover:text-indigo-700 transition">{t.title}</h4>
                                                <span className="text-xs bg-white border border-indigo-100 px-1.5 py-0.5 rounded-full text-indigo-500 font-bold flex-shrink-0 shadow-sm">
                                                    {t.Days?.length || 1}일
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs text-gray-500">
                                                <span className="font-medium text-gray-600">by {t.Author?.nickname}</span>
                                                <div className="flex gap-2">
                                                    <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200">{t.start_date}</span>
                                                    <span className="font-bold text-indigo-500">view {t.view_count || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
export default HomeScreen;