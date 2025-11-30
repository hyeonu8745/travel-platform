package kr.ac.inhatc.cs.travelapp.data.model;

import com.google.gson.annotations.SerializedName;

public class LoginResponse {
    @SerializedName("token") // 서버 JSON 키 이름 (token)
    private String token;

    @SerializedName("user") // 서버 JSON 키 이름 (user)
    private User user;

    // ⭐️ 이 메소드가 없어서 에러 난 것임
    public String getToken() {
        return token;
    }

    public User getUser() {
        return user;
    }
}
