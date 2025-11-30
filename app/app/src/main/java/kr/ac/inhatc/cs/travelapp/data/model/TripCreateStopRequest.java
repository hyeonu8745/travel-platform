package kr.ac.inhatc.cs.travelapp.data.model;

import com.google.gson.annotations.SerializedName;

public class TripCreateStopRequest {
    @SerializedName("day") int day;
    @SerializedName("name") String name;
    @SerializedName("lat") double lat;
    @SerializedName("lng") double lng;
    @SerializedName("memo") String memo;
    @SerializedName("order") int order;

    public TripCreateStopRequest(int day, String name, double lat, double lng, String memo, int order) {
        this.day = day;
        this.name = name;
        this.lat = lat;
        this.lng = lng;
        this.memo = memo;
        this.order = order;
    }

    // ⭐️ [추가] Getter 메소드들 (이게 없어서 에러가 났습니다)
    public String getName() { return name; }
    public int getDay() { return day; }
    public double getLat() { return lat; }
    public double getLng() { return lng; }
    public String getMemo() { return memo; }
    public int getOrder() { return order; }
}
