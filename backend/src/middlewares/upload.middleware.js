const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ValidationError = require('../errors/validation.error');

// 업로드 디렉토리가 없으면 생성
try {
    fs.readdirSync('uploads');
} catch (error) {
    console.error('uploads 폴더가 없어 생성합니다.');
    fs.mkdirSync('uploads');
}

// Multer Storage 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // 파일이 저장될 경로 설정
    },
    filename: (req, file, cb) => {
        // 파일명: [현재시간]-[파일명].[확장자]
        const ext = path.extname(file.originalname);
        cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    }
});

// 파일 필터링 설정
const fileFilter = (req, file, cb) => {
    // 이미지 파일 (jpg, jpeg, png)만 허용
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new ValidationError('이미지 파일(JPG, PNG)만 업로드할 수 있습니다.'), false);
    }
};

// Multer 인스턴스 생성
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB로 제한
});

// 단일 파일 업로드 미들웨어 (이름: 'image')
const uploadImage = (req, res, next) => {
    // Multer가 비동기적으로 파일을 처리하고 req.file에 저장합니다.
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Multer 자체 에러 (예: 파일 크기 초과)
            return next(new ValidationError(`업로드 실패: ${err.message}`));
        } else if (err) {
            // 커스텀 에러 (예: 파일 타입)
            return next(err); 
        }
        next();
    });
};

module.exports = uploadImage;