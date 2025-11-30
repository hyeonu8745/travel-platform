package kr.ac.inhatc.cs.travelapp.ui.trip;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.floatingactionbutton.FloatingActionButton;

import java.util.List;

import kr.ac.inhatc.cs.travelapp.R;
import kr.ac.inhatc.cs.travelapp.data.api.ApiClient;
import kr.ac.inhatc.cs.travelapp.data.api.TripApi;
import kr.ac.inhatc.cs.travelapp.data.model.ApiResponse;
import kr.ac.inhatc.cs.travelapp.data.model.Trip;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class TripFragment extends Fragment {

    private RecyclerView recyclerView;
    private TripAdapter adapter;
    private ProgressBar progressBar;
    private EditText editSearch;
    private Button btnSearch;
    private FloatingActionButton fabCreate;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        // ⭐️ fragment_trip.xml 레이아웃이 필요합니다 (아래 참고)
        View view = inflater.inflate(R.layout.fragment_trip, container, false);

        recyclerView = view.findViewById(R.id.recycler_view);
        progressBar = view.findViewById(R.id.progress_bar);
        editSearch = view.findViewById(R.id.edit_search);
        btnSearch = view.findViewById(R.id.btn_search);
        fabCreate = view.findViewById(R.id.fab_create);

        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        adapter = new TripAdapter();
        recyclerView.setAdapter(adapter);

        // 상세 화면 이동 (나중에 TripDetailActivity 만들어서 연결)
        adapter.setOnItemClickListener(tripId -> {
            Intent intent = new Intent(getContext(), TripDetailActivity.class);
            intent.putExtra("tripId", tripId);
            startActivity(intent);
        });

        // 코스 짜기 버튼 (나중에 TripCreateActivity 만들어서 연결)
        fabCreate.setOnClickListener(v -> {
            Intent intent = new Intent(getContext(), TripCreateActivity.class);
            startActivity(intent);
        });

        btnSearch.setOnClickListener(v -> {
            String query = editSearch.getText().toString().trim();
            loadTrips(query.isEmpty() ? null : query);
        });

        loadTrips(null);

        return view;
    }

    private void loadTrips(String query) {
        progressBar.setVisibility(View.VISIBLE);
        TripApi api = ApiClient.getClient(getContext()).create(TripApi.class);

        api.getTrips(query).enqueue(new Callback<ApiResponse<List<Trip>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Trip>>> call, Response<ApiResponse<List<Trip>>> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    adapter.setTrips(response.body().getData());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Trip>>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
            }
        });
    }
}
