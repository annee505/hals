import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Emergency error handler
window.onerror = function (message, source, lineno, colno, error) {
    console.error("Global Error:", message, source, lineno, colno, error);
    // document.body.innerHTML = `<div style="padding: 20px; color: red;"><h1>App Crashed</h1><p>${message}</p><p>${source}:${lineno}</p></div>`;
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
