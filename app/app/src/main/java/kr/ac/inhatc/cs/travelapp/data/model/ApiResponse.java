package kr.ac.inhatc.cs.travelapp.data.model;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class ApiResponse<T> {
    private boolean success;
    private String message;

    // 1. 기본 데이터
    private T data;

    // 2. 게시글 상세 조회용
    private T post;

    // 3. ⭐️ 댓글 리스트 추가
    @SerializedName("comments")
    private List<Comment> comments;

    // --- Getter ---

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public T getData() {
        if (data != null) return data;
        if (post != null) return post;
        return null;
    }

    public List<Comment> getComments() {
        return comments;
    }
}
