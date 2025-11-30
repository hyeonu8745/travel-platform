const authService = require('../services/auth.service');
const authRepository = require('../repositories/auth.repository'); 
const ValidationError = require('../errors/validation.error');
const UnauthorizedError = require('../errors/unauthorized.error');

class AuthController {
    // 1. 사용자 등록 (회원가입)
    async register(req, res) {
        const { username, password, nickname, email } = req.body;
        if (!username || !password || !nickname || !email) {
            throw new ValidationError('모든 회원 정보를 입력해야 합니다.');
        }
        const userId = await authService.register(username, password, nickname, email);
        
        res.status(201).json({ 
            success: true,
            message: '사용자 등록 성공',
            userId: userId
        });
    }

     // 2. 로그인 (토큰 발급 + 사용자 정보 반환)
    async login(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
             throw new ValidationError('아이디와 비밀번호는 필수 입력 항목입니다.');
        }
        
        // ⭐️ 변경된 서비스 호출 방식 (구조 분해 할당)
        const { token, user } = await authService.login(email, password);

        res.status(200).json({ 
            success: true,
            message: '로그인 성공',
            token: token,
            user: user // ⭐️ 사용자 정보도 클라이언트에 전달!
        });
    }

    // 3. 사용자 수정
    async updateUser(req, res) {
        const targetUserId = parseInt(req.params.id);
        const loggedInUserId = req.user.user_id; 
        const { nickname, currentPassword, newPassword } = req.body;
        
        if (!nickname || !currentPassword) {
            throw new ValidationError('닉네임과 현재 비밀번호는 필수 입력 항목입니다.');
        }

        await authService.updateUser(targetUserId, loggedInUserId, nickname, currentPassword, newPassword);
        
        res.status(200).json({
            success: true,
            message: '사용자 정보가 성공적으로 수정되었습니다.'
        });
    }
    
    // 4. 회원 탈퇴
    async deleteUser(req, res) {
        const targetUserId = parseInt(req.params.id);
        const loggedInUserId = req.user.user_id; 
        const { currentPassword } = req.body;

        if (!currentPassword) {
            throw new ValidationError('탈퇴를 위해 현재 비밀번호를 입력해야 합니다.');
        }

        await authService.deleteUser(targetUserId, loggedInUserId, currentPassword);
        
        res.status(200).json({
            success: true,
            message: '회원 탈퇴가 성공적으로 처리되었습니다.'
        });
    }

    // 5. 프로필 조회 (인증 테스트용)
    async getProfile(req, res) {
        const userId = req.user.user_id; 
        const profile = await authService.getProfile(userId);

        res.status(200).json({
            success: true,
            data: profile
        });
    }
    
     // 6. ⭐️ 총 사용자 수 조회 (위젯용) ⭐️
    async getTotalUserCount(req, res) {
        const count = await authService.getTotalUserCount();

        res.status(200).json({
            success: true,
            data: { count: count } // 프론트엔드에서 { data: { count: N } } 형태로 받음
        });
    }

    // ⭐️ 7. 새 기능: 자신을 제외한 모든 사용자 목록 조회 ⭐️
    async getAllUsers(req, res) {
        const currentUserId = req.user.user_id; // 인증된 사용자 ID
        
        // Service를 호출하여 자신을 제외한 사용자 목록을 가져옴
        const users = await authService.getAllUsers(currentUserId);

        // 프론트엔드에 user_id와 nickname 목록을 반환
        res.status(200).json({
            success: true,
            data: users 
        });
    }

    // ⭐️ 8. [신규 추가] 유저 검색 및 목록 조회 API
    async searchUsers(req, res) {
        const { query } = req.query; // GET /api/auth/search?query=...
        
        try {
            let users;
            
            if (!query || query.trim() === '') {
                // 1. 검색어가 없으면 -> 전체 목록 조회 (authRepository.getAllUsers)
                users = await authRepository.getAllUsers();
            } else {
                // 2. 검색어가 있으면 -> 검색 결과 조회 (authRepository.searchUsers)
                users = await authRepository.searchUsers(query);
            }

            res.status(200).json({ success: true, data: users });
        } catch (error) {
            console.error("유저 검색 오류:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new AuthController();