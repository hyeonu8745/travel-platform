package kr.ac.inhatc.cs.travelapp.ui.home;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.cardview.widget.CardView; // ⭐️ 추가
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager; // ⭐️ 추가
import androidx.recyclerview.widget.RecyclerView; // ⭐️ 추가

import java.util.List; // ⭐️ 추가

import kr.ac.inhatc.cs.travelapp.MainActivity; // ⭐️ MainActivity import
import kr.ac.inhatc.cs.travelapp.R;
import kr.ac.inhatc.cs.travelapp.data.api.ApiClient;
import kr.ac.inhatc.cs.travelapp.data.api.AuthApi;
import kr.ac.inhatc.cs.travelapp.data.api.BoardApi; // ⭐️ 추가
import kr.ac.inhatc.cs.travelapp.data.model.ApiResponse;
import kr.ac.inhatc.cs.travelapp.data.model.Post; // ⭐️ 추가
import kr.ac.inhatc.cs.travelapp.data.model.User;
import kr.ac.inhatc.cs.travelapp.ui.board.PostAdapter; // ⭐️ 추가
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class HomeFragment extends Fragment {

    private TextView textWelcome;
    private CardView btnTrip, btnCommunity; // ⭐️ 버튼 추가
    private RecyclerView recyclerPopular; // ⭐️ 리스트 추가
    private PostAdapter popularAdapter;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_home, container, false);

        // 1. 뷰 연결
        textWelcome = view.findViewById(R.id.text_welcome);
        btnTrip = view.findViewById(R.id.btn_trip); // id 확인 필요
        btnCommunity = view.findViewById(R.id.btn_community); // id 확인 필요
        recyclerPopular = view.findViewById(R.id.recycler_popular); // id 확인 필요

        // 2. 닉네임 로딩
        loadUserProfile();

        // 3. 버튼 클릭 이벤트 (MainActivity 탭 이동)
        btnTrip.setOnClickListener(v -> {
            if (getActivity() instanceof MainActivity) {
                // ⭐️ 여기를 R.id.nav_trip으로 바꿔주세요! (이전에 nav_board로 되어 있었음)
                ((MainActivity) getActivity()).moveToTab(R.id.nav_trip);
            }
        });

        btnCommunity.setOnClickListener(v -> {
            if (getActivity() instanceof MainActivity) {
                ((MainActivity) getActivity()).moveToTab(R.id.nav_board); // 게시판 탭으로 이동
            }
        });

        // 4. 인기글 리스트 설정
        recyclerPopular.setLayoutManager(new LinearLayoutManager(getContext()));
        popularAdapter = new PostAdapter();


        recyclerPopular.setAdapter(popularAdapter);

        loadPopularPosts();

        return view;
    }

    private void loadUserProfile() {
        AuthApi authApi = ApiClient.getClient(getContext()).create(AuthApi.class);
        authApi.getProfile().enqueue(new Callback<ApiResponse<User>>() {
            @Override
            public void onResponse(Call<ApiResponse<User>> call, Response<ApiResponse<User>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    String nickname = response.body().getData().getNickname();
                    textWelcome.setText(nickname + "님,\n여행을 떠나보세요!");
                } else {
                    textWelcome.setText("게스트님,\n로그인이 필요해요.");
                }
            }
            @Override
            public void onFailure(Call<ApiResponse<User>> call, Throwable t) {
                textWelcome.setText("네트워크 오류가 발생했어요.");
            }
        });
    }

    // ⭐️ 인기글(최신글 5개) 로딩
    private void loadPopularPosts() {
        BoardApi api = ApiClient.getClient(getContext()).create(BoardApi.class);
        // 파라미터: boardId=null(전체), page=1, limit=5, search=null
        api.getPosts(null, 1, 5, null).enqueue(new Callback<ApiResponse<List<Post>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Post>>> call, Response<ApiResponse<List<Post>>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    popularAdapter.setPosts(response.body().getData());
                }
            }
            @Override
            public void onFailure(Call<ApiResponse<List<Post>>> call, Throwable t) {}
        });
    }
}
