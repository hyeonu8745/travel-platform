const BaseError = require('./base.error');

/**
 * 리소스에 접근할 권한이 없을 때 (HTTP 403 Forbidden) 발생하는 에러 클래스입니다.
 */
class ForbiddenError extends BaseError {
    constructor(resource = '해당 작업') {
        const message = `${resource}을(를) 수행할 권한이 없습니다.`;
        super(403, message); // 403 코드를 고정
    }
}

module.exports = ForbiddenError;