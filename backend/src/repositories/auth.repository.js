const { User } = require('../models/index'); 
const { Op } = require('sequelize');
const NotFoundError = require('../errors/notFound.error');

class AuthRepository {
    constructor() {
        this.User = User;
    }

    // 1. 이메일로 사용자 찾기
    async findUserByEmail(email) {
        const user = await this.User.findOne({ 
            where: { email },
            attributes: [
                'user_id', 'password', 'status', 'role', 
                'username', 'email', 'nickname'
            ]
        });
        return user;
    }

    // 2. ID로 사용자 찾기
    async findUserById(userId) {
        const user = await this.User.findByPk(userId, {
            attributes: [
                'user_id', 'username', 'email', 'nickname', 
                'role', 'status', 'created_at'
            ]
        });
        
        if (!user) {
            throw new NotFoundError('사용자'); 
        }
        return user; 
    }

    // 3. 사용자 이름(username)으로 찾기
    async findUserByUsername(username) {
        const user = await this.User.findOne({ where: { username } });
        return user;
    }

    // ⭐️ [신규] 3.5. 닉네임으로 사용자 찾기
    async findUserByNickname(nickname) {
        const user = await this.User.findOne({ where: { nickname } });
        return user;
    }

    // 4. 사용자 생성 (회원가입)
    async create(username, hashedPassword, nickname, email) {
        const newUser = await this.User.create({
            username: username,
            password: hashedPassword,
            nickname: nickname,
            email: email,
        });
        return newUser.user_id; 
    }

    // 5. 사용자 정보 수정
    async updateUser(userId, nickname, hashedPassword) {
        const updateData = {};
        if (nickname) { updateData.nickname = nickname; }
        if (hashedPassword) { updateData.password = hashedPassword; }

        await this.User.update(updateData, {
            where: { user_id: userId }
        });
        return true;
    }
    
    // 6. 관리자용 유연한 업데이트 (계정 정지용)
    async adminUpdateUser(userId, updateData) {
        await this.User.update(updateData, {
            where: { user_id: userId }
        });
        return true;
    }

    // 7. 회원 탈퇴 (소프트 삭제)
    async deleteUser(userId) {
        await this.User.update(
            { 
                status: 'SUSPENDED', 
                email: `deleted_${Date.now()}@user.com`
            }, 
            { where: { user_id: userId } }
        );
        return true;
    }
    
    // 8. 총 사용자 수 계산
    async countAllUsers() {
        const count = await this.User.count({
            where: { status: 'ACTIVE' }
        });
        return count;
    }

    // 9. 모든 사용자 목록 조회 (채팅 위젯용 - ACTIVE)
    async findAllUsers(currentUserId) {
        const users = await this.User.findAll({
            where: {
                user_id: { [Op.ne]: currentUserId },
                status: 'ACTIVE'
            },
            attributes: ['user_id', 'nickname', 'status'], 
            order: [['nickname', 'ASC']]
        });
        return users;
    }

    // 10. 관리자 패널용 모든 사용자 목록 조회
    async findAllUsersForAdmin(currentUserId) {
        const users = await this.User.findAll({
            where: {
                user_id: { [Op.ne]: currentUserId },
            },
            attributes: ['user_id', 'nickname', 'email', 'status', 'role'],
            order: [['nickname', 'ASC']]
        });
        return users;
    }

     // ⭐️ [신규 추가] 11. 닉네임 검색 (초대 기능용, 부분 일치)
    async searchUsers(query) {
        return await this.User.findAll({
            where: {
                nickname: {
                    [Op.like]: `%${query}%` // 앞뒤로 검색어가 포함된 모든 유저
                },
                status: 'ACTIVE' // (선택) 활동 중인 유저만 검색
            },
            attributes: ['user_id', 'nickname', 'email'],
            limit: 20 // 결과 개수 제한
        });
    }

    // ⭐️ [신규 추가] 12. 전체 유저 목록 조회 (초대 모달 초기 화면용)
    async getAllUsers() {
        return await this.User.findAll({
            where: {
                status: 'ACTIVE' // 활동 중인 유저만
            },
            attributes: ['user_id', 'nickname', 'email'],
            order: [['nickname', 'ASC']], // 가나다순
            limit: 50 // 너무 많이 불러오지 않도록 제한
        });
    }

    
}

module.exports = new AuthRepository();