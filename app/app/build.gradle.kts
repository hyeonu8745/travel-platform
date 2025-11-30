import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
}

// 1. local.properties 파일 읽기
val properties = Properties()
val localPropertiesFile = rootProject.file("local.properties")
if (localPropertiesFile.exists()) {
    properties.load(localPropertiesFile.inputStream())
}

android {
    namespace = "kr.ac.inhatc.cs.travelapp"
    compileSdk = 36

    defaultConfig {
        applicationId = "kr.ac.inhatc.cs.travelapp"
        minSdk = 35
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        // [★중요★] 이 코드가 있어야 매니페스트의 ${googleApiKey} 자리에 값이 들어갑니다!
        // 키가 없을 경우를 대비해 "KEY_NOT_FOUND"라는 임시값을 넣어 에러를 방지합니다.
        manifestPlaceholders["googleApiKey"] = properties.getProperty("GOOGLE_API_KEY") ?: "KEY_NOT_FOUND"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
}

dependencies {

        implementation(libs.appcompat)
        implementation(libs.material)
        implementation(libs.activity)
        implementation(libs.constraintlayout)
        testImplementation(libs.junit)
        androidTestImplementation(libs.ext.junit)
        androidTestImplementation(libs.espresso.core)

        implementation("com.squareup.retrofit2:retrofit:2.9.0")
        implementation("com.squareup.retrofit2:converter-gson:2.9.0")
        implementation("com.github.bumptech.glide:glide:4.16.0")
        implementation("com.google.android.gms:play-services-maps:18.2.0")
        implementation("com.google.maps.android:android-maps-utils:3.8.0")
        implementation("com.google.android.libraries.places:places:3.3.0")
        // ⭐️ Socket.IO Client 라이브러리 추가
        implementation("io.socket:socket.io-client:2.1.0") {
            exclude(group = "org.json", module = "json")
    }
}
