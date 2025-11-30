const authRepository = require('../repositories/auth.repository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ValidationError = require('../errors/validation.error');
const UnauthorizedError = require('../errors/unauthorized.error');
const ForbiddenError = require('../errors/forbidden.error');
const NotFoundError = require('../errors/notFound.error'); // NotFoundError 임포트 추가

class AuthService {

   // 1. 회원가입 (중복 체크 메시지 강화)
    async register(username, password, nickname, email) {
        
        // 1. 이메일 중복 검사
        const existingUser = await authRepository.findUserByEmail(email);
        if (existingUser) {
            // 🚨 프론트엔드에서 '이메일 중복'임을 알 수 있도록 명확한 메시지 전달
            throw new ValidationError('이미 사용 중인 이메일입니다.'); 
        }

        // 2. 아이디(username) 중복 검사
        const existingUsername = await authRepository.findUserByUsername(username);
        if (existingUsername) {
            // 🚨 아이디 중복 메시지
            throw new ValidationError('이미 사용 중인 아이디입니다.');
        }
        
        // 3. 닉네임(nickname) 중복 검사
        const existingNickname = await authRepository.findUserByNickname(nickname);
        if (existingNickname) {
            // 🚨 닉네임 중복 메시지
            throw new ValidationError('이미 사용 중인 닉네임입니다.');
        }

        // 4. 비밀번호 해싱 및 저장
        const hashedPassword = await bcrypt.hash(password, 10);
        return await authRepository.create(username, hashedPassword, nickname, email);
    }

    // 2. ⭐️ 로그인 (수정됨: 토큰과 user 정보 함께 반환)
    async login(email, password) {
        const user = await authRepository.findUserByEmail(email); 
        if (!user) {
            throw new UnauthorizedError('이메일 또는 비밀번호가 일치하지 않습니다.');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('이메일 또는 비밀번호가 일치하지 않습니다.');
        }

        if (user.status === 'SUSPENDED') {
            throw new ForbiddenError('이용이 정지된 계정입니다. 관리자에게 문의하세요.');
        }

        const token = jwt.sign(
            { 
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                nickname: user.nickname,
                role: user.role,
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        );

        // ⭐️ [핵심 수정 사항] 토큰과 사용자 정보를 함께 반환
        return {
            token: token,
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                nickname: user.nickname,
                role: user.role,
                status: user.status
            }
        };
    }

    // 3. 사용자 수정
    async updateUser(targetUserId, loggedInUserId, nickname, currentPassword, newPassword) {
        if (targetUserId !== loggedInUserId) {
            throw new ForbiddenError('자신의 정보만 수정할 수 있습니다.');
        }
        
        const user = await authRepository.findUserById(loggedInUserId);
        if (!user) throw new UnauthorizedError("사용자 정보를 찾을 수 없습니다.");

        const userWithPass = await authRepository.findUserByEmail(user.email);
        
        const isPasswordValid = await bcrypt.compare(currentPassword, userWithPass.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('현재 비밀번호가 일치하지 않습니다.');
        }

        const updateData = {};
        if (nickname) { updateData.nickname = nickname; } 
        
        if (newPassword) {
            if (newPassword.length < 6) throw new ValidationError("새 비밀번호는 6자 이상이어야 합니다.");
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        await authRepository.updateUser(loggedInUserId, updateData.nickname, updateData.password);
    }

    // 4. 회원 탈퇴
    async deleteUser(targetUserId, loggedInUserId, currentPassword) {
        if (targetUserId !== loggedInUserId) {
            throw new ForbiddenError('자신의 계정만 탈퇴할 수 있습니다.');
        }
        
        const user = await authRepository.findUserById(loggedInUserId);
        if (!user) throw new UnauthorizedError("사용자 정보를 찾을 수 없습니다.");

        const userWithPass = await authRepository.findUserByEmail(user.email);
        
        const isPasswordValid = await bcrypt.compare(currentPassword, userWithPass.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('현재 비밀번호가 일치하지 않습니다.');
        }

        await authRepository.deleteUser(loggedInUserId);
    }

    // 5. 프로필 조회
    async getProfile(userId) {
        const profile = await authRepository.findUserById(userId);
        if (!profile) {
            throw new NotFoundError('프로필을 찾을 수 없습니다.');
        }
        return profile;
    }

    // 6. 총 사용자 수
    async getTotalUserCount() {
        return await authRepository.countAllUsers();
    }

    // 7. 모든 사용자 목록 (자신 제외 - 채팅 위젯용)
    async getAllUsers(currentUserId) {
        return await authRepository.findAllUsers(currentUserId);
    }

    // 8. 관리자 패널용 모든 사용자 목록
    async getAllUsersForAdmin(currentUserId) {
        return await authRepository.findAllUsersForAdmin(currentUserId);
    }
}

module.exports = new AuthService();
