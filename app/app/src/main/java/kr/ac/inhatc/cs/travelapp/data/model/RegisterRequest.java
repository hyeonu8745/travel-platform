package kr.ac.inhatc.cs.travelapp.data.model;

import com.google.gson.annotations.SerializedName;

public class RegisterRequest {
    @SerializedName("email")
    private String email;

    @SerializedName("username")
    private String username; // 아이디

    @SerializedName("password")
    private String password;

    @SerializedName("nickname")
    private String nickname;

    public RegisterRequest(String email, String username, String password, String nickname) {
        this.email = email;
        this.username = username;
        this.password = password;
        this.nickname = nickname;
    }
}
