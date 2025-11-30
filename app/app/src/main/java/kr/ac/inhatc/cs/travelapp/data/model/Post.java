package kr.ac.inhatc.cs.travelapp.data.model;

import com.google.gson.annotations.SerializedName;

public class Post {

    @SerializedName("post_id")
    private int postId;

    @SerializedName("board_id")
    private int boardId;

    @SerializedName("user_id")
    private int userId;

    private String title;
    private String content;

    // ⭐️ 서버가 "User": { "nickname": "..." } 형태로 보내주므로,
    //    이 구조를 그대로 받아줄 객체가 필요합니다.
    @SerializedName("Author")
    private UserData author;

    @SerializedName("view_count")
    private int viewCount;

    @SerializedName("created_at")
    private String createdAt;

    @SerializedName("image_url")
    private String imageUrl;

    @SerializedName("comment_count")
    private int commentCount;


    // --- Getters ---

    public int getPostId() { return postId; }
    public int getBoardId() { return boardId; }
    public String getTitle() { return title; }
    public String getContent() { return content; }

    // ⭐️ 닉네임을 User 객체 안에서 꺼내도록 수정!
    public String getNickname() {
        if (author != null && author.nickname != null) {
            return author.nickname;
        }
        return "익명"; // User 객체가 없거나 닉네임이 null이면 "익명" 반환
    }

    public int getViewCount() { return viewCount; }
    public String getCreatedAt() { return createdAt; }
    public String getImageUrl() { return imageUrl; }
    public int getCommentCount() { return commentCount; }


    // ⭐️ JSON의 "User" 객체를 담을 내부 클래스
    public static class UserData {
        @SerializedName("nickname")
        private String nickname;

        // public String getNickname() { return nickname; } // 필요 시 추가
    }

    public int getUserId() {
        return userId;
    }

}
