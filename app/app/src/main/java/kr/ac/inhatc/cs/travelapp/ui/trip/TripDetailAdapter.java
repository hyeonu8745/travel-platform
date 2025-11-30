package kr.ac.inhatc.cs.travelapp.ui.trip;

import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.ArrayList;
import java.util.List;
import kr.ac.inhatc.cs.travelapp.R;
import kr.ac.inhatc.cs.travelapp.data.model.TripDayStop;
import kr.ac.inhatc.cs.travelapp.data.model.TripDay;

public class TripDetailAdapter extends RecyclerView.Adapter<TripDetailAdapter.DayViewHolder> {

    private List<TripDay> days = new ArrayList<>();
    private OnDayClickListener listener;

    // ⭐️ 인터페이스 정의
    public interface OnDayClickListener {
        void onDayClick(TripDay day);
    }

    public void setOnDayClickListener(OnDayClickListener listener) {
        this.listener = listener;
    }

    public void setDays(List<TripDay> days) {
        this.days = days;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public DayViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_trip_day, parent, false);
        return new DayViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull DayViewHolder holder, int position) {
        holder.bind(days.get(position));
    }

    @Override
    public int getItemCount() { return days.size(); }

    class DayViewHolder extends RecyclerView.ViewHolder {
        TextView textDayIndex;
        LinearLayout containerStops;

        public DayViewHolder(@NonNull View itemView) {
            super(itemView);
            textDayIndex = itemView.findViewById(R.id.text_day_index);
            containerStops = itemView.findViewById(R.id.layout_stops_container);

            // ⭐️ 클릭 이벤트 연결
            textDayIndex.setOnClickListener(v -> {
                int pos = getBindingAdapterPosition();
                if (pos != RecyclerView.NO_POSITION && listener != null) {
                    listener.onDayClick(days.get(pos));
                }
            });
        }

        public void bind(TripDay day) {
            textDayIndex.setText(day.getDayIndex() + "일차 ▶"); // 클릭 유도 화살표 추가
            containerStops.removeAllViews();

            if (day.getStops() != null) {
                for (int i = 0; i < day.getStops().size(); i++) {
                    TripDayStop stop = day.getStops().get(i);

                    TextView tv = new TextView(itemView.getContext());
                    tv.setText((i + 1) + ". " + stop.getLocationName());
                    tv.setTextSize(16);
                    tv.setTextColor(Color.BLACK);
                    tv.setPadding(0, 10, 0, 10);
                    containerStops.addView(tv);

                    if(stop.getMemo() != null && !stop.getMemo().isEmpty()) {
                        TextView tvMemo = new TextView(itemView.getContext());
                        tvMemo.setText("   └ " + stop.getMemo());
                        tvMemo.setTextSize(14);
                        tvMemo.setTextColor(Color.GRAY);
                        tvMemo.setPadding(0, 0, 0, 20);
                        containerStops.addView(tvMemo);
                    }
                }
            }
        }
    }
}
