package kr.ac.inhatc.cs.travelapp.ui.chat;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.ArrayList;
import java.util.List;
import kr.ac.inhatc.cs.travelapp.R;
import kr.ac.inhatc.cs.travelapp.data.model.User;

public class UserSearchResultAdapter extends RecyclerView.Adapter<UserSearchResultAdapter.ViewHolder> {

    private List<User> userList = new ArrayList<>();
    private OnItemClickListener listener;

    public interface OnItemClickListener {
        void onItemClick(User user);
    }

    public void setOnItemClickListener(OnItemClickListener listener) {
        this.listener = listener;
    }

    // ⭐️ 데이터 갱신 메서드
    public void setUsers(List<User> users) {
        this.userList = users;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        // item_user_search_result.xml 레이아웃 사용
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_user_search_result, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        User user = userList.get(position);
        holder.bind(user, listener);
    }

    @Override
    public int getItemCount() {
        return userList != null ? userList.size() : 0;
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvNickname;
        TextView tvEmail;

        ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvNickname = itemView.findViewById(R.id.text_user_nickname);
            tvEmail = itemView.findViewById(R.id.text_user_email);
        }

        void bind(User user, OnItemClickListener listener) {
            tvNickname.setText(user.getNickname());
            tvEmail.setText(user.getEmail());

            itemView.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onItemClick(user);
                }
            });
        }
    }
}
