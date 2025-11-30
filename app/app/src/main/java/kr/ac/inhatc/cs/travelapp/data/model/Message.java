package kr.ac.inhatc.cs.travelapp.data.model;

import com.google.gson.annotations.SerializedName;

public class Message {
    @SerializedName("message_id")
    private int messageId;

    @SerializedName("content")
    private String content;

    @SerializedName("user_id")
    private int userId;

    @SerializedName("created_at")
    private String createdAt;

    @SerializedName("Sender")
    private User sender;

    // Getter & Setter
    public int getMessageId() { return messageId; }
    public void setMessageId(int messageId) { this.messageId = messageId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getCreatedAt() { return createdAt; }

    // ⭐️ [추가됨] Activity에서 이 이름으로 호출 중
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    // ⭐️ [추가됨] 닉네임 설정 편의 메서드
    public void setNickname(String nickname) {
        if (this.sender == null) {
            this.sender = new User();
        }
        this.sender.setNickname(nickname);
    }

    public String getNickname() {
        return sender != null ? sender.getNickname() : "Unknown";
    }
}
