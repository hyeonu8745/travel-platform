const { Post, User, Comment, Board } = require('../models/index');
const { Op, Sequelize } = require('sequelize'); // ⭐️ [수정] Sequelize 추가
const NotFoundError = require('../errors/notFound.error');


class PostRepository {
    constructor() {
        this.Post = Post;
        this.User = User;
        this.Comment = Comment;
        this.Board = Board;
    }

    // 1. 모든 게시글 조회 (목록)
    async findAllPosts(boardIdFilter, searchQuery, excludeBoardId, limit, offset) {
        let whereClause = {};

        if (boardIdFilter) {
            whereClause.board_id = boardIdFilter;
        } else if (excludeBoardId) {
            whereClause.board_id = { [Op.ne]: excludeBoardId };
        }
        
        if (searchQuery) {
            const searchCondition = {
                [Op.or]: [
                    { title: { [Op.like]: `%${searchQuery}%` } },
                    { content: { [Op.like]: `%${searchQuery}%` } }
                ]
            };
            whereClause = { ...whereClause, ...searchCondition };
        }
        
        const result = await this.Post.findAndCountAll({
            where: whereClause,
            // ⭐️ [수정] attributes에 댓글 카운트 서브쿼리 추가
            attributes: [
                'post_id', 'title', 'view_count', 'created_at', 'board_id',
                // ⭐️ 테이블 이름 수정됨: comments -> comment
                [
                    Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM comment AS c
                        WHERE
                            c.post_id = Post.post_id
                    )`),
                    'comment_count'
                ]
            ], 
            include: [
                {
                    model: this.User,
                    as: 'Author',
                    attributes: ['nickname']
                },
                {
                    model: this.Board,
                    as: 'Board',
                    attributes: ['board_name']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: limit, 
            offset: offset
        });

        return { 
            posts: result.rows,
            totalCount: result.count
        };
    }

    // ... (나머지 메소드들은 그대로 유지) ...
    // findPostById, create, update, delete, createComment 등등...
    
    // (아래 코드는 기존과 동일하므로 생략하지 않고 전체 복사해서 쓰시려면 그대로 두세요)
    async findPostById(postId) {
        const post = await this.Post.findOne({
            where: { post_id: postId },
            include: [
                { model: this.User, as: 'Author', attributes: ['user_id', 'nickname'] },
                { 
                    model: this.Comment, 
                    as: 'Comments', 
                    include: [{ model: this.User, as: 'CommentAuthor', attributes: ['user_id', 'nickname'] }],
                    order: [['created_at', 'ASC']]
                },
                { model: this.Board, as: 'Board', attributes: ['board_name', 'board_id'] }
            ]
        });

        if (!post) { throw new NotFoundError('게시물'); }

        await post.increment('view_count', { by: 1 });
        await post.reload(); 
        
        return post;
    }

    async create(title, content, user_id, board_id, image_url) {
        const newPost = await this.Post.create({
            title, content, user_id, board_id, image_url 
        });
        return newPost.post_id;
    }

    async update(postId, title, content, loggedInUserId, image_url, board_id, userRole) {
        const post = await this.Post.findByPk(postId, { attributes: ['user_id'] });
        if (!post) { throw new NotFoundError('수정할 게시물'); }

        const isOwner = post.user_id === loggedInUserId;
        const isAdmin = userRole === 'ADMIN';
        const isOwnerOrAdmin = isOwner || isAdmin;
        
        if (isOwnerOrAdmin) {
            const updateFields = { title, content, board_id }; 
            if (image_url !== undefined) {
                updateFields.image_url = image_url;
            }
            await this.Post.update(updateFields, { where: { post_id: postId } });
        }
        return { isOwnerOrAdmin };
    }

    async delete(postId, loggedInUserId, userRole) {
        const post = await this.Post.findByPk(postId, { attributes: ['user_id'] });
        if (!post) { throw new NotFoundError('삭제할 게시물'); }

        const isOwner = post.user_id === loggedInUserId;
        const isAdmin = userRole === 'ADMIN';
        const isOwnerOrAdmin = isOwner || isAdmin;

        if (isOwnerOrAdmin) {
            await this.Post.destroy({ where: { post_id: postId } });
        }
        return { isOwnerOrAdmin };
    }

    async createComment(postId, userId, content) {
        const newComment = await this.Comment.create({
            post_id: postId, user_id: userId, content: content
        });
        return newComment.comment_id;
    }

    async findCommentById(commentId) {
        return this.Comment.findOne({
            where: { comment_id: commentId },
            attributes: ['comment_id', 'post_id', 'user_id', 'content', 'created_at'],
            include: [{ model: this.User, as: 'CommentAuthor', attributes: ['user_id', 'nickname'] }]
        });
    }
    
    async updateComment(commentId, content, userId) {
        const comment = await this.Comment.findByPk(commentId, { attributes: ['user_id'] });
        if (!comment) { throw new NotFoundError('수정할 댓글'); }
        const isOwner = comment.user_id === userId;
        if (isOwner) {
            await this.Comment.update({ content: content }, { where: { comment_id: commentId } });
        }
        return { isOwner };
    }

    async deleteComment(commentId, userId) {
        const comment = await this.Comment.findByPk(commentId, { attributes: ['user_id'] });
        if (!comment) { throw new NotFoundError('삭제할 댓글'); }
        const isOwner = comment.user_id === userId;
        if (isOwner) {
            await this.Comment.destroy({ where: { comment_id: commentId } });
        }
        return { isOwner };
    }

    async findRecentComments(limit) {
        return this.Comment.findAll({
            attributes: ['comment_id', 'post_id', 'content', 'created_at'],
            include: [
                { 
                    model: this.User, 
                    as: 'CommentAuthor', 
                    attributes: ['user_id', 'nickname'] 
                },
                { 
                    model: this.Post, 
                    as: 'Post', 
                    attributes: ['title'], 
                    required: true 
                }
            ],
            order: [['created_at', 'DESC']],
            limit: limit
        });
    }
}

module.exports = new PostRepository();
