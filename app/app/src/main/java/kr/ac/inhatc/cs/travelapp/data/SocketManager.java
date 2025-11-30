package kr.ac.inhatc.cs.travelapp.data;

import android.content.Context;
import android.util.Log;
import org.json.JSONException;
import org.json.JSONObject;
import java.net.URISyntaxException;
import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;

public class SocketManager {
    private static final String TAG = "SocketManager";
    private static SocketManager instance;
    private Socket mSocket;

    // ⭐️ 에뮬레이터 테스트 시 10.0.2.2 사용 (실기기는 PC IP 사용)
    private static final String SERVER_URL = "http://10.0.2.2:3000";

    // ⭐️ [수정] Context를 인자로 받도록 변경됨
    public static synchronized SocketManager getInstance(Context context) {
        if (instance == null) {
            instance = new SocketManager();
        }
        return instance;
    }

    private SocketManager() {
        try {
            mSocket = IO.socket(SERVER_URL);
        } catch (URISyntaxException e) {
            Log.e(TAG, "Socket URI Error", e);
        }
    }

    // ⭐️ [추가] 토큰을 받는 connect 메서드
    public void connect(String token) {
        if (mSocket != null && !mSocket.connected()) {
            IO.Options options = new IO.Options();
            if (token != null) {
                options.query = "token=" + token;
            }
            try {
                mSocket = IO.socket(SERVER_URL, options);
                mSocket.connect();
            } catch (URISyntaxException e) {
                e.printStackTrace();
            }
        }
    }

    public boolean isConnected() {
        return mSocket != null && mSocket.connected();
    }

    // ⭐️ [추가] 방 입장 메서드
    public void joinRoom(int roomId) {
        if (isConnected()) {
            mSocket.emit("joinRoom", roomId);
        }
    }

    // ⭐️ [추가] 메시지 전송 메서드
    public void sendMessage(int roomId, String content) {
        if (isConnected()) {
            JSONObject data = new JSONObject();
            try {
                data.put("roomId", roomId);
                data.put("content", content);
                mSocket.emit("sendMessage", data);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
    }

    // ⭐️ [추가] 리스너 등록 메서드
    public void setOnMessageReceivedListener(Emitter.Listener listener) {
        if (mSocket != null) {
            mSocket.off("newMessage"); // 중복 방지
            if (listener != null) {
                mSocket.on("newMessage", listener);
            }
        }
    }

    public void disconnect() {
        if (mSocket != null) {
            mSocket.disconnect();
        }
    }
}
