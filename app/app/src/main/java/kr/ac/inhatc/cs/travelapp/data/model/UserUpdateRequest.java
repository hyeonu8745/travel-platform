package kr.ac.inhatc.cs.travelapp.data.model;

import com.google.gson.annotations.SerializedName;

public class UserUpdateRequest {
    @SerializedName("nickname")
    private String nickname;

    @SerializedName("currentPassword")
    private String currentPassword;

    @SerializedName("newPassword")
    private String newPassword;

    public UserUpdateRequest(String nickname, String currentPassword, String newPassword) {
        this.nickname = nickname;
        this.currentPassword = currentPassword;
        this.newPassword = newPassword;
    }
}
