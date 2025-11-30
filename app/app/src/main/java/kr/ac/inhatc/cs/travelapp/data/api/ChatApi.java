package kr.ac.inhatc.cs.travelapp.data.api;

import java.util.List;
import kr.ac.inhatc.cs.travelapp.data.model.ApiResponse;
import kr.ac.inhatc.cs.travelapp.data.model.Chatroom;
import kr.ac.inhatc.cs.travelapp.data.model.InviteRequest;
import kr.ac.inhatc.cs.travelapp.data.model.Message;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface ChatApi {

    // 내 채팅방 목록 조회
    @GET("chatrooms")
    Call<ApiResponse<List<Chatroom>>> getMyChatrooms();

    // 채팅방 생성
    @POST("chatrooms")
    Call<ApiResponse<Chatroom>> createChatroom(@Body Chatroom chatroom);

    // 특정 채팅방의 메시지 목록 조회
    @GET("chatrooms/{id}/messages")
    Call<ApiResponse<List<Message>>> getMessages(@Path("id") int chatroomId);

    // 메시지 전송
    @POST("chatrooms/{id}/messages")
    Call<ApiResponse<Message>> sendMessage(@Path("id") int chatroomId, @Body Message message);

    // ⭐️ 사용자 초대 API (중복 제거된 올바른 버전)
    @POST("chatrooms/{id}/invite")
    Call<ApiResponse<Void>> inviteUser(@Path("id") int chatroomId, @Body InviteRequest request);

}
