package kr.ac.inhatc.cs.travelapp.ui.chat;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;
import kr.ac.inhatc.cs.travelapp.R;
import kr.ac.inhatc.cs.travelapp.data.model.Message;

public class ChatMessageAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> {

    private static final int VIEW_TYPE_MY_MESSAGE = 1;
    private static final int VIEW_TYPE_OTHER_MESSAGE = 2;

    private List<Message> messageList;
    private int currentUserId;

    public ChatMessageAdapter(List<Message> messageList, int currentUserId) {
        this.messageList = messageList;
        this.currentUserId = currentUserId;
    }

    public void addMessage(Message message) {
        messageList.add(message);
        notifyItemInserted(messageList.size() - 1);
    }

    @Override
    public int getItemViewType(int position) {
        Message message = messageList.get(position);
        return (message.getUserId() == currentUserId) ? VIEW_TYPE_MY_MESSAGE : VIEW_TYPE_OTHER_MESSAGE;
    }

    @NonNull
    @Override
    public RecyclerView.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        if (viewType == VIEW_TYPE_MY_MESSAGE) {
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_message_me, parent, false);
            return new MyMessageViewHolder(view);
        } else {
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_message_other, parent, false);
            return new OtherMessageViewHolder(view);
        }
    }

    @Override
    public void onBindViewHolder(@NonNull RecyclerView.ViewHolder holder, int position) {
        Message message = messageList.get(position);
        if (holder instanceof MyMessageViewHolder) {
            ((MyMessageViewHolder) holder).bind(message);
        } else if (holder instanceof OtherMessageViewHolder) {
            ((OtherMessageViewHolder) holder).bind(message);
        }
    }

    @Override
    public int getItemCount() {
        return messageList.size();
    }

    // ⭐️ [핵심] 시간 포맷팅 메서드
    private static String formatTime(String rawTime) {
        if (rawTime == null || rawTime.isEmpty()) return "";

        try {
            // 1. 서버 시간 파싱 (UTC 기준 ISO 8601 포맷 가정)
            // 예: 2025-11-30T09:20:00.000Z -> .000Z가 있거나 없을 수 있음
            SimpleDateFormat inputFormat;
            if (rawTime.length() > 19) {
                inputFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault());
            } else {
                inputFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault());
            }
            inputFormat.setTimeZone(TimeZone.getTimeZone("UTC")); // 서버가 UTC라면

            Date date = inputFormat.parse(rawTime);

            // 2. 한국 시간 오전/오후 포맷으로 변환
            SimpleDateFormat outputFormat = new SimpleDateFormat("a h:mm", Locale.KOREA);
            outputFormat.setTimeZone(TimeZone.getTimeZone("Asia/Seoul"));

            return outputFormat.format(date);

        } catch (Exception e) {
            // 파싱 실패 시 원본 반환하거나 현재 시간 표시
            return rawTime.length() > 5 ? rawTime.substring(11, 16) : rawTime;
        }
    }

    // 내 메시지 뷰홀더
    static class MyMessageViewHolder extends RecyclerView.ViewHolder {
        TextView textMessage, textTime;

        MyMessageViewHolder(View itemView) {
            super(itemView);
            textMessage = itemView.findViewById(R.id.text_message_body);
            textTime = itemView.findViewById(R.id.text_message_time);
        }

        void bind(Message message) {
            textMessage.setText(message.getContent());
            if (textTime != null) textTime.setText(formatTime(message.getCreatedAt()));
        }
    }

    // 상대방 메시지 뷰홀더
    static class OtherMessageViewHolder extends RecyclerView.ViewHolder {
        TextView textMessage, textName, textTime;

        OtherMessageViewHolder(View itemView) {
            super(itemView);
            textMessage = itemView.findViewById(R.id.text_message_body);
            textName = itemView.findViewById(R.id.text_message_name);
            textTime = itemView.findViewById(R.id.text_message_time);
        }

        void bind(Message message) {
            textMessage.setText(message.getContent());
            if (textName != null) textName.setText(message.getNickname());
            if (textTime != null) textTime.setText(formatTime(message.getCreatedAt()));
        }
    }
}
