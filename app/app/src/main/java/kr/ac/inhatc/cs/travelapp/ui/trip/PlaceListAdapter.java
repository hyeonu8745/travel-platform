package kr.ac.inhatc.cs.travelapp.ui.trip;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;
import kr.ac.inhatc.cs.travelapp.R; // R 클래스 패키지 주의
import kr.ac.inhatc.cs.travelapp.data.model.TripCreateStopRequest;

public class PlaceListAdapter extends RecyclerView.Adapter<PlaceListAdapter.ViewHolder> {

    private List<TripCreateStopRequest> items;
    private final OnItemDeleteListener listener;

    public interface OnItemDeleteListener {
        void onDelete(TripCreateStopRequest item);
    }

    public PlaceListAdapter(List<TripCreateStopRequest> items, OnItemDeleteListener listener) {
        this.items = items;
        this.listener = listener;
    }

    public void setItems(List<TripCreateStopRequest> items) {
        this.items = items;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        // item_trip_place_simple.xml 레이아웃 필요 (아래 코드 참고)
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_trip_place_simple, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        TripCreateStopRequest item = items.get(position);
        holder.textName.setText(item.getName());
        holder.btnDelete.setOnClickListener(v -> listener.onDelete(item));
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView textName;
        Button btnDelete;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            textName = itemView.findViewById(R.id.text_place_name);
            btnDelete = itemView.findViewById(R.id.btn_delete_place);
        }
    }
}
