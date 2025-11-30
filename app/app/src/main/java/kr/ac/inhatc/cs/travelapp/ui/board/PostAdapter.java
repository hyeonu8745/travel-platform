package kr.ac.inhatc.cs.travelapp.ui.board;

import android.content.Context;
import android.content.Intent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;

import kr.ac.inhatc.cs.travelapp.R;
import kr.ac.inhatc.cs.travelapp.data.model.Post;

public class PostAdapter extends RecyclerView.Adapter<PostAdapter.PostViewHolder> {

    private List<Post> postList = new ArrayList<>();

    public void setPosts(List<Post> posts) {
        this.postList = posts;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public PostViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_post, parent, false);
        return new PostViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull PostViewHolder holder, int position) {
        Post post = postList.get(position);
        holder.bind(post);

        // 상세 화면 이동
        holder.itemView.setOnClickListener(v -> {
            Context context = v.getContext();
            Intent intent = new Intent(context, PostDetailActivity.class);

            // ID와 기본 정보 넘기기
            intent.putExtra("postId", post.getPostId());
            intent.putExtra("title", post.getTitle());
            intent.putExtra("nickname", post.getNickname());
            intent.putExtra("date", post.getCreatedAt());
            // 상세 화면에서 조회수 +1 된 걸 다시 불러오겠지만, 일단 현재 값도 넘길 수는 있음

            context.startActivity(intent);
        });
    }

    @Override
    public int getItemCount() {
        return postList.size();
    }

    static class PostViewHolder extends RecyclerView.ViewHolder {
        TextView title, nickname, date, commentCount, viewCount;

        public PostViewHolder(@NonNull View itemView) {
            super(itemView);
            title = itemView.findViewById(R.id.item_title);
            nickname = itemView.findViewById(R.id.item_nickname);
            date = itemView.findViewById(R.id.item_date);
            commentCount = itemView.findViewById(R.id.item_comment_count);
            viewCount = itemView.findViewById(R.id.item_view_count); // 조회수 연결
        }

        public void bind(Post post) {
            // 1. 제목
            title.setText(post.getTitle());

            // 2. 닉네임 (익명 처리)
            if (post.getNickname() != null && !post.getNickname().isEmpty()) {
                nickname.setText(post.getNickname());
            } else {
                nickname.setText("익명");
            }

            // 3. 날짜 (YYYY-MM-DD)
            String rawDate = post.getCreatedAt();
            if (rawDate != null && rawDate.length() >= 10) {
                date.setText(rawDate.substring(0, 10));
            } else {
                date.setText(rawDate);
            }

            // 4. 조회수
            if (viewCount != null) {
                viewCount.setText("조회 " + post.getViewCount());
            }

            // ⭐️ 댓글 수 설정
            if (commentCount != null) {
                commentCount.setText(String.valueOf(post.getCommentCount()));
            }
        }
    }
}
