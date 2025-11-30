package kr.ac.inhatc.cs.travelapp.ui.mypage;

import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import kr.ac.inhatc.cs.travelapp.R;
import kr.ac.inhatc.cs.travelapp.data.PreferenceHelper;
import kr.ac.inhatc.cs.travelapp.data.api.ApiClient;
import kr.ac.inhatc.cs.travelapp.data.api.AuthApi;
import kr.ac.inhatc.cs.travelapp.data.model.ApiResponse;
import kr.ac.inhatc.cs.travelapp.data.model.UserUpdateRequest;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class UserEditActivity extends AppCompatActivity {

    private EditText editNickname, editCurrentPw, editNewPw, editNewPwConfirm; // ⭐️ 변수 추가
    private Button btnSave;
    private PreferenceHelper preferenceHelper;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_user_edit);

        preferenceHelper = new PreferenceHelper(this);

        editNickname = findViewById(R.id.edit_nickname);
        editCurrentPw = findViewById(R.id.edit_current_password);
        editNewPw = findViewById(R.id.edit_new_password);
        editNewPwConfirm = findViewById(R.id.edit_new_password_confirm); // ⭐️ 뷰 연결
        btnSave = findViewById(R.id.btn_save);

        String currentNickname = getIntent().getStringExtra("nickname");
        if (currentNickname != null) {
            editNickname.setText(currentNickname);
        }

        btnSave.setOnClickListener(v -> updateUserInfo());
    }

    private void updateUserInfo() {
        String nickname = editNickname.getText().toString().trim();
        String currentPw = editCurrentPw.getText().toString().trim();
        String newPw = editNewPw.getText().toString().trim();
        String newPwConfirm = editNewPwConfirm.getText().toString().trim(); // ⭐️ 확인 값

        if (nickname.isEmpty()) {
            Toast.makeText(this, "닉네임을 입력해주세요.", Toast.LENGTH_SHORT).show();
            return;
        }
        if (currentPw.isEmpty()) {
            Toast.makeText(this, "현재 비밀번호를 입력해주세요.", Toast.LENGTH_SHORT).show();
            return;
        }

        // ⭐️ 비밀번호 변경 시 확인 로직
        if (!newPw.isEmpty()) {
            if (newPw.length() < 6) {
                Toast.makeText(this, "새 비밀번호는 6자리 이상이어야 합니다.", Toast.LENGTH_SHORT).show();
                return;
            }
            if (!newPw.equals(newPwConfirm)) {
                Toast.makeText(this, "새 비밀번호가 일치하지 않습니다.", Toast.LENGTH_SHORT).show();
                return;
            }
        } else {
            // 새 비밀번호가 비어있으면 null (변경 안 함)
            newPw = null;
        }

        int userId = preferenceHelper.getUserId();
        AuthApi api = ApiClient.getClient(this).create(AuthApi.class);
        UserUpdateRequest request = new UserUpdateRequest(nickname, currentPw, newPw);

        api.updateUser(userId, request).enqueue(new Callback<ApiResponse<Void>>() {
            @Override
            public void onResponse(Call<ApiResponse<Void>> call, Response<ApiResponse<Void>> response) {
                if (response.isSuccessful()) {
                    // ⭐️ 변경된 닉네임 로컬 저장
                    preferenceHelper.saveNickname(nickname);

                    Toast.makeText(UserEditActivity.this, "정보가 수정되었습니다.", Toast.LENGTH_SHORT).show();
                    finish();
                } else {
                    Toast.makeText(UserEditActivity.this, "수정 실패: 현재 비밀번호를 확인하세요.", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Void>> call, Throwable t) {
                Toast.makeText(UserEditActivity.this, "네트워크 오류", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
