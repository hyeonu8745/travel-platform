package kr.ac.inhatc.cs.travelapp.data.api;

import java.util.List; // List import 추가

import kr.ac.inhatc.cs.travelapp.data.model.ApiResponse;
import kr.ac.inhatc.cs.travelapp.data.model.Trip;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;
import retrofit2.http.Path;
import retrofit2.http.Query; // Query import 추가

public interface TripApi {

    @Multipart
    @POST("trips")
    Call<ApiResponse<Trip>> createTrip(
            @Part MultipartBody.Part image,
            @Part("title") RequestBody title,
            @Part("startDate") RequestBody startDate,
            @Part("endDate") RequestBody endDate,
            @Part("stops") RequestBody stops
    );

    // 기존 전체 목록 조회 (파라미터 없음)
    @GET("trips")
    Call<ApiResponse<List<Trip>>> getAllTrips();

    // ⭐️ [추가] 검색어를 포함한 목록 조회
    // TripFragment에서 api.getTrips(query)로 호출하는 메서드입니다.
    @GET("trips")
    Call<ApiResponse<List<Trip>>> getTrips(@Query("search_query") String searchQuery);

    @GET("trips/{tripId}")
    Call<ApiResponse<Trip>> getTripDetail(@Path("tripId") int tripId);
}
