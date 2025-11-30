✈️ Travel Sphere | 올인원 여행 플랫폼 (Full Stack)여행 계획부터 실시간 소통, 정보 공유까지 가능한 Web + Android 통합 여행 플랫폼입니다.언제 어디서나 여행 친구들과 함께 계획을 짜고 추억을 공유하세요.✨ 1. 주요 특징 (Key Features)아이콘기능 명칭상세 설명기술 스택🗺️스마트 여행 플래너Google Maps API를 활용하여 경로를 지도 위에서 시각적으로 계획하고 수정할 수 있습니다.Google Maps, React/Kotlin UI💬실시간 그룹 채팅Socket.IO를 이용해 웹과 모바일 사용자 간 끊김 없는 실시간 대화 환경을 제공합니다.Socket.IO, Node.js📸여행 커뮤니티사진과 함께 여행 후기를 남기고, 다른 사용자의 유용한 정보를 공유하는 게시판 기능입니다.REST API, File Upload💾통합 계정 시스템웹(Frontend)과 앱(Android)에서 동일한 계정으로 접속하여 모든 정보를 통합 관리합니다.JWT, OAuth (선택 사항)🛠️ 2. 기술 스택 (Tech Stack)구분주요 기술상세 내용BackendNode.js, Express안정적인 REST API 구축 및 Socket.IO 서버 운영.DatabaseMySQL데이터베이스 관리 및 ORM (Sequelize) 활용.FrontendReact (Vite)컴포넌트 기반 UI, Context API를 활용한 상태 관리.Mobile AppAndroid Native (Kotlin)MVVM 패턴 기반, Retrofit 통신, Google Maps SDK.Real-timeSocket.IO양방향 실시간 통신 구현.📂 3. 프로젝트 구조 (Project Structure)프로젝트는 모듈화되어 세 개의 독립적인 디렉터리로 구성됩니다.📦 Root Directorytravel-app-project/
├── app/                 # 📱 Android Native App (Kotlin)
├── backend/             # 🛠️ Node.js Server (REST API + Socket.IO)
├── frontend/            # 💻 Web Frontend (React)
├── README.md            # 현재 문서
└── .gitignore           # Git 무시 설정
1. 🛠️ Backend (/backend) 구조Node.js + Express 기반 MVC 패턴 서버.폴더/파일역할주요 기술/파일src/controllers/비즈니스 로직요청 및 응답 처리 로직src/services/핵심 기능컨트롤러에서 호출되는 핵심 로직 구현src/repositories/데이터 접근DB 쿼리 수행 및 데이터 처리uploads/이미지 저장사용자 업로드 파일 저장소.env환경 변수DB 정보, 시크릿 키 등 (보안 필수)app.js서버 진입점서버 시작, 미들웨어 설정2. 💻 Frontend (/frontend) 구조React 기반 웹 UI.폴더/파일역할주요 기술/파일src/pages/페이지 단위홈, 여행 계획, 채팅 등 페이지 컴포넌트src/components/재사용 UI버튼, 모달, 네비게이션 바 등 공통 컴포넌트src/context/전역 상태Context API를 이용한 인증/채팅 상태 관리App.jsx메인 라우터React Router 설정 및 앱 최상위 컴포넌트🚀 4. 시작 가이드 (Getting Started)📋 사전 준비 사항Node.js (v16+)Android Studio (Ladybug+)MySQL / DB 클라이언트Git1️⃣ 프로젝트 클론git clone [https://github.com/hyeonu8745/travel-platform.git](https://github.com/hyeonu8745/travel-platform.git)
cd travel-app-project
2️⃣ 백엔드 서버 실행# 1. 이동 및 패키지 설치
cd backend
npm install

# 2. 환경 변수 설정
cp .env.example .env 
# `.env` 파일에 DB 정보, 포트 번호 등을 설정해 주세요.

# 3. 서버 실행
npm start
# 개발 모드: npm run dev
3️⃣ 프론트엔드 웹 실행# 1. 이동 및 패키지 설치
cd ../frontend
npm install

# 2. 웹 서버 실행
npm run dev
# 터미널에 출력되는 주소(예: http://localhost:5173)로 접속합니다.
4️⃣ 안드로이드 앱 실행⚠️ 중요: Google Maps API Key 필요Android Studio에서 travel-app-project/app 폴더를 열기.app 폴더 또는 프로젝트 루트에 있는 local.properties 파일을 열고, 본인의 Google Maps API 키를 추가합니다. (이 파일은 Git에 포함되지 않습니다.)# local.properties 예시
GOOGLE_API_KEY=AIzaSy... (발급받은 키 입력)
상단 메뉴에서 Sync Project with Gradle Files를 클릭 후, ▶️ Run 버튼을 눌러 앱을 실행합니다.🔒 5. 보안 및 유의 사항API Key: Google Maps API 키는 반드시 local.properties 또는 .env 파일에 보관하고, 절대 Git에 커밋하지 마세요.업로드 경로: 백엔드의 이미지 업로드 기능 사용 시, backend/uploads 폴더가 정상적으로 생성되었는지 확인해 주세요.