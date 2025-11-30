package kr.ac.inhatc.cs.travelapp.data.model;

import com.google.gson.annotations.SerializedName;

public class InviteRequest {
    @SerializedName("nickname") // 서버가 받는 필드명
    private String nickname;

    public InviteRequest(String nickname) {
        this.nickname = nickname;
    }
}
