package kr.ac.inhatc.cs.travelapp.data.api;

import java.io.IOException;
import okhttp3.Interceptor;
import okhttp3.Request;
import okhttp3.Response;
import kr.ac.inhatc.cs.travelapp.data.PreferenceHelper;

public class AuthInterceptor implements Interceptor {

    private PreferenceHelper preferenceHelper;

    public AuthInterceptor(PreferenceHelper preferenceHelper) {
        this.preferenceHelper = preferenceHelper;
    }

    @Override
    public Response intercept(Chain chain) throws IOException {
        Request originalRequest = chain.request();

        // ⭐️ [수정] getString("accessToken") 대신 getAccessToken() 사용!
        String token = preferenceHelper.getAccessToken();

        if (token != null) {
            Request newRequest = originalRequest.newBuilder()
                    .addHeader("Authorization", "Bearer " + token)
                    .build();
            return chain.proceed(newRequest);
        }

        return chain.proceed(originalRequest);
    }
}
