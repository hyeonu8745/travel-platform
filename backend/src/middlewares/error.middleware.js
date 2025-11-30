const BaseError = require('../errors/base.error'); // 우리가 만든 BaseError 임포트

/**
 * 전역 에러 핸들러 미들웨어입니다.
 * Express는 이 4개의 인자를 가진 함수를 에러 처리기로 인식합니다.
 */
const errorMiddleware = (err, req, res, next) => {
    // 1. 에러 로깅 (디버깅 및 운영 모니터링을 위해 필수)
    // console.error(err); // 실제 운영 환경에서는 winston, pino 등의 로거를 사용합니다.
    console.error(`[ERROR] ${err.name}: ${err.message}`);
    
    // 2. 응답할 기본 값 설정
    let statusCode = 500;
    let message = 'Internal Server Error. 서버 내부에서 예기치 않은 오류가 발생했습니다.';

    // 3. 커스텀 에러(BaseError)인지 확인하고 응답 결정
    // 'instanceof'를 통해 우리가 정의한 커스텀 에러인지 확인
    if (err instanceof BaseError) {
        // 커스텀 에러일 경우, 정의된 상태 코드와 메시지를 사용
        statusCode = err.statusCode;
        message = err.message;
        
        // 운영상 에러가 아니라면 (예: 시스템 에러), 스택 트레이스를 숨기고 일반 메시지 사용
        if (!err.isOperational) {
            message = '알 수 없는 서버 오류가 발생했습니다.';
        }
    } 
    
    // 4. 클라이언트에 최종 응답 전송
    res.status(statusCode).json({
        success: false,
        message: message,
        // 개발 환경이라면 스택 트레이스도 포함하여 디버깅에 도움을 줄 수 있습니다.
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
};

module.exports = errorMiddleware;