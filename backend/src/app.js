require('dotenv').config(); 
const express = require('express');
const bodyParser = require('body-parser'); 
const cors = require('cors');

const app = express();

const router = require('./routes/index'); 
const errorMiddleware = require('./middlewares/error.middleware'); 
const NotFoundError = require('./errors/notFound.error'); 

console.log('--- .env 파일 로드 검사 ---');
console.log('DB 호스트:', process.env.DB_HOST);
console.log('JWT 비밀 키:', process.env.JWT_SECRET_KEY); // 'please_use_a_long'이 출력되어야 함
console.log('---------------------------');

// 0. CORS 미들웨어 등록
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

// 1. 기본 미들웨어 설정
// Multer 사용 시 FormData 파싱을 위해 bodyParser.json()과 urlencoded()는 필요하지만,
// 파일 데이터 자체는 Multer가 처리합니다.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ⭐️ 파일 업로드 기능 추가: uploads 폴더를 /uploads 경로로 정적 제공 ⭐️
// 이 미들웨어는 Multer 미들웨어 이전에 위치해야 합니다.
app.use('/uploads', express.static('uploads'));

// 2. 헬스 체크 라우트
app.get('/', (req, res) => {
    res.send('Community API Server is Running!');
});

// 3. 최종 라우터 연결 (인증, 게시판, 채팅)
app.use('/api', router); 

// 4. 잘못된 경로(404) 처리 미들웨어
app.use((req, res, next) => {
    next(new NotFoundError(`경로 ${req.originalUrl}`)); 
});

// 5. 최종 에러 핸들러 등록
app.use(errorMiddleware); 

module.exports = app;