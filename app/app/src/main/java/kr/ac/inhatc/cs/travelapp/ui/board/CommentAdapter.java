package kr.ac.inhatc.cs.travelapp.ui.board;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;

import kr.ac.inhatc.cs.travelapp.R;
import kr.ac.inhatc.cs.travelapp.data.model.Comment;

public class CommentAdapter extends RecyclerView.Adapter<CommentAdapter.CommentViewHolder> {

    private List<Comment> commentList = new ArrayList<>();
    private int myUserId = -1; // 내 ID
    private OnCommentDeleteListener deleteListener; // 삭제 리스너

    // ⭐️ 내 ID 설정
    public void setMyUserId(int userId) {
        this.myUserId = userId;
    }

    // ⭐️ 리스너 설정
    public void setOnCommentDeleteListener(OnCommentDeleteListener listener) {
        this.deleteListener = listener;
    }

    public interface OnCommentDeleteListener {
        void onDelete(int commentId);
    }

    public void setComments(List<Comment> comments) {
        this.commentList = comments;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public CommentViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_comment, parent, false);
        return new CommentViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull CommentViewHolder holder, int position) {
        Comment comment = commentList.get(position);
        holder.bind(comment, myUserId, deleteListener);
    }

    @Override
    public int getItemCount() {
        return commentList.size();
    }

    static class CommentViewHolder extends RecyclerView.ViewHolder {
        TextView nickname, content, date, btnDelete;

        public CommentViewHolder(@NonNull View itemView) {
            super(itemView);
            nickname = itemView.findViewById(R.id.comment_nickname);
            content = itemView.findViewById(R.id.comment_content);
            date = itemView.findViewById(R.id.comment_date);
            btnDelete = itemView.findViewById(R.id.btn_delete_comment); // ⭐️ 삭제 버튼
        }

        public void bind(Comment comment, int myUserId, OnCommentDeleteListener listener) {
            nickname.setText(comment.getNickname());
            content.setText(comment.getContent());

            // 날짜 처리
            if(comment.getCreatedAt() != null && comment.getCreatedAt().length() >= 10) {
                date.setText(comment.getCreatedAt().substring(0, 10));
            } else {
                date.setText(comment.getCreatedAt());
            }

            // ⭐️ 내 댓글일 때만 삭제 버튼 보이기
            if (myUserId != -1 && comment.getUserId() == myUserId) {
                btnDelete.setVisibility(View.VISIBLE);
                btnDelete.setOnClickListener(v -> {
                    if (listener != null) {
                        listener.onDelete(comment.getCommentId());
                    }
                });
            } else {
                btnDelete.setVisibility(View.GONE);
            }
        }
    }
}
