package kr.ac.inhatc.cs.travelapp.ui.board;

import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.inputmethod.InputMethodManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import kr.ac.inhatc.cs.travelapp.R;
import kr.ac.inhatc.cs.travelapp.data.PreferenceHelper;
import kr.ac.inhatc.cs.travelapp.data.api.ApiClient;
import kr.ac.inhatc.cs.travelapp.data.api.BoardApi;
import kr.ac.inhatc.cs.travelapp.data.model.ApiResponse;
import kr.ac.inhatc.cs.travelapp.data.model.Comment;
import kr.ac.inhatc.cs.travelapp.data.model.Post;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PostDetailActivity extends AppCompatActivity {

    private TextView textTitle, textNickname, textDate, textViewCount;
    private WebView webView;
    private RecyclerView recyclerComments;
    private EditText editComment;
    private Button btnSubmit;
    private CommentAdapter commentAdapter;

    private int currentPostId = -1;
    private int loggedInUserId = -1; // 내 ID
    private int postAuthorId = -1;   // 글쓴이 ID
    private Menu mMenu;              // 툴바 메뉴 객체

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_post_detail);

        // 0. 내 ID 가져오기
        PreferenceHelper prefs = new PreferenceHelper(this);
        loggedInUserId = prefs.getInt("user_id");
        Log.d("USER_CHECK", "내 ID: " + loggedInUserId);

        // 1. 툴바 설정
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setDisplayShowTitleEnabled(false);
        }

        // 2. 뷰 연결
        textTitle = findViewById(R.id.text_title);
        textNickname = findViewById(R.id.text_author);
        textDate = findViewById(R.id.text_date);
        textViewCount = findViewById(R.id.text_view_count);

        webView = findViewById(R.id.detail_webview);
        recyclerComments = findViewById(R.id.recycler_comments);
        editComment = findViewById(R.id.edit_comment);
        btnSubmit = findViewById(R.id.btn_submit_comment);

        // 3. 웹뷰 설정
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);

        // 4. 댓글 리스트 설정
        recyclerComments.setLayoutManager(new LinearLayoutManager(this));
        commentAdapter = new CommentAdapter();

        // ⭐️ [수정] 어댑터에 ID와 삭제 리스너 연결
        commentAdapter.setMyUserId(loggedInUserId);
        commentAdapter.setOnCommentDeleteListener(commentId -> {
            new AlertDialog.Builder(this)
                    .setMessage("댓글을 삭제할까요?")
                    // ⭐️ currentPostId도 같이 넘김!
                    .setPositiveButton("삭제", (dialog, which) -> deleteCommentApi(currentPostId, commentId))
                    .setNegativeButton("취소", null)
                    .show();
        });

        recyclerComments.setAdapter(commentAdapter);

        // 5. ID 받기
        currentPostId = getIntent().getIntExtra("postId", -1);

        if (currentPostId != -1) {
            loadPostDetail(currentPostId);
        } else {
            Toast.makeText(this, "잘못된 접근입니다.", Toast.LENGTH_SHORT).show();
            finish();
        }

        // 6. 댓글 작성
        btnSubmit.setOnClickListener(v -> {
            String content = editComment.getText().toString().trim();
            if (!content.isEmpty()) {
                writeComment(content);
            } else {
                Toast.makeText(this, "내용을 입력하세요.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_post_detail, menu);
        mMenu = menu;
        updateMenuVisibility();
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        int id = item.getItemId();

        if (id == android.R.id.home) {
            finish();
            return true;
        } else if (id == R.id.action_edit) {
            Intent intent = new Intent(this, PostWriteActivity.class);
            intent.putExtra("mode", "edit");
            intent.putExtra("postId", currentPostId);
            startActivity(intent);
            return true;
        } else if (id == R.id.action_delete) {
            showDeleteDialog();
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    private void updateMenuVisibility() {
        if (mMenu == null) return;
        boolean isOwner = (loggedInUserId != -1 && loggedInUserId == postAuthorId);

        MenuItem editItem = mMenu.findItem(R.id.action_edit);
        MenuItem deleteItem = mMenu.findItem(R.id.action_delete);

        if (editItem != null) editItem.setVisible(isOwner);
        if (deleteItem != null) deleteItem.setVisible(isOwner);
    }

    private void showDeleteDialog() {
        new AlertDialog.Builder(this)
                .setTitle("게시글 삭제")
                .setMessage("정말로 삭제하시겠습니까?")
                .setPositiveButton("삭제", (dialog, which) -> deletePost())
                .setNegativeButton("취소", null)
                .show();
    }

    private void deletePost() {
        BoardApi api = ApiClient.getClient(this).create(BoardApi.class);
        api.deletePost(currentPostId).enqueue(new Callback<ApiResponse<Object>>() {
            @Override
            public void onResponse(Call<ApiResponse<Object>> call, Response<ApiResponse<Object>> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(PostDetailActivity.this, "삭제되었습니다.", Toast.LENGTH_SHORT).show();
                    finish();
                } else {
                    Toast.makeText(PostDetailActivity.this, "삭제 실패", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Object>> call, Throwable t) {
                Toast.makeText(PostDetailActivity.this, "통신 오류", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void loadPostDetail(int postId) {
        BoardApi api = ApiClient.getClient(this).create(BoardApi.class);

        api.getPostDetail(postId).enqueue(new Callback<ApiResponse<Post>>() {
            @Override
            public void onResponse(Call<ApiResponse<Post>> call, Response<ApiResponse<Post>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Post post = response.body().getData();

                    if (post != null) {
                        postAuthorId = post.getUserId();
                        updateMenuVisibility();

                        textTitle.setText(post.getTitle());

                        if(post.getNickname() != null) textNickname.setText(post.getNickname());
                        else textNickname.setText("알 수 없음");

                        if(post.getCreatedAt() != null && post.getCreatedAt().length() >= 10)
                            textDate.setText(post.getCreatedAt().substring(0, 10));
                        else textDate.setText(post.getCreatedAt());

                        if (textViewCount != null) {
                            textViewCount.setText("조회수 " + post.getViewCount());
                        }

                        String htmlContent = "<html><head><style>" +
                                "body { margin:0; padding:0; font-size: 50px; line-height: 2; color: #333; }" +
                                "img { max-width: 100%; height: auto; display: block; margin: 10px auto; }" +
                                "p { margin: 0 0 10px 0; }" +
                                "</style></head><body>" +
                                post.getContent() +
                                "</body></html>";

                        webView.loadDataWithBaseURL(null, htmlContent, "text/html; charset=utf-8", "UTF-8", null);
                    }

                    List<Comment> comments = response.body().getComments();
                    if (comments != null) {
                        commentAdapter.setComments(comments);
                    }
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Post>> call, Throwable t) {
                Toast.makeText(PostDetailActivity.this, "통신 오류", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void writeComment(String content) {
        BoardApi api = ApiClient.getClient(this).create(BoardApi.class);
        Map<String, String> body = new HashMap<>();
        body.put("content", content);

        api.createComment(currentPostId, body).enqueue(new Callback<ApiResponse<Object>>() {
            @Override
            public void onResponse(Call<ApiResponse<Object>> call, Response<ApiResponse<Object>> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(PostDetailActivity.this, "댓글 등록됨", Toast.LENGTH_SHORT).show();
                    editComment.setText("");
                    InputMethodManager imm = (InputMethodManager) getSystemService(INPUT_METHOD_SERVICE);
                    imm.hideSoftInputFromWindow(editComment.getWindowToken(), 0);
                    loadPostDetail(currentPostId);
                } else {
                    Toast.makeText(PostDetailActivity.this, "실패 (로그인 필요)", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Object>> call, Throwable t) {
                Toast.makeText(PostDetailActivity.this, "에러 발생", Toast.LENGTH_SHORT).show();
            }
        });
    }

    // ⭐️ 댓글 삭제 API 호출 (postId, commentId 둘 다 사용)
    private void deleteCommentApi(int postId, int commentId) {
        BoardApi api = ApiClient.getClient(this).create(BoardApi.class);
        api.deleteComment(postId, commentId).enqueue(new Callback<ApiResponse<Object>>() {
            @Override
            public void onResponse(Call<ApiResponse<Object>> call, Response<ApiResponse<Object>> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(PostDetailActivity.this, "댓글 삭제됨", Toast.LENGTH_SHORT).show();
                    loadPostDetail(currentPostId); // 목록 갱신
                } else {
                    Toast.makeText(PostDetailActivity.this, "삭제 실패: " + response.code(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Object>> call, Throwable t) {
                Toast.makeText(PostDetailActivity.this, "에러 발생", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
