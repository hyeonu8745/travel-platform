const BaseError = require('./base.error');

/**
 * 인증에 실패했거나 (로그인 필요) 토큰이 유효하지 않을 때 (HTTP 401 Unauthorized) 발생하는 에러 클래스입니다.
 */
class UnauthorizedError extends BaseError {
    constructor(message = '인증되지 않았거나 토큰이 유효하지 않습니다.') {
        super(401, message); // 401 코드를 고정
    }
}

module.exports = UnauthorizedError;