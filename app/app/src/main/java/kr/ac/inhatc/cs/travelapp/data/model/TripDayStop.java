package kr.ac.inhatc.cs.travelapp.data.model;
import com.google.gson.annotations.SerializedName;

public class TripDayStop {
    @SerializedName("stop_id") private int stopId;
    @SerializedName("location_name") private String locationName;
    @SerializedName("memo") private String memo;
    @SerializedName("stop_order") private int stopOrder;
    @SerializedName("latitude") private double latitude;
    @SerializedName("longitude") private double longitude;

    public String getLocationName() { return locationName; }
    public String getMemo() { return memo; }

    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
}
