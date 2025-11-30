import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useGlobalModal } from '../../context/ModalContext';
import { API_BASE_URL, SOCKET_BASE_URL, GOOGLE_MAPS_API_KEY } from '../../constants'; // ⭐️ SOCKET_BASE_URL 사용
import { GoogleMap, Marker, Polyline, useJsApiLoader, Autocomplete } from '../../components/GoogleMapWrapper';

const LIBRARIES = ['places'];

// 일차별 마커 색상 정의
const MARKER_COLORS = [
    'red', 'blue', 'green', 'purple', 'yellow', 'orange', 'pink'
];

const getMarkerIconUrl = (dayIndex) => {
    const colorIndex = (dayIndex - 1) % MARKER_COLORS.length;
    const color = MARKER_COLORS[colorIndex];
    return `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`;
};

// ==============================================================================
// 1. 여행 코스 목록 화면
// ==============================================================================
export const TripListScreen = ({ setView, initialSearchQuery = '' }) => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [searchInput, setSearchInput] = useState(initialSearchQuery);
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchQuery(searchInput);
    };

    useEffect(() => {
        setSearchInput(initialSearchQuery);
        setSearchQuery(initialSearchQuery);
    }, [initialSearchQuery]);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams();
                if (searchQuery) {
                    params.append('search_query', searchQuery);
                }
                const res = await axios.get(`${API_BASE_URL}/trips?${params}`);
                setTrips(res.data.data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrips();
    }, [searchQuery]);

    return (
        <div className="p-6 bg-white rounded-xl shadow-md min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">🗺️ 여행 코스 공유</h2>
                
                <div className="flex gap-2">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="여행 코스 검색" 
                            className="border rounded px-3 py-2 text-sm"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        <button type="submit" className="bg-gray-800 text-white px-3 py-2 rounded text-sm font-bold hover:bg-gray-700">검색</button>
                    </form>

                    <button onClick={() => setView('trip_create')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow">+ 코스 짜기</button>
                </div>
            </div>
            
            {loading ? <div className="text-center py-10">로딩 중...</div> : 
             trips.length === 0 ? <div className="text-center text-gray-500 py-10">{searchQuery ? '검색 결과가 없습니다.' : '공유된 여행 코스가 없습니다. 첫 코스를 등록해보세요!'}</div> :
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trips.map(trip => (
                    <div key={trip.trip_id} onClick={() => setView('trip_detail', trip.trip_id)} className="border rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer bg-white">
                        {/* ⭐️ 이미지 경로 수정: SOCKET_BASE_URL + trip.image_url */}
                        {trip.image_url ? (
                            <img 
                                src={`${SOCKET_BASE_URL}${trip.image_url}`} 
                                alt={trip.title} 
                                className="h-32 w-full object-cover"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/300x150?text=No+Image'; }} // 깨짐 방지
                            />
                        ) : (
                            <div className="h-32 bg-indigo-100 flex items-center justify-center text-4xl">✈️</div>
                        )}
                        
                        <div className="p-4">
                            <h3 className="font-bold text-lg mb-1 truncate">{trip.title}</h3>
                            <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                                <span>{trip.start_date} ~ {trip.end_date}</span>
                                <span className="text-gray-500 text-xs">조회수 {trip.view_count || 0}</span>
                            </div>
                            <div className="text-xs bg-gray-100 p-2 rounded text-gray-600 flex items-center gap-1">
                                <span>👤 {trip.Author?.nickname}</span>
                                <span className="mx-1">|</span>
                                <span>총 {trip.Days?.reduce((acc, day) => acc + day.Stops.length, 0) || 0}개 장소</span>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
            }
        </div>
    );
};

// ==============================================================================
// 2. 여행 코스 상세 화면
// ==============================================================================
export const TripDetailScreen = ({ setView, tripId }) => {
    const { user, isAdmin } = useAuth();
    const { alert, confirm } = useGlobalModal();
    const { isLoaded } = useJsApiLoader({ 
        id: 'google-map-script', 
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES 
    });
    const [trip, setTrip] = useState(null);
    const [allMarkers, setAllMarkers] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const [map, setMap] = useState(null);

    const fetchedTripIdRef = useRef(null);
    const defaultCenter = useMemo(() => ({ lat: 37.5665, lng: 126.9780 }), []);

    const onLoad = useCallback((mapInstance) => {
        setMap(mapInstance);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    useEffect(() => {
        if (!tripId) return;
        if (fetchedTripIdRef.current === tripId) return;
        fetchedTripIdRef.current = tripId;

        axios.get(`${API_BASE_URL}/trips/${tripId}`) 
            .then(res => {
                const data = res.data.data;
                setTrip(data);
                
                const flattenedStops = data.Days?.flatMap(day => 
                    day.Stops.map((s, index) => ({
                        lat: parseFloat(s.latitude), 
                        lng: parseFloat(s.longitude), 
                        name: s.location_name || s.name || '이름 없음', 
                        day: day.day_index,
                        sequence: index + 1,
                        memo: s.memo,
                        stop_id: s.stop_id
                    }))
                ) || [];
                
                setAllMarkers(flattenedStops);
            })
            .catch(error => {
                console.error(error);
                alert('오류', '여행 정보를 불러오지 못했습니다.');
                setView('trip_list');
            });
    }, [tripId]);

    const handleDelete = () => {
        confirm('삭제', '정말 이 여행 일정을 삭제하시겠습니까?', async (yes) => {
            if (yes) {
                try {
                    const token = localStorage.getItem('token');
                    await axios.delete(`${API_BASE_URL}/trips/${tripId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    alert('삭제 성공', '여행 일정이 삭제되었습니다.');
                    setView('trip_list');
                } catch (e) {
                    alert('오류', e.response?.data?.message || '삭제 실패');
                }
            }
        });
    };

    const handleDayClick = (dayIndex) => {
        if (selectedDay === dayIndex) {
            setSelectedDay(null); 
        } else {
            setSelectedDay(dayIndex); 
        }
    };

    const isOwner = user?.user_id === trip?.user_id;
    const canDelete = isOwner || isAdmin;

    const visibleMarkers = selectedDay 
        ? allMarkers.filter(m => m.day === selectedDay) 
        : allMarkers;

    useEffect(() => {
        if (map && visibleMarkers.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            visibleMarkers.forEach(marker => {
                bounds.extend({ lat: marker.lat, lng: marker.lng });
            });
            map.fitBounds(bounds);
        }
    }, [map, visibleMarkers]);

    if (!trip) return <div>로딩 중...</div>;
    if (!isLoaded) return <div>지도 로딩 중...</div>;

    const polylines = (trip.Days || [])
        .filter(day => selectedDay === null || day.day_index === selectedDay)
        .map(day => {
            const path = day.Stops.map(s => ({
                lat: parseFloat(s.latitude),
                lng: parseFloat(s.longitude)
            }));
            const color = MARKER_COLORS[(day.day_index - 1) % MARKER_COLORS.length];
            return { path, color, dayIndex: day.day_index };
        });

    return (
        <div className="flex flex-col lg:flex-row h-[80vh] gap-4 p-2">
            <div className="w-full lg:w-1/3 bg-white p-5 rounded-xl shadow-lg overflow-y-auto flex flex-col h-full border border-gray-100">
                <div className="flex-shrink-0 flex justify-between items-start mb-4">
                    <button onClick={() => setView('trip_list')} className="text-gray-500 font-bold hover:text-indigo-600 text-sm flex items-center">
                        ← 목록으로
                    </button>
                    {canDelete && (
                        <button onClick={handleDelete} className="bg-red-500 text-white text-xs px-3 py-1.5 rounded font-bold hover:bg-red-600 transition">삭제</button>
                    )}
                </div>
                
                {/* ⭐️ 상세화면에도 이미지 표시 */}
                {trip.image_url && (
                     <img 
                        src={`${SOCKET_BASE_URL}${trip.image_url}`} 
                        alt={trip.title} 
                        className="w-full h-48 object-cover rounded-lg mb-4 shadow-sm"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x150?text=No+Image'; }}
                    />
                )}

                <h2 className="text-2xl font-bold mb-4 text-gray-800 leading-tight">{trip.title}</h2>
                
                <div className="flex-shrink-0 bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                        <span className="text-lg">🗓️</span> 
                        <span className="font-medium">{trip.start_date} ~ {trip.end_date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="font-bold text-gray-600">조회수</span> 
                        <span className="text-indigo-600 font-bold">{trip.view_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <span className="font-bold text-gray-600">작성자</span> 
                        <span>{trip.Author?.nickname || '알 수 없음'}</span>
                    </div>
                    
                    {selectedDay !== null && (
                        <button 
                            onClick={() => setSelectedDay(null)}
                            className="mt-3 w-full bg-indigo-100 text-indigo-700 text-xs py-2 rounded font-bold hover:bg-indigo-200 transition"
                        >
                            🔄 전체 일정 보기
                        </button>
                    )}
                </div>

                <div className="flex-grow space-y-8">
                    {trip.Days && trip.Days.length > 0 ? (
                        trip.Days.map((day) => {
                            const isHidden = selectedDay !== null && selectedDay !== day.day_index;
                            if (isHidden) return null;

                            return (
                                <div key={day.day_id} className="relative">
                                    <div 
                                        className="flex items-center mb-3 cursor-pointer group" 
                                        onClick={() => handleDayClick(day.day_index)}
                                    >
                                        <div 
                                            className="text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm z-10 transition group-hover:scale-105"
                                            style={{ backgroundColor: MARKER_COLORS[(day.day_index - 1) % MARKER_COLORS.length] }}
                                        >
                                            {day.day_index}일차
                                        </div>
                                        <div className="h-px bg-gray-200 flex-grow ml-3 group-hover:bg-gray-300"></div>
                                        <span className="text-xs text-gray-400 ml-2 group-hover:text-indigo-500">
                                            {selectedDay === day.day_index ? '전체보기' : '지도에서 보기'}
                                        </span>
                                    </div>
                                    
                                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-100 -z-0"></div>

                                    {day.Stops && day.Stops.length > 0 ? (
                                        <div className="space-y-4 pl-2">
                                            {day.Stops.map((stop, index) => (
                                                <div key={stop.stop_id} className="relative z-10 flex items-start gap-3 bg-white p-3 rounded-lg border border-gray-200 hover:border-indigo-300 transition shadow-sm hover:shadow-md">
                                                    <div 
                                                        className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full text-xs font-bold mt-0.5 text-white"
                                                        style={{ backgroundColor: MARKER_COLORS[(day.day_index - 1) % MARKER_COLORS.length] }}
                                                    >
                                                        {index + 1}
                                                    </div>
                                                    
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-gray-800 text-sm truncate">
                                                            {stop.location_name || '장소명 없음'}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1 break-words">
                                                            {stop.memo ? `📝 ${stop.memo}` : '메모 없음'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 pl-4 py-2">일정이 없습니다.</p>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center text-gray-400 py-10">
                            등록된 일정이 없습니다.
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full lg:w-2/3 rounded-xl overflow-hidden shadow-lg border-2 border-white relative">
                <GoogleMap 
                    mapContainerStyle={{width: '100%', height: '100%'}} 
                    center={defaultCenter} 
                    zoom={10} 
                    onLoad={onLoad} 
                    onUnmount={onUnmount}
                >
                    {polylines.map((line) => (
                        <Polyline
                            key={`line-${line.dayIndex}`}
                            path={line.path}
                            options={{
                                strokeColor: line.color,
                                strokeOpacity: 0.8,
                                strokeWeight: 5,
                                icons: [{
                                    icon: { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
                                    offset: '50%',
                                    repeat: '100px'
                                }]
                            }}
                        />
                    ))}

                    {visibleMarkers.map((m, i) => (
                        <Marker 
                            key={i} 
                            position={m} 
                            icon={getMarkerIconUrl(m.day)}
                            label={{
                                text: `${m.day}-${m.sequence}`, 
                                color: "black", 
                                fontWeight: "bold",
                                fontSize: "10px"
                            }} 
                        />
                    ))}
                </GoogleMap>
            </div>
        </div>
    );
};

// ==============================================================================
// 3. 여행 코스 생성 화면
// ==============================================================================
export const TripCreateScreen = ({ setView }) => {
    const { isLoaded } = useJsApiLoader({ 
        id: 'google-map-script', 
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES 
    });
    const { alert } = useGlobalModal();
    
    const [days, setDays] = useState([{ day: 1, places: [] }]);
    const [currentDay, setCurrentDay] = useState(1); 
    const [title, setTitle] = useState('');
    const [dates, setDates] = useState({ start: '', end: '' });
    
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [map, setMap] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    const autocompleteRef = useRef(null);

    const defaultCenter = useMemo(() => ({ lat: 37.5665, lng: 126.9780 }), []);
    const mapOptions = useMemo(() => ({ disableDefaultUI: false, zoomControl: true, streetViewControl: false }), []);

    const onLoad = useCallback((mapInstance) => {
        setMap(mapInstance);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const onAutocompleteLoad = (autocompleteInstance) => {
        autocompleteRef.current = autocompleteInstance;
        autocompleteInstance.setFields(['geometry', 'name']);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const addPlaceToCurrentDay = (place) => {
        setDays(prevDays => prevDays.map(d => {
            if (d.day === currentDay) {
                return { ...d, places: [...d.places, place] };
            }
            return d;
        }));
    };

    const moveAndAddPlace = (lat, lng, name) => {
        const newLocation = { lat, lng, name };
        if (map) {
            map.panTo(newLocation);
            map.setZoom(15);
        }
        addPlaceToCurrentDay(newLocation); 
        setSearchQuery('');
    };

    const onPlaceChanged = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry && place.geometry.location) {
                moveAndAddPlace(
                    place.geometry.location.lat(),
                    place.geometry.location.lng(),
                    place.name
                );
                return;
            }
            if (place.name && map) {
                const service = new window.google.maps.places.PlacesService(map);
                service.findPlaceFromQuery({
                    query: place.name,
                    fields: ['geometry', 'name']
                }, (results, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
                        moveAndAddPlace(
                            results[0].geometry.location.lat(),
                            results[0].geometry.location.lng(),
                            results[0].name
                        );
                    } else {
                        alert('알림', '장소를 찾을 수 없습니다.');
                    }
                });
                return;
            }
            alert('알림', '장소 정보를 찾을 수 없습니다.');
        }
    };

    const handleSearch = (e) => { e.preventDefault(); };

    const handleMapClick = (e) => {
        const newLocation = { 
            lat: e.latLng.lat(), 
            lng: e.latLng.lng(), 
            name: `지정 장소` 
        };
        addPlaceToCurrentDay(newLocation);
    };

    const handleAddDay = () => {
        const nextDay = days.length + 1;
        setDays([...days, { day: nextDay, places: [] }]);
        setCurrentDay(nextDay); 
    };

    const handleDeletePlace = (dayIndex, placeIndex) => {
        setDays(prevDays => prevDays.map((d, i) => {
            if (i === dayIndex) {
                return { ...d, places: d.places.filter((_, idx) => idx !== placeIndex) };
            }
            return d;
        }));
    };

    const saveTrip = async () => {
        const totalPlaces = days.reduce((acc, curr) => acc + curr.places.length, 0);
        if (!title || totalPlaces === 0) return alert('오류', '제목과 최소 1개 이상의 장소를 입력하세요.');
        
        const flatStops = days.flatMap(d => 
            d.places.map((p, idx) => ({ ...p, day: d.day, order: idx + 1 }))
        );

        try { 
            const formData = new FormData();
            formData.append('title', title);
            formData.append('startDate', dates.start);
            formData.append('endDate', dates.end);
            formData.append('stops', JSON.stringify(flatStops));
            
            if (selectedImage) {
                formData.append('image', selectedImage);
            }

            const token = localStorage.getItem('token');
            
            await axios.post(`${API_BASE_URL}/trips`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });

            alert('성공', '여행 코스가 저장되었습니다!'); 
            setView('trip_list'); 
        } catch (e) { 
            console.error(e);
            alert('오류', '저장 실패'); 
        }
    };

    if (!isLoaded) return <div className="p-10 text-center">지도 로딩 중...</div>;
    const currentDayPlaces = days.find(d => d.day === currentDay)?.places || [];

    return (
        <div className="flex flex-col lg:flex-row h-[85vh] gap-4 p-2">
            <div className="w-full lg:w-2/5 bg-white p-5 rounded-xl shadow-lg flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setView('trip_list')} className="text-gray-500 hover:text-gray-700 font-bold">← 취소</button>
                    <h2 className="text-xl font-bold text-indigo-700">✈️ 새 코스 만들기</h2>
                    <button onClick={saveTrip} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold text-sm hover:bg-indigo-700 shadow">저장</button>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
                    {previewUrl ? (
                        <div className="relative inline-block w-full">
                            <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg mb-2" />
                            <button 
                                onClick={() => { setSelectedImage(null); setPreviewUrl(null); }}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full text-xs w-6 h-6 flex items-center justify-center shadow-md"
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-100 transition">
                            <span className="text-3xl mb-2">📷</span>
                            <span className="text-sm text-gray-500 font-medium">대표 사진 업로드</span>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                    )}
                </div>

                <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <input className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200 outline-none" placeholder="여행 제목 (예: 도쿄 3박 4일)" value={title} onChange={e => setTitle(e.target.value)} />
                    <div className="flex gap-2">
                        <input type="date" className="w-1/2 p-2 border rounded text-sm" value={dates.start} onChange={e => setDates({...dates, start: e.target.value})} />
                        <input type="date" className="w-1/2 p-2 border rounded text-sm" value={dates.end} onChange={e => setDates({...dates, end: e.target.value})} />
                    </div>
                </div>
                <form onSubmit={handleSearch} className="mb-4 flex gap-2 w-full">
                    <div className="flex-grow relative">
                        <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
                            <input className="w-full p-3 pl-9 border-2 border-indigo-100 rounded-lg focus:outline-none focus:border-indigo-500 shadow-sm" placeholder="장소 검색 (예: 도쿄 타워)" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </Autocomplete>
                        <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
                    </div>
                </form>
                <div className="flex gap-2 mb-2 overflow-x-auto pb-2 scrollbar-hide">
                    {days.map((d) => (
                        <button key={d.day} onClick={() => setCurrentDay(d.day)} className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${currentDay === d.day ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}`}>{d.day}일차</button>
                    ))}
                    <button onClick={handleAddDay} className="px-3 py-1.5 rounded-full text-sm font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 whitespace-nowrap">+ 추가</button>
                </div>
                <div className="flex-grow overflow-y-auto space-y-2 pr-1">
                    {currentDayPlaces.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg"><p className="text-2xl mb-2">📍</p><p className="text-gray-500 font-medium">{currentDay}일차 일정이 비어있습니다.</p><p className="text-xs text-gray-400 mt-1">지도를 클릭하거나 검색하여 추가하세요.</p></div>
                    ) : (
                        currentDayPlaces.map((m, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-indigo-300 transition">
                                <div className="flex items-center gap-3 overflow-hidden"><span className="bg-indigo-100 text-indigo-700 w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full text-xs font-bold">{i+1}</span><span className="text-sm font-medium text-gray-700 truncate">{m.name}</span></div>
                                <button onClick={() => handleDeletePlace(days.findIndex(d => d.day === currentDay), i)} className="text-gray-400 hover:text-red-500 p-1">✕</button>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className="w-full lg:w-3/5 rounded-xl overflow-hidden shadow-lg border-2 border-white relative">
                <GoogleMap mapContainerStyle={{width: '100%', height: '100%'}} center={defaultCenter} zoom={10} onLoad={onLoad} onUnmount={onUnmount} onClick={handleMapClick} options={mapOptions}>
                    {currentDayPlaces.map((m, i) => <Marker key={`d${currentDay}-${i}`} position={m} label={{text: `${i+1}`, color: "white", fontWeight: "bold"}} />)}
                </GoogleMap>
            </div>
        </div>
    );
};
