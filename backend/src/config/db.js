const { Sequelize } = require('sequelize');
// .env 파일 또는 환경 변수에서 DB 정보를 가져온다고 가정합니다.

// Sequelize 인스턴스 생성
const sequelize = new Sequelize(
    process.env.DB_DATABASE, // 데이터베이스 이름
    process.env.DB_USERNAME, // 사용자 이름
    process.env.DB_PASSWORD, // 비밀번호
    {
        host: process.env.DB_HOST,
        dialect: 'mysql', // MySQL 사용 가정
        logging: false, // SQL 쿼리 로깅 비활성화 (개발 시 true 권장)
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// DB 연결 및 인증 테스트
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ 데이터베이스 연결 성공.');
    } catch (error) {
        console.error('❌ 데이터베이스 연결 실패:', error.message);
        // 에러 발생 시 프로세스 종료
        process.exit(1); 
    }
};

const db = {};
db.sequelize = sequelize;
db.connectDB = connectDB;

module.exports = db;