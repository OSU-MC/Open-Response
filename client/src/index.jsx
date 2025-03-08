import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Provider } from 'react-redux'
import App from './App'
import store from './redux/store'

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
console.log(import.meta.env.VITE_API_URL);
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);
