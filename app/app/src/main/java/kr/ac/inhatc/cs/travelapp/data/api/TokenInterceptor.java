package kr.ac.inhatc.cs.travelapp.data.api;

import androidx.annotation.NonNull;
import java.io.IOException;
import kr.ac.inhatc.cs.travelapp.data.PreferenceHelper;
import okhttp3.Interceptor;
import okhttp3.Request;
import okhttp3.Response;

public class TokenInterceptor implements Interceptor {
    private PreferenceHelper preferenceHelper;

    public TokenInterceptor(PreferenceHelper preferenceHelper) {
        this.preferenceHelper = preferenceHelper;
    }

    @NonNull
    @Override
    public Response intercept(@NonNull Chain chain) throws IOException {
        String token = preferenceHelper.getAccessToken();
        Request originalRequest = chain.request();

        if (token != null && !token.isEmpty()) {
            // 로그로 최종 헤더 값 확인 (디버깅용)
            android.util.Log.d("AUTH_HEADER", "Authorization: Bearer " + token);

            Request newRequest = originalRequest.newBuilder()
                    .header("Authorization", "Bearer " + token) // addHeader 대신 header() 권장 (덮어쓰기)
                    .build();
            return chain.proceed(newRequest);
        }

        return chain.proceed(originalRequest);
    }
}
