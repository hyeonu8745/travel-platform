package kr.ac.inhatc.cs.travelapp.ui.mypage;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.text.InputType;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import kr.ac.inhatc.cs.travelapp.R;
import kr.ac.inhatc.cs.travelapp.data.PreferenceHelper;
import kr.ac.inhatc.cs.travelapp.data.api.ApiClient;
import kr.ac.inhatc.cs.travelapp.data.api.AuthApi;
import kr.ac.inhatc.cs.travelapp.data.model.ApiResponse;
import kr.ac.inhatc.cs.travelapp.data.model.UserDeleteRequest;
import kr.ac.inhatc.cs.travelapp.ui.login.LoginActivity;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MyPageFragment extends Fragment {

    private TextView textNickname, textEmail;
    private Button btnLogout, btnEditProfile;

    private TextView btnDeleteAccount;
    private ImageView imgProfile;
    private FrameLayout layoutProfileImage;
    private PreferenceHelper preferenceHelper;

    private ActivityResultLauncher<Intent> galleryLauncher;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_my_page, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        // 뷰 초기화
        textNickname = view.findViewById(R.id.text_nickname);
        textEmail = view.findViewById(R.id.text_email);
        btnLogout = view.findViewById(R.id.btn_logout);
        btnEditProfile = view.findViewById(R.id.btn_edit_profile);
        btnDeleteAccount = view.findViewById(R.id.btn_delete_account);
        imgProfile = view.findViewById(R.id.img_profile);
        layoutProfileImage = view.findViewById(R.id.layout_profile_image);

        preferenceHelper = new PreferenceHelper(requireContext());

        // 사용자 정보 표시
        displayUserInfo();

        // 갤러리 런처 초기화
        galleryLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
                        Uri selectedImageUri = result.getData().getData();
                        if (selectedImageUri != null) {
                            imgProfile.setImageURI(selectedImageUri);
                            // TODO: 서버에 이미지 업로드 API 호출 구현 필요
                        }
                    }
                }
        );

        // --- 리스너 설정 ---

        // 프로필 이미지 클릭
        layoutProfileImage.setOnClickListener(v -> openGallery());

        // 정보 수정 버튼 클릭
        btnEditProfile.setOnClickListener(v -> {
            Intent intent = new Intent(requireContext(), UserEditActivity.class);
            intent.putExtra("nickname", preferenceHelper.getString("nickname"));
            startActivity(intent);
        });

        // 로그아웃 버튼 클릭
        btnLogout.setOnClickListener(v -> {
            preferenceHelper.clear();
            Toast.makeText(requireContext(), "로그아웃 되었습니다.", Toast.LENGTH_SHORT).show();
            Intent intent = new Intent(requireContext(), LoginActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
        });

        // 회원 탈퇴 버튼 클릭
        btnDeleteAccount.setOnClickListener(v -> showDeleteAccountDialog());
    }

    private void openGallery() {
        Intent intent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        galleryLauncher.launch(intent);
    }

    @Override
    public void onResume() {
        super.onResume();
        displayUserInfo();
    }

    private void displayUserInfo() {
        textNickname.setText(preferenceHelper.getString("nickname"));
        textEmail.setText(preferenceHelper.getString("email"));
        // TODO: 프로필 이미지 URL이 있다면 Glide/Picasso 라이브러리로 로드
    }

    private void showDeleteAccountDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(requireContext());
        builder.setTitle("회원 탈퇴");
        builder.setMessage("정말로 탈퇴하시겠습니까? 탈퇴 시 모든 정보가 영구적으로 삭제됩니다. 계속하려면 비밀번호를 입력하세요.");

        final EditText inputPassword = new EditText(requireContext());
        inputPassword.setHint("비밀번호 확인");
        inputPassword.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);

        FrameLayout container = new FrameLayout(requireContext());
        FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        params.leftMargin = 50;
        params.rightMargin = 50;
        inputPassword.setLayoutParams(params);
        container.addView(inputPassword);
        builder.setView(container);

        builder.setPositiveButton("탈퇴", (dialog, which) -> {
            String password = inputPassword.getText().toString();
            if (!password.isEmpty()) {
                performDeleteAccount(password);
            } else {
                Toast.makeText(requireContext(), "비밀번호를 입력해주세요.", Toast.LENGTH_SHORT).show();
            }
        });
        builder.setNegativeButton("취소", null);

        AlertDialog dialog = builder.create();
        dialog.show();
        dialog.getButton(AlertDialog.BUTTON_POSITIVE).setTextColor(Color.RED);
    }

    private void performDeleteAccount(String password) {
        int userId = preferenceHelper.getUserId();
        AuthApi api = ApiClient.getClient(requireContext()).create(AuthApi.class);
        UserDeleteRequest request = new UserDeleteRequest(password);

        api.deleteUser(userId, request).enqueue(new Callback<ApiResponse<Void>>() {
            @Override
            public void onResponse(Call<ApiResponse<Void>> call, Response<ApiResponse<Void>> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(requireContext(), "회원 탈퇴가 완료되었습니다.", Toast.LENGTH_SHORT).show();
                    preferenceHelper.clear();

                    Intent intent = new Intent(requireContext(), LoginActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    startActivity(intent);
                } else {
                    Toast.makeText(requireContext(), "탈퇴 실패: 비밀번호를 확인해주세요.", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Void>> call, Throwable t) {
                Toast.makeText(requireContext(), "네트워크 오류가 발생했습니다.", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
