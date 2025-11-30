package kr.ac.inhatc.cs.travelapp.ui.chat;

import android.app.Dialog;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.DialogFragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;
import kr.ac.inhatc.cs.travelapp.R;
import kr.ac.inhatc.cs.travelapp.data.api.ApiClient;
import kr.ac.inhatc.cs.travelapp.data.api.AuthApi;
import kr.ac.inhatc.cs.travelapp.data.model.ApiResponse;
import kr.ac.inhatc.cs.travelapp.data.model.User;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class UserSearchDialogFragment extends DialogFragment {

    private UserSelectedListener listener;
    private UserSearchResultAdapter adapter;
    private EditText editSearch;

    public interface UserSelectedListener {
        void onUserSelected(User user);
    }

    public void setOnUserSelectedListener(UserSelectedListener listener) {
        this.listener = listener;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.dialog_user_search, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        editSearch = view.findViewById(R.id.edit_search_nickname);
        Button btnSearch = view.findViewById(R.id.btn_search);
        Button btnCancel = view.findViewById(R.id.btn_cancel);
        RecyclerView recyclerView = view.findViewById(R.id.recycler_user_results);

        adapter = new UserSearchResultAdapter();

        // 아이템 클릭 리스너 설정
        adapter.setOnItemClickListener(user -> {
            if (listener != null) {
                listener.onUserSelected(user);
                dismiss(); // 선택 후 닫기
            }
        });

        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerView.setAdapter(adapter);

        btnSearch.setOnClickListener(v -> searchUsers());
        btnCancel.setOnClickListener(v -> dismiss());

        // ⭐️ [핵심] 다이얼로그 시작 시 전체 목록 로드
        searchUsers();
    }

    private void searchUsers() {
        String keyword = editSearch.getText().toString().trim();

        // ⭐️ 빈 키워드도 허용 (전체 목록 조회)

        AuthApi api = ApiClient.getClient(getContext()).create(AuthApi.class);
        api.searchUsers(keyword).enqueue(new Callback<ApiResponse<List<User>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<User>>> call, Response<ApiResponse<List<User>>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<User> result = response.body().getData();

                    if (result == null || result.isEmpty()) {
                        Toast.makeText(getContext(), "결과가 없습니다.", Toast.LENGTH_SHORT).show();
                    }

                    // 어댑터 갱신
                    if (adapter != null) {
                        adapter.setUsers(result);
                    }
                } else {
                    Toast.makeText(getContext(), "검색 실패", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<User>>> call, Throwable t) {
                Toast.makeText(getContext(), "네트워크 오류", Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public void onStart() {
        super.onStart();
        Dialog dialog = getDialog();
        if (dialog != null) {
            dialog.getWindow().setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        }
    }
}
