package kr.ac.inhatc.cs.travelapp.ui.login;

import android.graphics.Color;
import android.os.Bundle;
import android.util.Patterns;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import kr.ac.inhatc.cs.travelapp.R;
import kr.ac.inhatc.cs.travelapp.data.api.ApiClient;
import kr.ac.inhatc.cs.travelapp.data.api.AuthApi;
import kr.ac.inhatc.cs.travelapp.data.model.ApiResponse;
import kr.ac.inhatc.cs.travelapp.data.model.RegisterRequest;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SignupActivity extends AppCompatActivity {

    private EditText etEmail, etUsername, etNickname, etPassword, etConfirmPassword;
    private Button btnSignup, btnCheckEmail, btnCheckUsername, btnCheckNickname;
    private TextView textGoLogin, textEmailCheck, textUsernameCheck, textNicknameCheck;

    // 중복 확인 통과 여부 플래그
    private boolean isEmailChecked = false;
    private boolean isUsernameChecked = false;
    private boolean isNicknameChecked = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_signup);

        // 뷰 연결
        etEmail = findViewById(R.id.et_email);
        etUsername = findViewById(R.id.et_username);
        etNickname = findViewById(R.id.et_nickname);
        etPassword = findViewById(R.id.et_password);
        etConfirmPassword = findViewById(R.id.et_confirm_password);

        btnSignup = findViewById(R.id.btn_signup);
        btnCheckEmail = findViewById(R.id.btn_check_email);
        btnCheckUsername = findViewById(R.id.btn_check_username);
        btnCheckNickname = findViewById(R.id.btn_check_nickname);

        textEmailCheck = findViewById(R.id.text_email_check);
        textUsernameCheck = findViewById(R.id.text_username_check);
        textNicknameCheck = findViewById(R.id.text_nickname_check);
        textGoLogin = findViewById(R.id.text_go_login);

        // 리스너 설정
        btnCheckEmail.setOnClickListener(v -> checkEmail());
        btnCheckUsername.setOnClickListener(v -> checkUsername());
        btnCheckNickname.setOnClickListener(v -> checkNickname());
        btnSignup.setOnClickListener(v -> attemptSignup());
        textGoLogin.setOnClickListener(v -> finish());
    }

    private void checkEmail() {
        String email = etEmail.getText().toString().trim();
        if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            Toast.makeText(this, "올바른 이메일 형식이 아닙니다.", Toast.LENGTH_SHORT).show();
            return;
        }

        AuthApi api = ApiClient.getClient(this).create(AuthApi.class);
        api.checkEmail(email).enqueue(new Callback<ApiResponse<Void>>() {
            @Override
            public void onResponse(Call<ApiResponse<Void>> call, Response<ApiResponse<Void>> response) {
                if (response.isSuccessful()) {
                    textEmailCheck.setText("사용 가능한 이메일입니다.");
                    textEmailCheck.setTextColor(Color.GREEN);
                    isEmailChecked = true;
                } else {
                    textEmailCheck.setText("이미 사용 중인 이메일입니다.");
                    textEmailCheck.setTextColor(Color.RED);
                    isEmailChecked = false;
                }
            }
            @Override public void onFailure(Call<ApiResponse<Void>> call, Throwable t) { /* 오류 처리 */ }
        });
    }

    // checkUsername(), checkNickname()도 checkEmail()과 유사하게 구현
    private void checkUsername() {
        String username = etUsername.getText().toString().trim();
        if (username.isEmpty()) return;

        AuthApi api = ApiClient.getClient(this).create(AuthApi.class);
        api.checkUsername(username).enqueue(new Callback<ApiResponse<Void>>() {
            @Override
            public void onResponse(Call<ApiResponse<Void>> call, Response<ApiResponse<Void>> response) {
                if (response.isSuccessful()) {
                    textUsernameCheck.setText("사용 가능한 아이디입니다.");
                    textUsernameCheck.setTextColor(Color.GREEN);
                    isUsernameChecked = true;
                } else {
                    textUsernameCheck.setText("이미 사용 중인 아이디입니다.");
                    textUsernameCheck.setTextColor(Color.RED);
                    isUsernameChecked = false;
                }
            }
            @Override public void onFailure(Call<ApiResponse<Void>> call, Throwable t) { /* 오류 처리 */ }
        });
    }

    private void checkNickname() {
        String nickname = etNickname.getText().toString().trim();
        if (nickname.isEmpty()) return;

        AuthApi api = ApiClient.getClient(this).create(AuthApi.class);
        api.checkNickname(nickname).enqueue(new Callback<ApiResponse<Void>>() {
            @Override
            public void onResponse(Call<ApiResponse<Void>> call, Response<ApiResponse<Void>> response) {
                if (response.isSuccessful()) {
                    textNicknameCheck.setText("사용 가능한 닉네임입니다.");
                    textNicknameCheck.setTextColor(Color.GREEN);
                    isNicknameChecked = true;
                } else {
                    textNicknameCheck.setText("이미 사용 중인 닉네임입니다.");
                    textNicknameCheck.setTextColor(Color.RED);
                    isNicknameChecked = false;
                }
            }
            @Override public void onFailure(Call<ApiResponse<Void>> call, Throwable t) { /* 오류 처리 */ }
        });
    }


    private void attemptSignup() {
        // 모든 중복 확인을 통과했는지 검사
        if (!isEmailChecked || !isUsernameChecked || !isNicknameChecked) {
            Toast.makeText(this, "모든 항목의 중복 확인을 완료해주세요.", Toast.LENGTH_SHORT).show();
            return;
        }

        String password = etPassword.getText().toString().trim();
        String confirmPassword = etConfirmPassword.getText().toString().trim();

        if (password.length() < 6) {
            Toast.makeText(this, "비밀번호는 6자리 이상이어야 합니다.", Toast.LENGTH_SHORT).show();
            return;
        }
        if (!password.equals(confirmPassword)) {
            Toast.makeText(this, "비밀번호가 일치하지 않습니다.", Toast.LENGTH_SHORT).show();
            return;
        }

        // 모든 검증 통과 후 회원가입 요청
        RegisterRequest request = new RegisterRequest(
                etEmail.getText().toString().trim(),
                etUsername.getText().toString().trim(),
                password,
                etNickname.getText().toString().trim()
        );

        AuthApi api = ApiClient.getClient(this).create(AuthApi.class);
        api.register(request).enqueue(new Callback<ApiResponse<Void>>() {
            @Override
            public void onResponse(Call<ApiResponse<Void>> call, Response<ApiResponse<Void>> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(SignupActivity.this, "회원가입 성공! 로그인해주세요.", Toast.LENGTH_SHORT).show();
                    finish(); // 로그인 화면으로 복귀
                } else {
                    Toast.makeText(SignupActivity.this, "회원가입 실패 (서버 오류)", Toast.LENGTH_SHORT).show();
                }
            }
            @Override public void onFailure(Call<ApiResponse<Void>> call, Throwable t) { /* 오류 처리 */ }
        });
    }
}
