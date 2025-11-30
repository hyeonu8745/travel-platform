package kr.ac.inhatc.cs.travelapp.ui.login;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView; // ⭐️ TextView 임포트 추가
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import kr.ac.inhatc.cs.travelapp.MainActivity;
import kr.ac.inhatc.cs.travelapp.R;
import kr.ac.inhatc.cs.travelapp.data.PreferenceHelper;
import kr.ac.inhatc.cs.travelapp.data.api.ApiClient;
import kr.ac.inhatc.cs.travelapp.data.api.AuthApi;
import kr.ac.inhatc.cs.travelapp.data.model.LoginRequest;
import kr.ac.inhatc.cs.travelapp.data.model.LoginResponse;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    private EditText editUsername, editPassword;
    private Button btnLogin;
    private TextView textSignup; // ⭐️ 회원가입 버튼(텍스트) 변수 추가

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        // 1. 자동 로그인 체크
        PreferenceHelper prefs = new PreferenceHelper(this);
        String token = prefs.getAccessToken();
        int savedUserId = prefs.getUserId();

        if (token != null && savedUserId != -1) {
            Log.d("LOGIN", "자동 로그인 성공 (ID: " + savedUserId + ")");
            startMainActivity();
            return;
        }

        // 2. 뷰 연결
        editUsername = findViewById(R.id.edit_username);
        editPassword = findViewById(R.id.edit_password);
        btnLogin = findViewById(R.id.btn_login);
        textSignup = findViewById(R.id.text_signup); // ⭐️ XML ID 연결 (activity_login.xml에 있어야 함)

        // 3. 로그인 버튼 리스너
        btnLogin.setOnClickListener(v -> {
            String email = editUsername.getText().toString().trim();
            String password = editPassword.getText().toString().trim();

            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "이메일과 비밀번호를 입력하세요.", Toast.LENGTH_SHORT).show();
                return;
            }

            login(email, password);
        });

        // ⭐️ [추가] 회원가입 텍스트 클릭 시 화면 이동
        if (textSignup != null) {
            textSignup.setOnClickListener(v -> {
                Intent intent = new Intent(LoginActivity.this, SignupActivity.class);
                startActivity(intent);
            });
        }
    }

    private void login(String email, String password) {
        AuthApi api = ApiClient.getClient(this).create(AuthApi.class);
        LoginRequest request = new LoginRequest(email, password);

        api.login(request).enqueue(new Callback<LoginResponse>() {
            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    // 로그인 성공 로직 (기존과 동일)
                    LoginResponse data = response.body();
                    if (data.getToken() == null) {
                        showToast("서버 오류: 토큰 없음");
                        return;
                    }

                    // 토큰 저장 및 화면 이동
                    PreferenceHelper prefs = new PreferenceHelper(LoginActivity.this);
                    prefs.saveAccessToken(data.getToken());
                    if (data.getUser() != null) {
                        prefs.saveUserId(data.getUser().getUserId());
                        prefs.saveNickname(data.getUser().getNickname());
                        prefs.saveEmail(data.getUser().getEmail());
                    }

                    showToast("로그인 성공!");
                    startMainActivity();

                } else {
                    // ⭐️ [수정] 실패 시 명확한 메시지 표시 (401 Unauthorized 등)
                    if (response.code() == 401) {
                        showToast("아이디 또는 비밀번호가 일치하지 않습니다.");
                    } else if (response.code() == 404) {
                        showToast("존재하지 않는 계정입니다.");
                    } else {
                        showToast("로그인 실패 (코드: " + response.code() + ")");
                    }
                }
            }

            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                // ⭐️ [수정] 네트워크 오류 시 앱이 죽지 않도록 처리
                Log.e("LOGIN_ERROR", "Network Error", t);
                showToast("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
            }
        });
    }

    // ⭐️ [편의 메서드] UI 스레드에서 안전하게 토스트 띄우기
    private void showToast(String message) {
        runOnUiThread(() ->
                Toast.makeText(LoginActivity.this, message, Toast.LENGTH_SHORT).show()
        );
    }


    private void startMainActivity() {
        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
    }
}
