/**
 * Express 비동기 함수(async/await)에서 발생하는 에러를 
 * 자동으로 next() 함수로 전달하여 전역 에러 핸들러가 처리할 수 있도록 래핑하는 함수입니다.
 * * @param {Function} fn - 비동기 컨트롤러 함수
 */
const asyncHandler = fn => (req, res, next) => {
    // Promise를 반환하는 함수를 실행하고, 에러가 발생하면 catch 블록에서 next(err)를 호출합니다.
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;