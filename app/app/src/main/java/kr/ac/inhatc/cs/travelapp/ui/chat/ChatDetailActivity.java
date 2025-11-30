package kr.ac.inhatc.cs.travelapp.ui.chat;

import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.view.MenuItem;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.List;
import kr.ac.inhatc.cs.travelapp.R;
import kr.ac.inhatc.cs.travelapp.data.PreferenceHelper;
import kr.ac.inhatc.cs.travelapp.data.SocketManager;
import kr.ac.inhatc.cs.travelapp.data.api.ApiClient;
import kr.ac.inhatc.cs.travelapp.data.api.ChatApi;
import kr.ac.inhatc.cs.travelapp.data.model.ApiResponse;
import kr.ac.inhatc.cs.travelapp.data.model.InviteRequest;
import kr.ac.inhatc.cs.travelapp.data.model.Message;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ChatDetailActivity extends AppCompatActivity {

    private static final String TAG = "ChatDetailActivity";
    private int roomId;
    private String roomName;
    private RecyclerView recyclerView;
    private EditText inputMessage;
    private Button btnSend, btnInvite;
    private ChatMessageAdapter adapter;
    private List<Message> messageList = new ArrayList<>();
    private PreferenceHelper preferenceHelper;
    private SocketManager socketManager;
    private int currentUserId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chat_detail);

        roomId = getIntent().getIntExtra("ROOM_ID", -1);
        roomName = getIntent().getStringExtra("ROOM_NAME");

        if (roomId == -1) {
            Toast.makeText(this, "잘못된 접근입니다.", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        preferenceHelper = new PreferenceHelper(this);
        currentUserId = preferenceHelper.getUserId();

        // ⭐️ [수정됨] SocketManager.getInstance(Context) 호출
        socketManager = SocketManager.getInstance(getApplicationContext());

        initViews();
        setupRecyclerView();
        setupSocket();
        loadMessages();
    }

    private void initViews() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(roomName);
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }

        recyclerView = findViewById(R.id.recycler_messages);
        inputMessage = findViewById(R.id.edit_message);
        btnSend = findViewById(R.id.btn_send);
        btnInvite = findViewById(R.id.btn_invite);

        btnSend.setOnClickListener(v -> sendMessage());
        btnInvite.setOnClickListener(v -> showInviteDialog());
    }

    private void setupRecyclerView() {
        // ⭐️ [수정됨] 생성자 인자 2개 (List, int)로 맞춤. ('this' 제거)
        adapter = new ChatMessageAdapter(messageList, currentUserId);

        LinearLayoutManager layoutManager = new LinearLayoutManager(this);
        layoutManager.setStackFromEnd(true);
        recyclerView.setLayoutManager(layoutManager);
        recyclerView.setAdapter(adapter);
    }

    private void setupSocket() {
        // ⭐️ [수정됨] connect(String token) 호출
        if (!socketManager.isConnected()) {
            socketManager.connect(preferenceHelper.getAccessToken());
        }

        // ⭐️ [수정됨] SocketManager에 추가한 리스너 메서드 호출
        socketManager.setOnMessageReceivedListener(args -> {
            try {
                JSONObject json = (JSONObject) args[0];
                Message msg = new Message();
                msg.setMessageId(json.optInt("id"));
                msg.setContent(json.optString("content"));

                // ⭐️ Message.java에 추가한 setter 사용
                msg.setCreatedAt(json.optString("createdAt"));

                JSONObject sender = json.optJSONObject("sender");
                if (sender != null) {
                    msg.setUserId(sender.optInt("id"));
                    msg.setNickname(sender.optString("nickname"));
                }

                runOnUiThread(() -> {
                    adapter.addMessage(msg);
                    recyclerView.smoothScrollToPosition(adapter.getItemCount() - 1);
                });
            } catch (Exception e) {
                Log.e(TAG, "Socket Error", e);
            }
        });

        // ⭐️ [수정됨] SocketManager에 추가한 joinRoom 호출
        socketManager.joinRoom(roomId);
    }

    private void loadMessages() {
        ChatApi chatApi = ApiClient.getClient(this).create(ChatApi.class);
        chatApi.getMessages(roomId).enqueue(new Callback<ApiResponse<List<Message>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Message>>> call, Response<ApiResponse<List<Message>>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<Message> messages = response.body().getData();
                    if (messages != null) {
                        messageList.clear();
                        messageList.addAll(messages);
                        adapter.notifyDataSetChanged();
                        if (!messageList.isEmpty()) {
                            recyclerView.scrollToPosition(messageList.size() - 1);
                        }
                    }
                }
            }
            @Override
            public void onFailure(Call<ApiResponse<List<Message>>> call, Throwable t) {
                Toast.makeText(ChatDetailActivity.this, "메시지 로드 실패", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void sendMessage() {
        String content = inputMessage.getText().toString().trim();
        if (TextUtils.isEmpty(content)) return;
        inputMessage.setText("");

        // ⭐️ [수정됨] SocketManager에 추가한 sendMessage 호출
        socketManager.sendMessage(roomId, content);
    }

    private void showInviteDialog() {
        UserSearchDialogFragment dialog = new UserSearchDialogFragment();
        dialog.setOnUserSelectedListener(user -> inviteUser(user.getNickname()));
        dialog.show(getSupportFragmentManager(), "UserSearchDialog");
    }

    private void inviteUser(String nickname) {
        ChatApi chatApi = ApiClient.getClient(this).create(ChatApi.class);
        InviteRequest request = new InviteRequest(nickname);

        // ⭐️ [수정됨] Callback 타입을 <Void>로 맞춤
        chatApi.inviteUser(roomId, request).enqueue(new Callback<ApiResponse<Void>>() {
            @Override
            public void onResponse(Call<ApiResponse<Void>> call, Response<ApiResponse<Void>> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(ChatDetailActivity.this, "초대 성공", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(ChatDetailActivity.this, "초대 실패", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<ApiResponse<Void>> call, Throwable t) {
                Toast.makeText(ChatDetailActivity.this, "오류 발생", Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            finish();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        // 리스너 해제 (필요 시 구현)
        if (socketManager != null) {
            socketManager.setOnMessageReceivedListener(null);
        }
    }
}
