const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized.error');
const ForbiddenError = require('../errors/forbidden.error'); 

// .env에서 값 가져오기
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * 토큰을 검증하고 페이로드를 반환하는 순수 함수 (REST API 및 Socket.io 공용)
 * @param {string} token - JWT 토큰
 * @returns {Promise<object>} - 검증된 사용자 페이로드
 */
const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        if (!token) {
            return reject(new UnauthorizedError('인증 토큰이 제공되지 않았습니다.'));
        }
        
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return reject(new UnauthorizedError('토큰이 유효하지 않거나 만료되었습니다.'));
            }
            
            // ⭐️ 핵심 수정: user_id를 Number로 강제 변환하여 타입 불일치 오류를 해결 ⭐️
            const verifiedUser = {
                // 토큰 페이로드에서 user_id나 userId 필드를 가져와 Number로 변환
                user_id: Number(user.user_id || user.userId), 
                username: user.username,
                nickname: user.nickname,
                // 필요한 다른 필드를 추가합니다.
            };
            
            // JWT 토큰 만료 시간이 Number 타입으로 DB ID와 일치하게 되므로 403 오류가 사라집니다.
            resolve(verifiedUser); 
        });
    });
};


/**
 * REST API용 미들웨어: 헤더에서 토큰을 추출하여 검증하고 req.user에 추가
 */
const authenticateToken = async (req, res, next) => {
    // 🚨 authHeader가 없는 경우를 대비하여 req.headers['authorization'] 대신 req.headers.authorization 사용
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    try {
        const user = await verifyToken(token);
        
        // req.user에 숫자 타입의 user_id가 할당됩니다.
        req.user = user; 
        next();
    } catch (error) {
        // verifyToken에서 발생한 UnauthorizedError를 다음 에러 핸들러로 전달
        next(error);
    }
};

module.exports = {
    authenticateToken,
    verifyToken 
};