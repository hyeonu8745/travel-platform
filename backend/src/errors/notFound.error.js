const BaseError = require('./base.error');
const { StatusCodes } = require('http-status-codes'); // 필요하다면 npm install http-status-codes

/**
 * 리소스를 찾을 수 없을 때 (HTTP 404 Not Found) 발생하는 에러 클래스입니다.
 */
class NotFoundError extends BaseError {
    constructor(resource = '요청한 리소스') {
        const message = `${resource}를 찾을 수 없습니다.`;
        super(404, message); // 404 코드를 고정
    }
}

module.exports = NotFoundError;

// 💡 참고: StatusCodes 라이브러리를 사용하지 않는다면 404를 직접 입력합니다.
// 여기서는 가독성을 위해 StatusCodes를 가정했지만, 지금은 BaseError에서 404로 직접 설정했습니다.