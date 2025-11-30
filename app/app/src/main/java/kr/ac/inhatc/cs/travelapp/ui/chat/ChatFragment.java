package kr.ac.inhatc.cs.travelapp.ui.chat;

import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.floatingactionbutton.FloatingActionButton;

import java.util.ArrayList;
import java.util.List;

import kr.ac.inhatc.cs.travelapp.R;
import kr.ac.inhatc.cs.travelapp.data.api.ApiClient;
import kr.ac.inhatc.cs.travelapp.data.api.ChatApi;
import kr.ac.inhatc.cs.travelapp.data.model.ApiResponse;
import kr.ac.inhatc.cs.travelapp.data.model.Chatroom;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ChatFragment extends Fragment {

    private RecyclerView recyclerChatrooms;
    private ChatroomAdapter adapter;
    private FloatingActionButton btnCreateChatroom;

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        View root = inflater.inflate(R.layout.fragment_chat, container, false);

        recyclerChatrooms = root.findViewById(R.id.recycler_chatrooms);
        btnCreateChatroom = root.findViewById(R.id.btn_create_chatroom);

        // 어댑터 설정
        adapter = new ChatroomAdapter(new ArrayList<>());
        recyclerChatrooms.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerChatrooms.setAdapter(adapter);

        // ⭐️ [수정됨] 채팅방 클릭 시 상세 화면으로 이동 (키 이름 변경)
        adapter.setOnItemClickListener(chatroom -> {
            Intent intent = new Intent(getContext(), ChatDetailActivity.class);

            // 키 이름을 "ROOM_ID"와 "ROOM_NAME"으로 수정
            intent.putExtra("ROOM_ID", chatroom.getChatroomId());
            intent.putExtra("ROOM_NAME", chatroom.getTitle());

            startActivity(intent);
        });

        btnCreateChatroom.setOnClickListener(v -> showCreateChatroomDialog());

        return root;
    }

    @Override
    public void onResume() {
        super.onResume();
        loadChatrooms(); // 화면 돌아올 때마다 목록 갱신
    }

    private void loadChatrooms() {
        ChatApi api = ApiClient.getClient(getContext()).create(ChatApi.class);
        api.getMyChatrooms().enqueue(new Callback<ApiResponse<List<Chatroom>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Chatroom>>> call, Response<ApiResponse<List<Chatroom>>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    adapter.setChatrooms(response.body().getData());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Chatroom>>> call, Throwable t) {
                Toast.makeText(getContext(), "채팅방 목록 로드 실패", Toast.LENGTH_SHORT).show();
            }
        });
    }

    // 방 만들기 다이얼로그
    private void showCreateChatroomDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(requireContext());

        // ⭐️ 커스텀 뷰 인플레이트
        View view = LayoutInflater.from(requireContext()).inflate(R.layout.dialog_create_chatroom, null);
        builder.setView(view);

        AlertDialog dialog = builder.create();

        // 배경 투명하게 (둥근 모서리 보이게 하기 위해)
        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawableResource(android.R.color.transparent);
        }

        // 뷰 찾기
        EditText editTitle = view.findViewById(R.id.edit_room_title);
        TextView btnCancel = view.findViewById(R.id.btn_cancel);
        TextView btnCreate = view.findViewById(R.id.btn_create);

        // 리스너 설정
        btnCancel.setOnClickListener(v -> dialog.dismiss());

        btnCreate.setOnClickListener(v -> {
            String title = editTitle.getText().toString().trim();
            if (!title.isEmpty()) {
                createChatroom(title); // 기존 생성 함수 호출
                dialog.dismiss();
            } else {
                Toast.makeText(requireContext(), "제목을 입력해주세요.", Toast.LENGTH_SHORT).show();
            }
        });

        dialog.show();
    }

    private void createChatroom(String title) {
        ChatApi api = ApiClient.getClient(getContext()).create(ChatApi.class);
        Chatroom newChatroom = new Chatroom(title);

        api.createChatroom(newChatroom).enqueue(new Callback<ApiResponse<Chatroom>>() {
            @Override
            public void onResponse(Call<ApiResponse<Chatroom>> call, Response<ApiResponse<Chatroom>> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(getContext(), "채팅방 생성 완료!", Toast.LENGTH_SHORT).show();
                    loadChatrooms(); // 목록 갱신
                } else {
                    Toast.makeText(getContext(), "생성 실패", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Chatroom>> call, Throwable t) {
                Toast.makeText(getContext(), "오류 발생", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
