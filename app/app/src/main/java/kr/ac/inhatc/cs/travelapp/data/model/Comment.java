package kr.ac.inhatc.cs.travelapp.data.model;

import com.google.gson.annotations.SerializedName;

public class Comment {
    @SerializedName("comment_id")
    private int commentId;

    private String content;

    @SerializedName("created_at")
    private String createdAt;

    @SerializedName("user_id")
    private int userId;

    // ⭐️ 닉네임을 바로 String으로 받지 말고, User 객체로 받기
    @SerializedName("User")
    private UserInfo user;

    public int getCommentId() { return commentId; }
    public String getContent() { return content; }
    public String getCreatedAt() { return createdAt; }
    public int getUserId() { return userId; }

    // ⭐️ 닉네임 꺼내는 로직 수정
    public String getNickname() {
        if (user != null && user.nickname != null) {
            return user.nickname;
        }
        return "익명"; // User 정보가 없으면 익명
    }

    // 내부 클래스
    public static class UserInfo {
        @SerializedName("nickname")
        public String nickname;
    }
}
