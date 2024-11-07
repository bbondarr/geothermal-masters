import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import { RecoilRoot } from 'recoil';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolClientId: process.env.REACT_APP_USER_POOL_APP_CLIENT_ID!,
      userPoolId: process.env.REACT_APP_USER_POOL_ID!,
    }
  }
})

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Authenticator.Provider>
      <RecoilRoot>
        <App />
      </RecoilRoot>
    </Authenticator.Provider>
  </React.StrictMode>
);
