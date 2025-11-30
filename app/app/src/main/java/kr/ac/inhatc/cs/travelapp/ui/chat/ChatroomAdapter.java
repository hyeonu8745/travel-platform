package kr.ac.inhatc.cs.travelapp.ui.chat;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

import kr.ac.inhatc.cs.travelapp.R;
import kr.ac.inhatc.cs.travelapp.data.model.Chatroom;

public class ChatroomAdapter extends RecyclerView.Adapter<ChatroomAdapter.ViewHolder> {

    private List<Chatroom> chatrooms;
    private OnItemClickListener listener;

    public interface OnItemClickListener {
        void onItemClick(Chatroom chatroom);
    }

    public void setOnItemClickListener(OnItemClickListener listener) {
        this.listener = listener;
    }

    public ChatroomAdapter(List<Chatroom> chatrooms) {
        this.chatrooms = chatrooms;
    }

    public void setChatrooms(List<Chatroom> chatrooms) {
        this.chatrooms = chatrooms;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_chatroom, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Chatroom chatroom = chatrooms.get(position);
        holder.bind(chatroom);
    }

    @Override
    public int getItemCount() {
        return chatrooms.size();
    }

    class ViewHolder extends RecyclerView.ViewHolder {
        TextView textTitle;
        Button btnEnter;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            textTitle = itemView.findViewById(R.id.text_chatroom_title);
            btnEnter = itemView.findViewById(R.id.btn_enter);

            // 아이템 클릭
            itemView.setOnClickListener(v -> {
                if (listener != null && getAdapterPosition() != RecyclerView.NO_POSITION) {
                    listener.onItemClick(chatrooms.get(getAdapterPosition()));
                }
            });

            // 입장 버튼 클릭 (아이템 클릭과 동일 동작)
            btnEnter.setOnClickListener(v -> {
                if (listener != null && getAdapterPosition() != RecyclerView.NO_POSITION) {
                    listener.onItemClick(chatrooms.get(getAdapterPosition()));
                }
            });
        }

        public void bind(Chatroom chatroom) {
            // Chatroom.java에서 @SerializedName("room_name")을 안 붙이면
            // 여기서 getTitle()이 null이 되어 글씨가 안 보입니다.
            textTitle.setText(chatroom.getTitle());
        }
    }
}
