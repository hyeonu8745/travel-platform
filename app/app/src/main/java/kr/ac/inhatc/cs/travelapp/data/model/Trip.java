package kr.ac.inhatc.cs.travelapp.data.model;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class Trip {
    @SerializedName("trip_id")
    private int tripId;

    @SerializedName("title")
    private String title;

    @SerializedName("start_date")
    private String startDate;

    @SerializedName("end_date")
    private String endDate;

    @SerializedName("view_count")
    private int viewCount;

    // ⭐️ [추가] 이미지 URL 필드
    @SerializedName("image_url")
    private String imageUrl;

    @SerializedName("Author")
    private Author author;

    @SerializedName("Days")
    private List<TripDay> days;

    // Getter 메소드들
    public int getTripId() { return tripId; }
    public String getTitle() { return title; }
    public String getStartDate() { return startDate; }
    public String getEndDate() { return endDate; }
    public int getViewCount() { return viewCount; }
    public String getImageUrl() { return imageUrl; }
    public Author getAuthor() { return author; }
    public List<TripDay> getDays() { return days; }

    // 편의 메서드: 작성자 닉네임 반환
    public String getNickname() {
        return author != null ? author.nickname : "알 수 없음";
    }

    // 내부 클래스: 작성자 정보
    public static class Author {
        @SerializedName("nickname")
        public String nickname;

        public String getNickname() { return nickname; }
    }
}
