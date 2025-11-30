package kr.ac.inhatc.cs.travelapp.data.api;

import java.util.List;

import kr.ac.inhatc.cs.travelapp.data.model.ApiResponse;
import kr.ac.inhatc.cs.travelapp.data.model.User;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Query;

public interface UserApi {
    // 사용자 검색 API
    // 예: GET /users/search?keyword=홍길동
    @GET("users/search")
    Call<ApiResponse<List<User>>> searchUsers(@Query("keyword") String keyword);

    // 만약 전체 목록에서 검색하는 방식이 아니라면 아래처럼 전체 목록을 가져올 수도 있음
    // @GET("users")
    // Call<ApiResponse<List<User>>> getAllUsers();
}
