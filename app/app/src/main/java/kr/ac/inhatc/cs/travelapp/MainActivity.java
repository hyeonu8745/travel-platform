package kr.ac.inhatc.cs.travelapp;

import android.os.Bundle;
import android.view.MenuItem;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;

import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.navigation.NavigationBarView;

import kr.ac.inhatc.cs.travelapp.data.PreferenceHelper;
import kr.ac.inhatc.cs.travelapp.data.SocketManager; // ⭐️ 추가
import kr.ac.inhatc.cs.travelapp.ui.home.HomeFragment;
import kr.ac.inhatc.cs.travelapp.ui.board.BoardFragment;
import kr.ac.inhatc.cs.travelapp.ui.chat.ChatFragment;
import kr.ac.inhatc.cs.travelapp.ui.mypage.MyPageFragment;
import kr.ac.inhatc.cs.travelapp.ui.trip.TripFragment;

public class MainActivity extends AppCompatActivity {

    private BottomNavigationView bottomNav;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // ⭐️ [핵심] 앱 진입 시 소켓 연결 시도
        PreferenceHelper preferenceHelper = new PreferenceHelper(this);
        String token = preferenceHelper.getAccessToken();
        SocketManager.getInstance(this).connect(token);

        bottomNav = findViewById(R.id.bottom_navigation);
        bottomNav.setOnItemSelectedListener(navListener);

        if (savedInstanceState == null) {
            getSupportFragmentManager().beginTransaction()
                    .replace(R.id.fragment_container, new HomeFragment())
                    .commit();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        // ⭐️ 앱 종료 시 소켓 연결 해제 (선택 사항: 백그라운드 수신 필요 시 제거 고려)
        SocketManager.getInstance(this).disconnect();
    }

    public void moveToTab(int menuItemId) {
        bottomNav.setSelectedItemId(menuItemId);
    }

    private final NavigationBarView.OnItemSelectedListener navListener =
            new NavigationBarView.OnItemSelectedListener() {
                @Override
                public boolean onNavigationItemSelected(@NonNull MenuItem item) {
                    Fragment selectedFragment = null;
                    int itemId = item.getItemId();

                    if (itemId == R.id.nav_home) selectedFragment = new HomeFragment();
                    else if (itemId == R.id.nav_board) selectedFragment = new BoardFragment();
                    else if (itemId == R.id.nav_chat) selectedFragment = new ChatFragment();
                    else if (itemId == R.id.nav_mypage) selectedFragment = new MyPageFragment();
                    else if (itemId == R.id.nav_trip) selectedFragment = new TripFragment();

                    if (selectedFragment != null) {
                        getSupportFragmentManager().beginTransaction()
                                .replace(R.id.fragment_container, selectedFragment)
                                .commit();
                        return true;
                    }
                    return false;
                }
            };
}
