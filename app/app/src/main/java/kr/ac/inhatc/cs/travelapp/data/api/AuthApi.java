package kr.ac.inhatc.cs.travelapp.data.api;

import java.util.List;

import kr.ac.inhatc.cs.travelapp.data.model.ApiResponse;
import kr.ac.inhatc.cs.travelapp.data.model.LoginRequest;
import kr.ac.inhatc.cs.travelapp.data.model.LoginResponse;
import kr.ac.inhatc.cs.travelapp.data.model.RegisterRequest;
import kr.ac.inhatc.cs.travelapp.data.model.User;
import kr.ac.inhatc.cs.travelapp.data.model.UserDeleteRequest;
import kr.ac.inhatc.cs.travelapp.data.model.UserUpdateRequest;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.HTTP;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface AuthApi {
    @POST("auth/login")
    Call<LoginResponse> login(@Body LoginRequest body);

    @GET("auth/profile")
    Call<ApiResponse<User>> getProfile(); // 토큰은 인터셉터가 자동 추가

    @GET("auth/search")
    Call<ApiResponse<List<User>>> searchUsers(@Query("nickname") String nickname);

    // 사용자 정보 수정
    @PUT("auth/users/{id}")
    Call<ApiResponse<Void>> updateUser(@Path("id") int userId, @Body UserUpdateRequest request);

    // 회원 탈퇴 (바디에 비밀번호 필요)
    @HTTP(method = "DELETE", path = "auth/users/{id}", hasBody = true)
    Call<ApiResponse<Void>> deleteUser(@Path("id") int userId, @Body UserDeleteRequest request);

    // 회원가입 API
    @POST("auth/register")
    Call<ApiResponse<Void>> register(@Body RegisterRequest request);

    // 이메일 중복 확인
    @GET("auth/check/email")
    Call<ApiResponse<Void>> checkEmail(@Query("email") String email);

    // 아이디(username) 중복 확인
    @GET("auth/check/username")
    Call<ApiResponse<Void>> checkUsername(@Query("username") String username);

    // 닉네임 중복 확인
    @GET("auth/check/nickname")
    Call<ApiResponse<Void>> checkNickname(@Query("nickname") String nickname);

}
