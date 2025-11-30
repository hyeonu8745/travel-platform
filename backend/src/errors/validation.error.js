const BaseError = require('./base.error');

/**
 * 사용자 입력 또는 데이터 유효성 검사 실패 시 (HTTP 400 Bad Request) 발생하는 에러 클래스입니다.
 */
class ValidationError extends BaseError {
    constructor(message = '요청 데이터 형식이 올바르지 않습니다.') {
        super(400, message); // 400 코드를 고정
    }
}

module.exports = ValidationError;