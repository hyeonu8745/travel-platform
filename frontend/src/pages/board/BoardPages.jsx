import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useGlobalModal } from '../../context/ModalContext';
import { API_BASE_URL, UPLOAD_BASE_URL, ANNOUNCEMENT_BOARD_ID } from '../../constants';
import PaginationControls from '../../components/PaginationControls';

// ⭐️ [신규] React Quill 에디터 추가
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; // 스타일 파일 import

// ----------------------------------------------------------------------
// 1. 게시글 목록 화면 (검색 기능 추가됨)
// ----------------------------------------------------------------------
// ⭐️ initialSearchQuery prop 추가
export const PostListScreen = ({ setView, boardIdFilter, initialSearchQuery = '' }) => {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 10;

    // ⭐️ 초기값을 prop으로 설정 (사이드바 검색어 반영)
    const [searchInput, setSearchInput] = useState(initialSearchQuery); 
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery); 

    // ⭐️ prop이 바뀔 때마다 상태 업데이트 (중요: 사이드바에서 재검색 시 반영)
    useEffect(() => {
        setSearchInput(initialSearchQuery);
        setSearchQuery(initialSearchQuery);
        setPage(1); // 검색어 바뀌면 1페이지로
    }, [initialSearchQuery]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const params = new URLSearchParams({ page, limit: LIMIT });
                
                if (boardIdFilter && boardIdFilter !== 0) {
                    params.append('board_id', boardIdFilter);
                }

                if (searchQuery) {
                    params.append('search_query', searchQuery);
                }
                
                const res = await axios.get(`${API_BASE_URL}/posts?${params}`);
                setPosts(res.data.data || []);
                setTotalPages(res.data.pagination?.totalPages || 1);
            } catch (e) { console.error(e); }
        };
        fetchPosts();
    }, [boardIdFilter, page, searchQuery]);

    // ⭐️ 내부 검색바 핸들러 (목록 화면 안에서 또 검색할 때)
    const handleSearch = (e) => {
        e.preventDefault();
        setSearchQuery(searchInput);
        setPage(1);
    };

    const getBoardTitle = () => {
        if (boardIdFilter === 0) return '📂 전체 게시판';
        if (boardIdFilter === ANNOUNCEMENT_BOARD_ID) return '📌 공지사항';
        if (boardIdFilter === 1) return '🗣️ 자유 게시판';
        if (boardIdFilter === 2) return '📸 여행 후기';
        if (boardIdFilter === 3) return '❓ 질문과 답변';
        return '게시판';
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-md min-h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{getBoardTitle()}</h2>
                
                <div className="flex gap-2">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="검색어 입력" 
                            className="border rounded px-3 py-2 text-sm"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        <button type="submit" className="bg-gray-800 text-white px-3 py-2 rounded text-sm font-bold hover:bg-gray-700">검색</button>
                    </form>

                    <button onClick={() => setView('post_edit', null, boardIdFilter === 0 ? 1 : boardIdFilter)} className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700">글쓰기</button>
                </div>
            </div>

            <div className="space-y-3 flex-grow">
                {posts.length === 0 ? <p className="text-center text-gray-500 py-10">게시물이 없습니다.</p> : 
                posts.map(post => (
                    <div key={post.post_id} onClick={() => setView('post_detail', post.post_id)} className="p-4 border rounded hover:bg-gray-50 cursor-pointer flex justify-between items-center transition">
                        <div className="flex items-center gap-2 overflow-hidden">
                            {(boardIdFilter === 0 || !boardIdFilter) && post.board_id !== ANNOUNCEMENT_BOARD_ID && (
                                <span className={`text-xs px-2 py-1 rounded font-bold flex-shrink-0 ${
                                    post.board_id === 1 ? 'bg-indigo-100 text-indigo-600' :
                                    post.board_id === 2 ? 'bg-green-100 text-green-600' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                    {post.Board?.board_name || '기타'}
                                </span>
                            )}
                            {post.board_id === ANNOUNCEMENT_BOARD_ID && (
                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-bold flex-shrink-0">공지</span>
                            )}
                            <span className="truncate font-medium text-gray-700 ml-1">{post.title}</span>
                        </div>
                        
                        <div className="text-sm text-gray-500 flex items-center gap-3 flex-shrink-0 ml-4">
                            <span className="hidden sm:inline">{post.Author?.nickname || '익명'}</span>
                            <span className="flex items-center gap-1">조회 {post.view_count || 0}</span>
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full ml-1">
                                <svg className="w-3 h-3 text-gray-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs font-bold text-gray-600">{post.comment_count || 0}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <PaginationControls currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
    );
};

// ... (CommentItem, PostDetailScreen, PostEditScreen은 기존과 동일) ...
// 아래 코드는 위에서 주신 코드를 그대로 복사해서 쓰시면 됩니다. (PostListScreen만 바뀐 것임)

const CommentItem = ({ comment, currentUserId, onEdit, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(comment.content);
    const isAuthor = currentUserId === comment.CommentAuthor?.user_id;
    const handleSave = () => { onEdit(comment.comment_id, content); setIsEditing(false); };

    return (
        <div className="p-3 bg-gray-50 rounded border border-gray-100">
            <div className="flex justify-between text-xs mb-1">
                <span className="font-bold">{comment.CommentAuthor?.nickname}</span>
                <span className="text-gray-400">{new Date(comment.created_at).toLocaleString()}</span>
            </div>
            {isEditing ? (
                <div className="flex gap-2">
                    <input className="flex-grow border rounded px-2 text-sm" value={content} onChange={e => setContent(e.target.value)} />
                    <button onClick={handleSave} className="text-xs bg-indigo-600 text-white px-2 rounded">저장</button>
                    <button onClick={() => setIsEditing(false)} className="text-xs bg-gray-300 px-2 rounded">취소</button>
                </div>
            ) : (
                <div className="flex justify-between items-start">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                    {isAuthor && (
                        <div className="flex gap-1">
                            <button onClick={() => setIsEditing(true)} className="text-xs text-yellow-600">수정</button>
                            <button onClick={() => onDelete(comment.comment_id)} className="text-xs text-red-600">삭제</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const PostDetailScreen = ({ setView, postId }) => {
    const { user, isAdmin } = useAuth();
    const { alert, confirm } = useGlobalModal();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        axios.get(`${API_BASE_URL}/posts/${postId}`).then(res => { 
            setPost(res.data.post); 
            setComments(res.data.comments || []); 
        }).catch(console.error);
    }, [postId]);

    const handleDelete = () => confirm('삭제', '삭제하시겠습니까?', async (yes) => { if(yes) { await axios.delete(`${API_BASE_URL}/posts/${postId}`); alert('삭제됨'); setView('postlist', null, post.board_id); } });
    const handleAdminDelete = () => confirm('강제삭제', '관리자 권한으로 삭제합니까?', async (yes) => { if(yes) { await axios.delete(`${API_BASE_URL}/admin/posts/${postId}`); alert('삭제됨'); setView('postlist', null, post.board_id); } });
    const submitComment = async (e) => { e.preventDefault(); try { const res = await axios.post(`${API_BASE_URL}/posts/${postId}/comments`, { content: newComment }); setComments(p => [...p, { ...res.data.data, CommentAuthor: { nickname: user.nickname, user_id: user.user_id } }]); setNewComment(''); } catch(e) { alert('오류', '작성 실패'); } };
    const editComment = async (cid, txt) => { await axios.put(`${API_BASE_URL}/posts/${postId}/comments/${cid}`, { content: txt }); setComments(p => p.map(c => c.comment_id === cid ? {...c, content: txt} : c)); };
    const deleteComment = (cid) => confirm('삭제', '댓글 삭제?', async (yes) => { if(yes) { await axios.delete(`${API_BASE_URL}/posts/${postId}/comments/${cid}`); setComments(p => p.filter(c => c.comment_id !== cid)); } });

    if (!post) return <div>로딩...</div>;
    const isAuthor = user?.user_id === post.user_id;

    return (
        <div className="p-8 bg-white rounded-xl shadow-lg">
            <div className="flex justify-between mb-4">
                <button onClick={() => setView('postlist', null, post.board_id)} className="text-indigo-600 font-bold">&larr; 목록</button>
                <div className="space-x-2">
                    {isAuthor && <><button onClick={() => setView('post_edit', postId)} className="text-sm bg-yellow-500 text-white px-2 py-1 rounded">수정</button><button onClick={handleDelete} className="text-sm bg-red-500 text-white px-2 py-1 rounded">삭제</button></>}
                    {isAdmin && !isAuthor && <button onClick={handleAdminDelete} className="text-sm bg-red-800 text-white px-2 py-1 rounded">관리자 삭제</button>}
                </div>
            </div>
            
            <div className="mb-2 flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded font-bold">
                    {post.Board?.board_name || '게시판'}
                </span>
                <h1 className="text-3xl font-extrabold">{post.title}</h1>
            </div>

            <p className="text-gray-500 text-sm mb-6 border-b pb-4">
                작성: {post.Author?.nickname} | 조회수: {post.view_count || 0} | {new Date(post.created_at).toLocaleString()}
            </p>
            
            {post.image_url && <img src={`${UPLOAD_BASE_URL}/${post.image_url}`} alt="img" className="max-w-full rounded mb-6"/>}
            
            <div 
                className="prose max-w-none mb-10 min-h-[100px] ql-editor"
                dangerouslySetInnerHTML={{ __html: post.content }} 
            />

            <h3 className="font-bold border-t pt-4 mb-4">댓글 ({comments.length})</h3>
            <div className="space-y-3 mb-6">{comments.map(c => <CommentItem key={c.comment_id} comment={c} currentUserId={user?.user_id} onEdit={editComment} onDelete={deleteComment} />)}</div>
            {user && <form onSubmit={submitComment} className="flex gap-2"><input className="flex-grow border rounded p-2" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="댓글 작성..." /><button className="bg-indigo-600 text-white px-4 rounded font-bold">등록</button></form>}
        </div>
    );
};

export const PostEditScreen = ({ setView, postId, boardIdFilter }) => {
    const { isAdmin } = useAuth();
    const { alert } = useGlobalModal();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [boardId, setBoardId] = useState(boardIdFilter || 1);
    const [file, setFile] = useState(null);

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image'], 
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list',
        'link', 'image'
    ];

    const WARNING_MESSAGE = `[게시글 작성 시 주의사항]
1. 타인을 비방하거나 욕설 사용을 자제해 주세요.
2. 저작권에 위배되는 자료는 게시할 수 없습니다.
3. 광고 및 홍보성 글은 삭제될 수 있습니다.
4. 즐거운 커뮤니티를 위해 서로 배려해 주세요!`;

    useEffect(() => {
        if (postId) {
            axios.get(`${API_BASE_URL}/posts/${postId}`).then(res => { 
                setTitle(res.data.post.title); 
                setContent(res.data.post.content); 
                setBoardId(res.data.post.board_id); 
            });
        } else {
            setContent('');
        }
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const fd = new FormData(); 
        fd.append('title', title); 
        fd.append('content', content); 
        fd.append('board_id', boardId); 
        if (file) fd.append('image', file); 
        
        try { 
            if (postId) await axios.put(`${API_BASE_URL}/posts/${postId}`, fd); 
            else await axios.post(`${API_BASE_URL}/posts`, fd); 
            
            alert('성공', '저장되었습니다.'); 
            setView('postlist', null, boardId); 
        } catch (e) { 
            alert('오류', '저장 실패'); 
        }
    };

    return (
        <div className="p-8 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">{postId ? '글 수정' : '새 글 작성'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <select value={boardId} onChange={e => setBoardId(Number(e.target.value))} className="w-full p-3 border rounded">
                    <option value={1}>자유 게시판</option><option value={2}>여행 후기</option><option value={3}>질문과 답변</option>{isAdmin && <option value={4}>공지사항</option>}
                </select>
                <input className="w-full p-3 border rounded" placeholder="제목" value={title} onChange={e => setTitle(e.target.value)} required />
                
                <div className="flex flex-col">
                    <div className="w-full p-4 bg-red-50 text-gray-600 text-sm border border-gray-300 rounded-t-lg border-b-0 whitespace-pre-wrap select-none">
                        <span className="font-bold text-red-500">⚠ 필독 ⚠</span>
                        {'\n' + WARNING_MESSAGE}
                    </div>

                    <div className="bg-white">
                        <ReactQuill 
                            theme="snow"
                            value={content}
                            onChange={setContent}
                            modules={modules}
                            formats={formats}
                            style={{ height: '300px', marginBottom: '50px' }} 
                            placeholder="내용을 입력하세요. (이미지 첨부 가능)"
                        />
                    </div>
                </div>
                
                <div className="mt-4">
                    <label className="text-sm font-bold text-gray-600 block mb-1">대표 이미지 (목록용 썸네일)</label>
                    <input type="file" onChange={e => setFile(e.target.files[0])} className="w-full text-sm" />
                </div>

                <button className="w-full bg-green-600 text-white py-3 rounded font-bold mt-4">{postId ? '수정하기' : '등록하기'}</button>
            </form>
        </div>
    );
};
