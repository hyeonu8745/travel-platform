package kr.ac.inhatc.cs.travelapp.data.model;
import com.google.gson.annotations.SerializedName;
import java.util.List;

public class TripDay {
    @SerializedName("day_index") private int dayIndex;
    @SerializedName("date") private String date;
    @SerializedName("Stops") private List<TripDayStop> stops; // 서버의 'Stops' 대소문자 주의

    public int getDayIndex() { return dayIndex; }
    public String getDate() { return date; }
    public List<TripDayStop> getStops() { return stops; }
}
