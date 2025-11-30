/**
 * 모든 커스텀 에러의 기본 클래스입니다.
 * 이 클래스를 상속받아 HTTP 상태 코드(statusCode)를 정의합니다.
 */
class BaseError extends Error {
    /**
     * @param {number} statusCode - HTTP 응답 상태 코드 (예: 400, 404, 500)
     * @param {string} message - 사용자에게 보여줄 에러 메시지
     */
    constructor(statusCode, message) {
        super(message); // JavaScript의 기본 Error 클래스에 메시지 전달
        
        // 현재 클래스 이름으로 설정 (디버깅 용이)
        this.name = this.constructor.name;
        
        // HTTP 응답에 사용할 상태 코드
        this.statusCode = statusCode;
        
        // 에러가 '운영상의' 에러인지 (예: 사용자 입력 오류, 400번대) 여부를 나타냅니다.
        // 이 속성은 나중에 전역 핸들러에서 시스템 에러와 구분하는 데 사용됩니다.
        this.isOperational = true; 

        // Error 객체 생성 시점의 스택 트레이스를 캡처하여 디버깅 정보 제공
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = BaseError;