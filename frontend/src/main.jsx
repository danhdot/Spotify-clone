import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import PlayerProvider from './context/PlayerContext.jsx' // Note: Changed from PlayerContextProvider to PlayerProvider

const root = ReactDOM.createRoot(document.getElementById('root'))

const isAdminRoute = window.location.pathname.startsWith('/admin')

root.render(
  <React.StrictMode>
      {isAdminRoute ? (
        <App /> // No PlayerProvider wrapper for admin
      ) : (
        <PlayerProvider>
          <App />
        </PlayerProvider>
      )}
  </React.StrictMode>
)

// Backup 
// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'
// import { BrowserRouter } from 'react-router-dom'
// import PlayerContextProvider from './context/PlayerContext.jsx'

// const root = ReactDOM.createRoot(document.getElementById('root'))

// const isAdminRoute = window.location.pathname.startsWith('/admin')

// root.render(
//   <React.StrictMode>
//       {isAdminRoute ? (
//         <App /> // Không bao bọc PlayerContextProvider cho admin
//       ) : (
//         <PlayerContextProvider>
//           <App />
//         </PlayerContextProvider>
//       )}
//   </React.StrictMode>
// )