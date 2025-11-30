package kr.ac.inhatc.cs.travelapp.ui.board;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.tabs.TabLayout;

import java.util.List;

import kr.ac.inhatc.cs.travelapp.R;
import kr.ac.inhatc.cs.travelapp.data.api.ApiClient;
import kr.ac.inhatc.cs.travelapp.data.api.BoardApi;
import kr.ac.inhatc.cs.travelapp.data.model.ApiResponse;
import kr.ac.inhatc.cs.travelapp.data.model.Post;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class BoardFragment extends Fragment {

    private RecyclerView recyclerView;
    private PostAdapter adapter;
    private ProgressBar progressBar;
    private TabLayout tabLayout;

    // 현재 선택된 게시판 ID (기본: 전체=0 또는 null)
    private Integer currentBoardId = null;

    private EditText editSearch; // 추가
    private Button btnSearch;    // 추가
    private String currentSearchQuery = null; // 검색어 저장


    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_board, container, false);

        // 1. 뷰 초기화
        recyclerView = view.findViewById(R.id.recycler_view);
        progressBar = view.findViewById(R.id.progress_bar);
        tabLayout = view.findViewById(R.id.tab_layout);
        FloatingActionButton fab = view.findViewById(R.id.fab_write);
        editSearch = view.findViewById(R.id.edit_search);
        btnSearch = view.findViewById(R.id.btn_search);

        // 2. 리스트 설정
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        adapter = new PostAdapter();
        recyclerView.setAdapter(adapter);

        // 3. 탭 설정 (순서 중요: 전체=0, 자유=1, 후기=2, 질답=3 가정)
        tabLayout.addTab(tabLayout.newTab().setText("전체"));
        tabLayout.addTab(tabLayout.newTab().setText("자유 게시판"));
        tabLayout.addTab(tabLayout.newTab().setText("여행 후기"));
        tabLayout.addTab(tabLayout.newTab().setText("질문과 답변"));

        // 4. 탭 리스너
        tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                int position = tab.getPosition();
                if (position == 0) {
                    currentBoardId = null; // 전체
                } else {
                    currentBoardId = position; // 1, 2, 3
                }
                currentSearchQuery = null;
                editSearch.setText("");
                loadPosts(currentBoardId);
            }

            @Override
            public void onTabUnselected(TabLayout.Tab tab) {}
            @Override
            public void onTabReselected(TabLayout.Tab tab) {}
        });

        // 5. 글쓰기 버튼
        fab.setOnClickListener(v -> {
            Intent intent = new Intent(getContext(), PostWriteActivity.class);
            startActivity(intent);
        });

        // ⭐️ 검색 버튼 클릭 리스너
        btnSearch.setOnClickListener(v -> {
            String keyword = editSearch.getText().toString().trim();
            currentSearchQuery = keyword.isEmpty() ? null : keyword;
            loadPosts(currentBoardId); // 현재 탭 유지하면서 검색
        });

        return view;
    }

    @Override
    public void onResume() {
        super.onResume();
        // 화면 돌아올 때 갱신 (글쓰고 왔을 때 반영되게)
        loadPosts(currentBoardId);
    }

    private void loadPosts(Integer boardId) {
        progressBar.setVisibility(View.VISIBLE);
        BoardApi boardApi = ApiClient.getClient(getContext()).create(BoardApi.class);

        android.util.Log.d("SEARCH_DEBUG", "검색어 확인: " + currentSearchQuery);

        // ⭐️ 검색어(currentSearchQuery)도 같이 전달
        // (API 인터페이스에 search_query 파라미터가 추가되어 있어야 함)
        // getPosts(boardId, page, limit, searchQuery)
        boardApi.getPosts(boardId, 1, 10, currentSearchQuery).enqueue(new Callback<ApiResponse<List<Post>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Post>>> call, Response<ApiResponse<List<Post>>> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    List<Post> posts = response.body().getData();
                    adapter.setPosts(posts);

                    if(posts.isEmpty()) {
                        // 검색 결과 없음 메시지 (선택사항)
                        // Toast.makeText(getContext(), "결과가 없습니다.", Toast.LENGTH_SHORT).show();
                    }
                } else {
                    Toast.makeText(getContext(), "불러오기 실패", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Post>>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(getContext(), "오류: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
