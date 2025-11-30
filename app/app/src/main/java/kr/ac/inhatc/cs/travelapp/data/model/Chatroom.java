package kr.ac.inhatc.cs.travelapp.data.model;

import com.google.gson.annotations.SerializedName;

public class Chatroom {
    // 서버에서 보내주는 이름: room_id
    @SerializedName("room_id")
    private int chatroomId;

    // 서버에서 보내주는 이름: room_name
    @SerializedName("room_name")
    private String title;

    // 만약 생성자에서 title을 받는다면 아래처럼 유지
    public Chatroom(String title) {
        this.title = title;
    }

    public int getChatroomId() {
        return chatroomId;
    }

    public String getTitle() {
        return title;
    }
}
