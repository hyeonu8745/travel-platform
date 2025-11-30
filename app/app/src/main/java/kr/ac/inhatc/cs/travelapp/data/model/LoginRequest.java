package kr.ac.inhatc.cs.travelapp.data.model;

public class LoginRequest {
    private String email;
    private String password;

    public LoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // 필요하면 getter 추가
    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }
}
