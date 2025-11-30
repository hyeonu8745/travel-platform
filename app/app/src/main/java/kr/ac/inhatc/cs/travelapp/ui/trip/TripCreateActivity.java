package kr.ac.inhatc.cs.travelapp.ui.trip;

import android.Manifest;
import android.app.DatePickerDialog;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.google.android.material.tabs.TabLayout;
import com.google.gson.Gson;

import java.io.File;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Locale;

import kr.ac.inhatc.cs.travelapp.R;
import kr.ac.inhatc.cs.travelapp.data.api.ApiClient;
import kr.ac.inhatc.cs.travelapp.data.api.TripApi;
import kr.ac.inhatc.cs.travelapp.data.model.ApiResponse;
import kr.ac.inhatc.cs.travelapp.data.model.Trip;
import kr.ac.inhatc.cs.travelapp.data.model.TripCreateStopRequest;
import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class TripCreateActivity extends AppCompatActivity {

    private EditText editTitle, editStartDate, editEndDate;
    private ImageView imagePreview;
    private Button btnSelectImage, btnSave, btnCancel, btnAddPlace, btnAddDay; // ⭐️ btnCancel 추가됨
    private TabLayout tabLayoutDays;
    private RecyclerView recyclerPlaces;

    private PlaceListAdapter placeAdapter;
    private Uri selectedImageUri = null;

    private List<TripCreateStopRequest> allStops = new ArrayList<>();
    private int currentSelectedDay = 1;

    // 날짜 선택용 캘린더
    private final Calendar calendar = Calendar.getInstance();

    private final ActivityResultLauncher<Intent> imagePickerLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                    selectedImageUri = result.getData().getData();
                    Glide.with(this).load(selectedImageUri).centerCrop().into(imagePreview);
                }
            }
    );

    private final ActivityResultLauncher<Intent> mapActivityLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                    Intent data = result.getData();
                    if (data != null) {
                        String name = data.getStringExtra("name");
                        double lat = data.getDoubleExtra("lat", 0);
                        double lng = data.getDoubleExtra("lng", 0);

                        if (name != null) {
                            addPlaceToCurrentDay(name, lat, lng);
                        }
                    }
                }
            }
    );

    private final ActivityResultLauncher<String> requestPermissionLauncher = registerForActivityResult(
            new ActivityResultContracts.RequestPermission(),
            isGranted -> {
                if (isGranted) openGallery();
                else Toast.makeText(this, "갤러리 접근 권한이 필요합니다.", Toast.LENGTH_SHORT).show();
            }
    );

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_trip_create);

        initViews();
        setupListeners();

        addDayTab(); // 1일차 탭 기본 추가
    }

    private void initViews() {
        editTitle = findViewById(R.id.edit_title);
        editStartDate = findViewById(R.id.edit_start_date);
        editEndDate = findViewById(R.id.edit_end_date);
        imagePreview = findViewById(R.id.image_preview);
        btnSelectImage = findViewById(R.id.btn_select_image);
        btnSave = findViewById(R.id.btn_save);
        btnCancel = findViewById(R.id.btn_cancel); // ⭐️ 취소 버튼 연결
        btnAddPlace = findViewById(R.id.btn_add_place);
        btnAddDay = findViewById(R.id.btn_add_day);
        tabLayoutDays = findViewById(R.id.tab_layout_days);
        recyclerPlaces = findViewById(R.id.recycler_places);

        recyclerPlaces.setLayoutManager(new LinearLayoutManager(this));
        placeAdapter = new PlaceListAdapter(new ArrayList<>(), this::removePlace);
        recyclerPlaces.setAdapter(placeAdapter);
    }

    private void setupListeners() {
        // 날짜 선택 (달력)
        editStartDate.setOnClickListener(v -> showDatePicker(editStartDate));
        editEndDate.setOnClickListener(v -> showDatePicker(editEndDate));

        // 이미지 선택
        btnSelectImage.setOnClickListener(v -> checkPermissionAndOpenGallery());

        // 저장 & 취소
        btnSave.setOnClickListener(v -> uploadTrip());
        if (btnCancel != null) {
            btnCancel.setOnClickListener(v -> finish()); // ⭐️ 취소 시 종료
        }

        // 장소/일차 추가
        btnAddPlace.setOnClickListener(v -> {
            Intent intent = new Intent(TripCreateActivity.this, TripMapActivity.class);
            mapActivityLauncher.launch(intent);
        });

        btnAddDay.setOnClickListener(v -> addDayTab());

        // 탭 변경 (날짜 이동)
        tabLayoutDays.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                currentSelectedDay = tab.getPosition() + 1;
                updatePlaceListUI();
            }
            @Override public void onTabUnselected(TabLayout.Tab tab) {}
            @Override public void onTabReselected(TabLayout.Tab tab) {}
        });
    }

    private void showDatePicker(EditText targetEditText) {
        int year = calendar.get(Calendar.YEAR);
        int month = calendar.get(Calendar.MONTH);
        int day = calendar.get(Calendar.DAY_OF_MONTH);

        DatePickerDialog datePickerDialog = new DatePickerDialog(
                this,
                (view, selectedYear, selectedMonth, selectedDay) -> {
                    String selectedDate = String.format(Locale.getDefault(), "%04d-%02d-%02d", selectedYear, selectedMonth + 1, selectedDay);
                    targetEditText.setText(selectedDate);
                },
                year, month, day
        );
        datePickerDialog.show();
    }

    private void addDayTab() {
        int newDay = tabLayoutDays.getTabCount() + 1;
        tabLayoutDays.addTab(tabLayoutDays.newTab().setText(newDay + "일차"));

        TabLayout.Tab tab = tabLayoutDays.getTabAt(newDay - 1);
        if (tab != null) tab.select();
    }

    private void addPlaceToCurrentDay(String name, double lat, double lng) {
        int currentDayCount = 0;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
            currentDayCount = (int) allStops.stream()
                    .filter(s -> s.getDay() == currentSelectedDay).count();
        } else {
            for(TripCreateStopRequest s : allStops) {
                if(s.getDay() == currentSelectedDay) currentDayCount++;
            }
        }

        TripCreateStopRequest newStop = new TripCreateStopRequest(
                currentSelectedDay,
                name, lat, lng,
                "",
                currentDayCount + 1
        );

        allStops.add(newStop);
        updatePlaceListUI();
        Toast.makeText(this, currentSelectedDay + "일차에 추가되었습니다.", Toast.LENGTH_SHORT).show();
    }

    private void removePlace(TripCreateStopRequest stop) {
        allStops.remove(stop);
        updatePlaceListUI();
    }

    private void updatePlaceListUI() {
        List<TripCreateStopRequest> currentDayStops = new ArrayList<>();
        for (TripCreateStopRequest stop : allStops) {
            if (stop.getDay() == currentSelectedDay) {
                currentDayStops.add(stop);
            }
        }
        placeAdapter.setItems(currentDayStops);
    }

    private void checkPermissionAndOpenGallery() {
        String permission;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permission = Manifest.permission.READ_MEDIA_IMAGES;
        } else {
            permission = Manifest.permission.READ_EXTERNAL_STORAGE;
        }

        if (ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED) {
            openGallery();
        } else {
            requestPermissionLauncher.launch(permission);
        }
    }

    private void openGallery() {
        Intent intent = new Intent(Intent.ACTION_PICK);
        intent.setType("image/*");
        imagePickerLauncher.launch(intent);
    }

    private void uploadTrip() {
        String title = editTitle.getText().toString();
        String startDate = editStartDate.getText().toString();
        String endDate = editEndDate.getText().toString();

        if (title.isEmpty() || startDate.isEmpty() || allStops.isEmpty()) {
            Toast.makeText(this, "제목, 날짜, 코스를 모두 입력해주세요.", Toast.LENGTH_SHORT).show();
            return;
        }

        String stopsJson = new Gson().toJson(allStops);

        RequestBody titleBody = RequestBody.create(MediaType.parse("text/plain"), title);
        RequestBody startBody = RequestBody.create(MediaType.parse("text/plain"), startDate);
        RequestBody endBody = RequestBody.create(MediaType.parse("text/plain"), endDate);
        RequestBody stopsBody = RequestBody.create(MediaType.parse("application/json"), stopsJson);

        MultipartBody.Part imagePart = null;
        if (selectedImageUri != null) {
            File file = getFileFromUri(selectedImageUri);
            if (file != null) {
                RequestBody requestFile = RequestBody.create(MediaType.parse("image/*"), file);
                imagePart = MultipartBody.Part.createFormData("image", file.getName(), requestFile);
            }
        }

        TripApi api = ApiClient.getClient(this).create(TripApi.class);
        api.createTrip(imagePart, titleBody, startBody, endBody, stopsBody).enqueue(new Callback<ApiResponse<Trip>>() {
            @Override
            public void onResponse(Call<ApiResponse<Trip>> call, Response<ApiResponse<Trip>> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(TripCreateActivity.this, "코스가 저장되었습니다!", Toast.LENGTH_SHORT).show();
                    finish();
                } else {
                    Toast.makeText(TripCreateActivity.this, "저장 실패: " + response.code(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Trip>> call, Throwable t) {
                Toast.makeText(TripCreateActivity.this, "네트워크 오류", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private File getFileFromUri(Uri uri) {
        String filePath = null;
        String[] projection = {MediaStore.Images.Media.DATA};
        try (Cursor cursor = getContentResolver().query(uri, projection, null, null, null)) {
            if (cursor != null && cursor.moveToFirst()) {
                int columnIndex = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
                filePath = cursor.getString(columnIndex);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return filePath != null ? new File(filePath) : null;
    }
}
