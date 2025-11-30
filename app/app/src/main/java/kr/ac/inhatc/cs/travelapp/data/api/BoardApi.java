package kr.ac.inhatc.cs.travelapp.data.api;

import java.util.List;
import java.util.Map;

import kr.ac.inhatc.cs.travelapp.data.model.ApiResponse;
import kr.ac.inhatc.cs.travelapp.data.model.Post;
import kr.ac.inhatc.cs.travelapp.data.model.PostRequest;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface BoardApi {
    // 전체 게시글 목록 조회
    // 서버 경로가 /api/posts 인지 확인 필요 (React 코드 참고: /api/posts)
    @GET("posts")
    Call<ApiResponse<List<Post>>> getPosts(@Query("board_id") Integer boardId);

    @POST("posts") // 경로 확인 필요
    Call<ApiResponse<Object>> createPost(@Body PostRequest request);

    // 기존 getPosts, createPost 아래에 추가
    @GET("posts/{id}") // 서버 경로 확인 (보통 posts/1, posts/2 ...)
    Call<ApiResponse<Post>> getPostDetail(@Path("id") int postId);

    // 댓글 작성
    @POST("posts/{postId}/comments")
    Call<ApiResponse<Object>> createComment(
            @Path("postId") int postId,
            @Body java.util.Map<String, String> body // {"content": "..."}
    );

    @DELETE("posts/{id}")
    Call<ApiResponse<Object>> deletePost(@Path("id") int postId);

    // ⭐️ 게시글 수정
    @PUT("posts/{id}")
    Call<ApiResponse<Object>> updatePost(@Path("id") int postId, @Body Map<String, String> body);

    // ⭐️ 수정 (정답)
    @DELETE("posts/{postId}/comments/{commentId}")
    Call<ApiResponse<Object>> deleteComment(
            @Path("postId") int postId,
            @Path("commentId") int commentId
    );

    @GET("posts")
    Call<ApiResponse<List<Post>>> getPosts(
            @Query("board_id") Integer boardId,
            @Query("page") int page,
            @Query("limit") int limit,
            @Query("search_query") String searchQuery // ⭐️ 이게 꼭 있어야 함!
    );

    // BoardApi.java
    @GET("posts") // 서버가 sort=popular 지원하면 추가
    Call<ApiResponse<List<Post>>> getPopularPosts(@Query("limit") int limit);


}
