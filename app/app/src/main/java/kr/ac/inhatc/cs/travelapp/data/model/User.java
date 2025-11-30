package kr.ac.inhatc.cs.travelapp.data.model;

import com.google.gson.annotations.SerializedName;

public class User {
    @SerializedName("user_id")
    private int userId;

    @SerializedName("username")
    private String username;

    @SerializedName("nickname")
    private String nickname;

    @SerializedName("email")
    private String email;

    @SerializedName("role")
    private String role;

    // Getter 메소드들
    public int getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getNickname() { return nickname; }
    public String getEmail() { return email; }
    public String getRole() { return role; }

    // ⭐️ [필수 추가] Setter 메서드
    public void setUserId(int userId) { this.userId = userId; }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public void setEmail(String email) { this.email = email; }
}
