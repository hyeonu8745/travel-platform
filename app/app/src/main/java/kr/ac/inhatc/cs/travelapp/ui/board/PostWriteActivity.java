package kr.ac.inhatc.cs.travelapp.ui.board;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.MotionEvent; // ⭐️ 추가됨
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.util.HashMap;
import java.util.Map;

import kr.ac.inhatc.cs.travelapp.R;
import kr.ac.inhatc.cs.travelapp.data.api.ApiClient;
import kr.ac.inhatc.cs.travelapp.data.api.BoardApi;
import kr.ac.inhatc.cs.travelapp.data.model.ApiResponse;
import kr.ac.inhatc.cs.travelapp.data.model.Post;
import kr.ac.inhatc.cs.travelapp.data.model.PostRequest;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PostWriteActivity extends AppCompatActivity {

    private Spinner spinnerCategory;
    private EditText editTitle, editContent;
    private View layoutFileUpload;
    private Button btnSubmit, btnCancel;
    private TextView textFilename;

    private String mode = "write";
    private int postId = -1;
    private Uri selectedImageUri = null;

    private static final int PERMISSION_REQUEST_CODE = 100;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_post_write);

        // 1. 뷰 연결
        spinnerCategory = findViewById(R.id.spinner_category);
        editTitle = findViewById(R.id.edit_title);
        editContent = findViewById(R.id.edit_content);
        layoutFileUpload = findViewById(R.id.layout_file_upload);
        textFilename = findViewById(R.id.text_filename);
        btnSubmit = findViewById(R.id.btn_submit);
        btnCancel = findViewById(R.id.btn_cancel);

        // 2. 스피너 설정
        String[] categories = {"자유게시판", "질문게시판", "여행후기"};
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, categories);
        spinnerCategory.setAdapter(adapter);

        // 3. 모드 확인
        if (getIntent() != null) {
            mode = getIntent().getStringExtra("mode");
            postId = getIntent().getIntExtra("postId", -1);
        }

        if ("edit".equals(mode) && postId != -1) {
            btnSubmit.setText("수정하기");
            loadPostData(postId);
        }

        // 4. 리스너 설정

        // ⭐️ 내용 입력창 스크롤 문제 해결
        editContent.setOnTouchListener((v, event) -> {
            if (editContent.hasFocus()) {
                v.getParent().requestDisallowInterceptTouchEvent(true);
                switch (event.getAction() & MotionEvent.ACTION_MASK) {
                    case MotionEvent.ACTION_UP:
                        v.getParent().requestDisallowInterceptTouchEvent(false);
                        break;
                }
            }
            return false;
        });

        // 파일 첨부
        if (layoutFileUpload != null) {
            layoutFileUpload.setOnClickListener(v -> checkPermissionAndOpenGallery());
        }

        // 취소 버튼
        if (btnCancel != null) {
            btnCancel.setOnClickListener(v -> finish());
        }

        // 등록 버튼
        btnSubmit.setOnClickListener(v -> {
            String title = editTitle.getText().toString().trim();
            String content = editContent.getText().toString().trim();

            if (title.isEmpty() || content.isEmpty()) {
                Toast.makeText(this, "제목과 내용을 입력하세요.", Toast.LENGTH_SHORT).show();
                return;
            }

            if ("edit".equals(mode)) {
                updatePost(postId, title, content);
            } else {
                createPost(title, content);
            }
        });
    }

    // 권한 체크
    private void checkPermissionAndOpenGallery() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_MEDIA_IMAGES) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.READ_MEDIA_IMAGES}, PERMISSION_REQUEST_CODE);
            } else {
                openGallery();
            }
        } else {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.READ_EXTERNAL_STORAGE}, PERMISSION_REQUEST_CODE);
            } else {
                openGallery();
            }
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                openGallery();
            } else {
                Toast.makeText(this, "권한이 필요합니다.", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void openGallery() {
        Intent intent = new Intent(Intent.ACTION_PICK);
        intent.setDataAndType(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, "image/*");
        galleryLauncher.launch(intent);
    }

    private final ActivityResultLauncher<Intent> galleryLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                    selectedImageUri = result.getData().getData();
                    if (selectedImageUri != null) {
                        textFilename.setText("사진 선택 완료!");
                        textFilename.setTextColor(getColor(R.color.purple_500));
                    }
                }
            }
    );

    private void createPost(String title, String content) {
        BoardApi api = ApiClient.getClient(this).create(BoardApi.class);
        PostRequest request = new PostRequest(title, content);
        request.setBoardId(spinnerCategory.getSelectedItemPosition() + 1);

        api.createPost(request).enqueue(new Callback<ApiResponse<Object>>() {
            @Override
            public void onResponse(Call<ApiResponse<Object>> call, Response<ApiResponse<Object>> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(PostWriteActivity.this, "등록되었습니다.", Toast.LENGTH_SHORT).show();
                    finish();
                } else {
                    Toast.makeText(PostWriteActivity.this, "등록 실패", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<ApiResponse<Object>> call, Throwable t) {
                Toast.makeText(PostWriteActivity.this, "오류 발생", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void updatePost(int id, String title, String content) {
        BoardApi api = ApiClient.getClient(this).create(BoardApi.class);
        Map<String, String> body = new HashMap<>();
        body.put("title", title);
        body.put("content", content);

        api.updatePost(id, body).enqueue(new Callback<ApiResponse<Object>>() {
            @Override
            public void onResponse(Call<ApiResponse<Object>> call, Response<ApiResponse<Object>> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(PostWriteActivity.this, "수정되었습니다.", Toast.LENGTH_SHORT).show();
                    finish();
                }
            }
            @Override
            public void onFailure(Call<ApiResponse<Object>> call, Throwable t) {
                Toast.makeText(PostWriteActivity.this, "오류 발생", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void loadPostData(int id) {
        BoardApi api = ApiClient.getClient(this).create(BoardApi.class);
        api.getPostDetail(id).enqueue(new Callback<ApiResponse<Post>>() {
            @Override
            public void onResponse(Call<ApiResponse<Post>> call, Response<ApiResponse<Post>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Post post = response.body().getData();
                    editTitle.setText(post.getTitle());
                    editContent.setText(post.getContent());
                }
            }
            @Override
            public void onFailure(Call<ApiResponse<Post>> call, Throwable t) {}
        });
    }
}
