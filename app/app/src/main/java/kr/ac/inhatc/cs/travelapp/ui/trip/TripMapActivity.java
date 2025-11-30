package kr.ac.inhatc.cs.travelapp.ui.trip;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.gms.common.api.Status;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.libraries.places.api.Places;
import com.google.android.libraries.places.api.model.Place;
import com.google.android.libraries.places.widget.AutocompleteSupportFragment;
import com.google.android.libraries.places.widget.listener.PlaceSelectionListener;

import java.util.Arrays;

import kr.ac.inhatc.cs.travelapp.R;

public class TripMapActivity extends AppCompatActivity implements OnMapReadyCallback {

    private GoogleMap mMap;
    private Button btnConfirm;
    private LatLng selectedLocation;
    private String selectedPlaceName;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_trip_map);

        try {
            android.content.pm.ApplicationInfo ai = getPackageManager().getApplicationInfo(getPackageName(), android.content.pm.PackageManager.GET_META_DATA);
            android.os.Bundle bundle = ai.metaData;
            String myApiKey = bundle.getString("com.google.android.geo.API_KEY");

            // 2. 가져온 키로 Places 초기화
            if (myApiKey != null) {
                com.google.android.libraries.places.api.Places.initialize(getApplicationContext(), myApiKey);
            }
        } catch (android.content.pm.PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        } catch (NullPointerException e) {
            e.printStackTrace();
        }

        btnConfirm = findViewById(R.id.btn_confirm_place);

        // 2. 지도 프래그먼트 연결
        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.map);
        if (mapFragment != null) {
            mapFragment.getMapAsync(this);
        }

        // 3. 자동완성 프래그먼트 설정
        AutocompleteSupportFragment autocompleteFragment = (AutocompleteSupportFragment)
                getSupportFragmentManager().findFragmentById(R.id.autocomplete_fragment);

        if (autocompleteFragment != null) {
            // 검색해서 가져올 데이터 필드 지정 (ID, 이름, 좌표)
            autocompleteFragment.setPlaceFields(Arrays.asList(Place.Field.ID, Place.Field.NAME, Place.Field.LAT_LNG));

            // 힌트 텍스트 설정
            autocompleteFragment.setHint("장소 검색 (예: 도쿄 타워)");

            // 이벤트 리스너
            autocompleteFragment.setOnPlaceSelectedListener(new PlaceSelectionListener() {
                @Override
                public void onPlaceSelected(@NonNull Place place) {
                    // 장소가 선택되었을 때 실행됨
                    LatLng latLng = place.getLatLng();
                    String name = place.getName();

                    if (latLng != null) {
                        moveCameraAndMarker(latLng, name);
                    }
                }

                @Override
                public void onError(@NonNull Status status) {
                    Log.e("TripMap", "검색 에러: " + status);
                    Toast.makeText(TripMapActivity.this, "검색 중 오류가 발생했습니다.", Toast.LENGTH_SHORT).show();
                }
            });
        }

        // 선택 완료 버튼
        btnConfirm.setOnClickListener(v -> {
            if (selectedLocation != null) {
                Intent resultIntent = new Intent();
                resultIntent.putExtra("name", selectedPlaceName);
                resultIntent.putExtra("lat", selectedLocation.latitude);
                resultIntent.putExtra("lng", selectedLocation.longitude);
                setResult(RESULT_OK, resultIntent);
                finish();
            }
        });
    }

    @Override
    public void onMapReady(@NonNull GoogleMap googleMap) {
        mMap = googleMap;

        // 초기 위치 (서울)
        LatLng seoul = new LatLng(37.5665, 126.9780);
        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(seoul, 10));

        // 지도 클릭 시에도 마커 이동
        mMap.setOnMapClickListener(latLng -> {
            moveCameraAndMarker(latLng, "사용자 지정 위치");
        });
    }

    // ⭐️ 카메라 이동 및 마커 찍기 공통 함수
    private void moveCameraAndMarker(LatLng latLng, String name) {
        if (mMap == null) return;

        mMap.clear();
        mMap.addMarker(new MarkerOptions().position(latLng).title(name));
        mMap.animateCamera(CameraUpdateFactory.newLatLngZoom(latLng, 15));

        selectedLocation = latLng;
        selectedPlaceName = name;
        btnConfirm.setEnabled(true);
        btnConfirm.setText("'" + name + "' 선택");
    }
}
