package kr.ac.inhatc.cs.travelapp.data.model;

public class PostRequest {
    private String title;
    private String content;
    // private int board_id; // 게시판 ID가 필요하다면 추가 (상수값 등)
    private int board_id;
    public PostRequest(String title, String content) {
        this.title = title;
        this.content = content;
    }
    public void setBoardId(int boardId) { this.board_id = boardId; }

}
