const jwt = require('jsonwebtoken');
const { User } = require('../models'); // ⭐️ index.model.js를 통해 User 모델 로드
const ForbiddenError = require('../errors/forbidden.error');
const UnauthorizedError = require('../errors/unauthorized.error');

// ⭐️ .env 파일에서 올바른 키를 읽어옵니다.
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

/**
 * 토큰을 검증하고 사용자 객체(JSON)를 반환하는 공용 함수
 * (REST API 및 Socket.io에서 공통 사용)
 * @param {string} token 
 * @returns {Promise<object>}
 */
const verifyToken = async (token) => {
    try {
        if (!token) {
            throw new UnauthorizedError('인증 토큰이 필요합니다.');
        }

        // ⭐️ 'JWT_SECRET' 대신 'JWT_SECRET_KEY'로 검증
        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        
        // ⭐️ DB에서 사용자 정보를 직접 조회 (user.model.js 수정으로 이제 정상 작동)
        const user = await User.findOne({
            where: { user_id: decoded.user_id },
            // ⭐️ 인증에 필요한 모든 컬럼을 명시적으로 조회
            attributes: ['user_id', 'username', 'email', 'nickname', 'role', 'status']
        });

        if (!user) {
            throw new UnauthorizedError('존재하지 않는 사용자입니다.');
        }
        
        // ⭐️ 계정 정지 여부 확인
        if (user.status === 'SUSPENDED') {
            throw new ForbiddenError('이용이 정지된 계정입니다.');
        }

        return user.toJSON(); // ⭐️ 사용자 객체 반환
        
    } catch (err) {
        console.error("Token verification failed:", err.message);
        if (err.name === 'TokenExpiredError') {
            throw new UnauthorizedError('토큰이 만료되었습니다.');
        }
        // 원본 에러가 ForbiddenError나 UnauthorizedError일 경우 그대로 전달
        if (err instanceof ForbiddenError || err instanceof UnauthorizedError) {
            throw err;
        }
        // 그 외 JWT 관련 에러 (예: 'invalid signature')
        throw new UnauthorizedError('유효하지 않은 토큰입니다.');
    }
};

/**
 * ⭐️ REST API용 Express 미들웨어
 */
const authenticateToken = async (req, res, next) => {
    // 'authorization' 헤더에서 'Bearer' 토큰 추출
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    try {
        // ⭐️ 위에서 만든 공용 verifyToken 함수를 재사용
        const user = await verifyToken(token);
        
        // ⭐️ req.user에 사용자 정보 주입
        req.user = user; 
        next();

    } catch (error) {
        // ⭐️ 에러를 다음 전역 에러 핸들러로 전달
        next(error); 
    }
};

/**
 * ⭐️ 관리자(ADMIN) 권한 확인 미들웨어
 */
const checkAdmin = (req, res, next) => {
    // ⭐️ authenticateToken이 먼저 실행되어 req.user를 주입해야 함
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        next(new ForbiddenError('이 작업을 수행할 관리자 권한이 없습니다.'));
    }
};

module.exports = {
    authenticateToken,
    checkAdmin,
    verifyToken, // ⭐️ Socket.io 서버(server.js)가 사용할 수 있도록 export
};