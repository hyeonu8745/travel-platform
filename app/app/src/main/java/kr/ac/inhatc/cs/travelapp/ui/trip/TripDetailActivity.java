package kr.ac.inhatc.cs.travelapp.ui.trip;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.BitmapDescriptor;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.LatLngBounds;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.gms.maps.model.PolylineOptions;
import com.google.maps.android.ui.IconGenerator;

import java.util.List;

import kr.ac.inhatc.cs.travelapp.R;
import kr.ac.inhatc.cs.travelapp.data.api.ApiClient;
import kr.ac.inhatc.cs.travelapp.data.api.TripApi;
import kr.ac.inhatc.cs.travelapp.data.model.ApiResponse;
import kr.ac.inhatc.cs.travelapp.data.model.TripDayStop;
import kr.ac.inhatc.cs.travelapp.data.model.Trip;
import kr.ac.inhatc.cs.travelapp.data.model.TripDay;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class TripDetailActivity extends AppCompatActivity implements OnMapReadyCallback {

    private TextView textTitle, textDate, textAuthor;
    private RecyclerView recyclerDays;
    private TripDetailAdapter adapter;
    private Button btnShowAll;
    private int tripId = -1;

    private GoogleMap mMap;
    private Trip currentTrip;

    private final int[] DAY_COLORS = {
            Color.RED, Color.BLUE, Color.GREEN, Color.rgb(255, 165, 0), Color.MAGENTA
    };

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_trip_detail);

        // 1. 툴바 설정
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setDisplayShowTitleEnabled(false);
        }
        toolbar.setNavigationOnClickListener(v -> finish());

        // 2. 뷰 연결
        textTitle = findViewById(R.id.text_title);
        textDate = findViewById(R.id.text_date);
        textAuthor = findViewById(R.id.text_author);
        recyclerDays = findViewById(R.id.recycler_days);
        btnShowAll = findViewById(R.id.btn_show_all);

        // 3. 리스트 설정
        recyclerDays.setLayoutManager(new LinearLayoutManager(this));
        adapter = new TripDetailAdapter();
        adapter.setOnDayClickListener(this::focusOnDay);
        recyclerDays.setAdapter(adapter);

        // 4. 전체보기 버튼
        btnShowAll.setOnClickListener(v -> {
            if (currentTrip != null) drawTripRoute(currentTrip);
        });

        // 5. 지도 프래그먼트 연결
        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.map_fragment);
        if (mapFragment != null) {
            mapFragment.getMapAsync(this);
        }

        // 6. 데이터 로딩
        tripId = getIntent().getIntExtra("tripId", -1);
        if (tripId != -1) {
            loadTripDetail(tripId);
        } else {
            Toast.makeText(this, "잘못된 접근입니다.", Toast.LENGTH_SHORT).show();
            finish();
        }
    }

    @Override
    public void onMapReady(@NonNull GoogleMap googleMap) {
        mMap = googleMap;

        // 지도 UI 설정
        mMap.getUiSettings().setZoomControlsEnabled(true);
        mMap.getUiSettings().setScrollGesturesEnabled(true);
        mMap.getUiSettings().setZoomGesturesEnabled(true);
        mMap.getUiSettings().setRotateGesturesEnabled(true);
        mMap.getUiSettings().setTiltGesturesEnabled(true);

        if (currentTrip != null) {
            drawTripRoute(currentTrip);
        }
    }

    private void loadTripDetail(int id) {
        TripApi api = ApiClient.getClient(this).create(TripApi.class);
        api.getTripDetail(id).enqueue(new Callback<ApiResponse<Trip>>() {
            @Override
            public void onResponse(Call<ApiResponse<Trip>> call, Response<ApiResponse<Trip>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Trip trip = response.body().getData();
                    currentTrip = trip;

                    textTitle.setText(trip.getTitle());
                    textDate.setText(trip.getStartDate() + " ~ " + trip.getEndDate());
                    textAuthor.setText("작성자: " + trip.getNickname());

                    if (trip.getDays() != null) {
                        adapter.setDays(trip.getDays());
                        if (mMap != null) {
                            drawTripRoute(trip);
                        }
                    }
                } else {
                    Toast.makeText(TripDetailActivity.this, "불러오기 실패", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Trip>> call, Throwable t) {
                Toast.makeText(TripDetailActivity.this, "통신 오류", Toast.LENGTH_SHORT).show();
            }
        });
    }

    // ⭐️ 경로 그리기 메인 함수
    private void drawTripRoute(Trip trip) {
        if (mMap == null || trip.getDays() == null) return;

        mMap.clear();
        LatLngBounds.Builder allBoundsBuilder = new LatLngBounds.Builder();
        boolean hasPoint = false;

        IconGenerator iconFactory = new IconGenerator(this);
        iconFactory.setStyle(IconGenerator.STYLE_WHITE);

        // 화살표 아이콘 로드
        BitmapDescriptor arrowIcon = bitmapDescriptorFromVector(R.drawable.ic_arrow_direction);

        for (int i = 0; i < trip.getDays().size(); i++) {
            TripDay day = trip.getDays().get(i);
            if (day.getStops() == null || day.getStops().isEmpty()) continue;

            int color = DAY_COLORS[i % DAY_COLORS.length];

            // 1. 경로선 그리기 위한 옵션
            PolylineOptions polylineOptions = new PolylineOptions()
                    .width(12)
                    .color(color)
                    .geodesic(true);

            // 2. 마커 찍고 경로 좌표 추가
            List<TripDayStop> stops = day.getStops();
            for (int j = 0; j < stops.size(); j++) {
                TripDayStop stop = stops.get(j);
                if (stop.getLatitude() != 0) {
                    LatLng point = new LatLng(stop.getLatitude(), stop.getLongitude());

                    // 숫자 마커 생성
                    Bitmap iconBitmap = iconFactory.makeIcon(String.valueOf(j + 1));

                    mMap.addMarker(new MarkerOptions()
                            .position(point)
                            .icon(BitmapDescriptorFactory.fromBitmap(iconBitmap))
                            .anchor(0.5f, 1f)
                            .title(stop.getLocationName())
                            .snippet(day.getDayIndex() + "일차"));

                    polylineOptions.add(point);
                    allBoundsBuilder.include(point);
                    hasPoint = true;
                }
            }

            // 3. 선 그리기
            mMap.addPolyline(polylineOptions);

            // ⭐️ 4. 중간 지점에 화살표 마커 추가 (방향 표시)
            if (arrowIcon != null) {
                addMidpointArrows(stops, arrowIcon);
            }
        }

        if (hasPoint) {
            moveCamera(allBoundsBuilder.build());
        }
    }

    // ⭐️ 두 지점 사이 중간에 화살표를 찍는 함수
    private void addMidpointArrows(List<TripDayStop> stops, BitmapDescriptor arrowIcon) {
        for (int j = 0; j < stops.size() - 1; j++) {
            TripDayStop start = stops.get(j);
            TripDayStop end = stops.get(j + 1);

            if (start.getLatitude() == 0 || end.getLatitude() == 0) continue;

            LatLng startLatLng = new LatLng(start.getLatitude(), start.getLongitude());
            LatLng endLatLng = new LatLng(end.getLatitude(), end.getLongitude());

            // 중간 좌표 계산
            double midLat = (startLatLng.latitude + endLatLng.latitude) / 2;
            double midLng = (startLatLng.longitude + endLatLng.longitude) / 2;
            LatLng midPoint = new LatLng(midLat, midLng);

            // 회전 각도 계산
            double angle = calculateBearing(startLatLng, endLatLng);

            // 화살표 마커 추가
            mMap.addMarker(new MarkerOptions()
                    .position(midPoint)
                    .icon(arrowIcon)
                    .anchor(0.5f, 0.5f) // 중심 기준
                    .rotation((float) angle) // 진행 방향으로 회전
                    .flat(true) // 지도와 함께 회전하도록 설정
                    .zIndex(1.0f)); // 선 위에 보이게
        }
    }

    // ⭐️ 두 좌표 사이의 각도(방위각) 계산
    private double calculateBearing(LatLng start, LatLng end) {
        double startLat = Math.toRadians(start.latitude);
        double startLng = Math.toRadians(start.longitude);
        double endLat = Math.toRadians(end.latitude);
        double endLng = Math.toRadians(end.longitude);

        double dLng = endLng - startLng;
        double y = Math.sin(dLng) * Math.cos(endLat);
        double x = Math.cos(startLat) * Math.sin(endLat) -
                Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

        return (Math.toDegrees(Math.atan2(y, x)) + 360) % 360;
    }

    private void focusOnDay(TripDay day) {
        if (mMap == null || day.getStops() == null) return;

        LatLngBounds.Builder dayBounds = new LatLngBounds.Builder();
        boolean hasPoint = false;

        for (TripDayStop stop : day.getStops()) {
            if (stop.getLatitude() != 0) {
                dayBounds.include(new LatLng(stop.getLatitude(), stop.getLongitude()));
                hasPoint = true;
            }
        }

        if (hasPoint) {
            moveCamera(dayBounds.build());
            Toast.makeText(this, day.getDayIndex() + "일차 경로입니다.", Toast.LENGTH_SHORT).show();
        }
    }

    private void moveCamera(LatLngBounds bounds) {
        try {
            mMap.animateCamera(CameraUpdateFactory.newLatLngBounds(bounds, 150));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private BitmapDescriptor bitmapDescriptorFromVector(int vectorResId) {
        Drawable vectorDrawable = ContextCompat.getDrawable(this, vectorResId);
        if (vectorDrawable == null) return null;

        vectorDrawable.setBounds(0, 0, vectorDrawable.getIntrinsicWidth(), vectorDrawable.getIntrinsicHeight());
        Bitmap bitmap = Bitmap.createBitmap(vectorDrawable.getIntrinsicWidth(), vectorDrawable.getIntrinsicHeight(), Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);
        vectorDrawable.draw(canvas);
        return BitmapDescriptorFactory.fromBitmap(bitmap);
    }
}
