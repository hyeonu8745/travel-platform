package kr.ac.inhatc.cs.travelapp.data.api;

import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.Looper;
import android.widget.Toast;

import okhttp3.OkHttpClient;
import okhttp3.Request; // Request import 추가
import okhttp3.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import kr.ac.inhatc.cs.travelapp.data.PreferenceHelper;
import kr.ac.inhatc.cs.travelapp.ui.login.LoginActivity;

public class ApiClient {
    private static final String BASE_URL = "http://10.0.2.2:3000/api/";
    public static final String SOCKET_URL = "http://10.0.2.2:3000";

    private static Retrofit retrofit = null;

    public static Retrofit getClient(Context context) {
        if (retrofit == null) {
            OkHttpClient client = new OkHttpClient.Builder()
                    // 1. 요청 보낼 때 토큰 끼워넣기
                    .addInterceptor(new AuthInterceptor(new PreferenceHelper(context)))

                    // 2. ⭐️ [수정] 401 체크 (로그인 제외)
                    .addInterceptor(chain -> {
                        Request request = chain.request();
                        Response response = chain.proceed(request);

                        // 401 에러이고, 로그인 요청이 아닐 때만 세션 만료 처리
                        if (response.code() == 401) {
                            // ⭐️ 로그인 관련 API 호출이면 인터셉터가 처리하지 않음 (Activity로 넘김)
                            if (request.url().toString().contains("/login")) {
                                return response;
                            }

                            // 그 외의 경우 (진짜 세션 만료)
                            new Handler(Looper.getMainLooper()).post(() -> {
                                PreferenceHelper prefs = new PreferenceHelper(context);
                                prefs.clear();

                                // ⭐️ 여기서 뜨는 토스트가 그 예쁜 커스텀 토스트라면,
                                //    여기서 Toast.makeText(...)를 쓰고 있는지 확인하세요.
                                //    (현재 코드는 기본 토스트를 쓰고 있어 안전합니다)
                                Toast.makeText(context, "세션이 만료되었습니다. 다시 로그인해주세요.", Toast.LENGTH_SHORT).show();

                                Intent intent = new Intent(context, LoginActivity.class);
                                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                                context.startActivity(intent);
                            });
                        }
                        return response;
                    })
                    .build();

            retrofit = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .client(client)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return retrofit;
    }
}
