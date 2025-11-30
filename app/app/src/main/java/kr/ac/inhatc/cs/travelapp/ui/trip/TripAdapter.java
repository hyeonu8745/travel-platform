package kr.ac.inhatc.cs.travelapp.ui.trip;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.bumptech.glide.Glide;
import java.util.ArrayList;
import java.util.List;
import kr.ac.inhatc.cs.travelapp.R;
import kr.ac.inhatc.cs.travelapp.data.model.Trip;

public class TripAdapter extends RecyclerView.Adapter<TripAdapter.TripViewHolder> {

    private List<Trip> tripList = new ArrayList<>();
    private OnItemClickListener listener;

    // ⭐️ 서버 주소 (상황에 맞게 수정 필요)
    private static final String SERVER_URL = "http://10.0.2.2:3000";

    public interface OnItemClickListener {
        void onItemClick(int tripId);
    }

    public void setOnItemClickListener(OnItemClickListener listener) {
        this.listener = listener;
    }

    public void setTrips(List<Trip> trips) {
        this.tripList = trips;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public TripViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_trip, parent, false);
        return new TripViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull TripViewHolder holder, int position) {
        Trip trip = tripList.get(position);
        holder.bind(trip);
    }

    @Override
    public int getItemCount() {
        return tripList.size();
    }

    class TripViewHolder extends RecyclerView.ViewHolder {
        TextView title, date, author, viewCount;
        ImageView imageThumbnail;
        TextView placeholderIcon; // ⭐️ 비행기 아이콘

        public TripViewHolder(@NonNull View itemView) {
            super(itemView);
            title = itemView.findViewById(R.id.text_title);
            date = itemView.findViewById(R.id.text_date);
            author = itemView.findViewById(R.id.text_author);
            viewCount = itemView.findViewById(R.id.text_view_count);
            imageThumbnail = itemView.findViewById(R.id.image_thumbnail);
            placeholderIcon = itemView.findViewById(R.id.text_placeholder_icon); // 레이아웃 ID 확인

            itemView.setOnClickListener(v -> {
                if (listener != null && getAdapterPosition() != RecyclerView.NO_POSITION) {
                    listener.onItemClick(tripList.get(getAdapterPosition()).getTripId());
                }
            });
        }

        public void bind(Trip trip) {
            title.setText(trip.getTitle());
            date.setText(trip.getStartDate() + " ~ " + trip.getEndDate());

            if (trip.getAuthor() != null) {
                author.setText("by " + trip.getAuthor().getNickname());
            } else {
                author.setText("by 알 수 없음");
            }

            viewCount.setText("조회 " + trip.getViewCount());

            // ⭐️ 이미지 처리 로직
            if (trip.getImageUrl() != null && !trip.getImageUrl().isEmpty()) {
                // 1. 이미지가 있을 때: 아이콘 숨기고 이미지 표시
                placeholderIcon.setVisibility(View.GONE);
                imageThumbnail.setVisibility(View.VISIBLE);

                String fullUrl = SERVER_URL + trip.getImageUrl();
                Glide.with(itemView.getContext())
                        .load(fullUrl)
                        .centerCrop()
                        .into(imageThumbnail);
            } else {
                // 2. 이미지가 없을 때: 이미지 숨기고 아이콘 표시
                placeholderIcon.setVisibility(View.VISIBLE);
                imageThumbnail.setVisibility(View.GONE);

                // 혹시 모를 잔상 제거
                Glide.with(itemView.getContext()).clear(imageThumbnail);
            }
        }
    }
}
