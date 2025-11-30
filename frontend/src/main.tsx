import React from 'react';
import ReactDOM from 'react-dom/client';
// 🚨 수정: AppContainer가 default export 되었으므로, Root Component라는 이름으로 가져옵니다.
import RootComponent from './App.jsx'; 

// 최상위 컨테이너 요소를 찾아서 React 앱을 마운트합니다.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootComponent /> 
  </React.StrictMode>,
);