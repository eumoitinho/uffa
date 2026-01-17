import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications'
import { Provider } from 'react-redux';
import store from './redux/store';
import { GoogleOAuthProvider } from '@react-oauth/google';




const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
const app = googleClientId ? (
  <GoogleOAuthProvider clientId={googleClientId}>
    <App />
  </GoogleOAuthProvider>
) : (
  <App />
);
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <MantineProvider withGlobalStyles withNormalizeCSS>
    <Notifications position="bottom-right" zIndex={2077} />
    <Provider store={store}>
      {app}
    </Provider>
  </MantineProvider>
);


// ></Provider>
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
