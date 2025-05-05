import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; //useAuth
import Sidebar from "./components/user/Sidebar";
import SidebarAdmin from "./components/admin/SidebarAdmin";
import Player from "./components/user/Player";
import Display from "./components/user/Display";
import AdminArtist from "./components/admin/AdminArtist";
import AdminAlbum from "./components/admin/AdminAlbum";
import AdminSong from "./components/admin/AdminSong";
// import AdminPlaylist from './components/admin/AdminPlaylist';
import { PlayerContext } from "./context/PlayerContext";
import AdminAddSong from "./components/admin/AdminAddSong";
import { ToastContainer } from "react-toastify";
import AlbumDetail from "./components/user/AlbumDetail";
import Search from "./components/user/Search";
import Chat from "./components/user/Chat"; // Thêm import Chat
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDropdown from "./components/UserDropdown";
import ProtectedRoute from "./components/ProtectedRoute";
import "react-toastify/dist/ReactToastify.css";
import Playlist from "./components/Playlist";
import PlaylistDetail from "./components/PlaylistDetail";
import Videos from "./components/user/Videos";

export const url = "http://localhost:8000";

const AppContent = () => {
  const isAdmin = window.location.pathname.startsWith("/admin");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const playerContext = !isAdmin ? useContext(PlayerContext) : null;
  const { audioRef, track } = playerContext || {};
  // const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          {/* User routes */}
          <Route
            path="/"
            element={
              !isAdmin ? (
                <div className="flex h-screen flex-col">
                  <div className="flex flex-1 overflow-hidden">
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto bg-[#181818] rounded-lg m-2">
                      <div className="flex justify-end p-4">
                        <UserDropdown />
                      </div>
                      <Display />
                    </main>
                  </div>
                  <footer className="bg-[#181818] border-t border-gray-800">
                    <Player />
                    <audio ref={audioRef} src={track?.file} preload="auto" />
                  </footer>
                </div>
              ) : (
                <Navigate to="/admin/artists" replace />
              )
            }
          />

          <Route
            path="/home"
            element={
              <div className="flex h-screen flex-col">
                <div className="flex flex-1 overflow-hidden">
                  <Sidebar />
                  <main className="flex-1 overflow-y-auto bg-[#181818] rounded-lg m-2">
                    <div className="flex justify-end p-4">
                      <UserDropdown />
                    </div>
                    <Display />
                  </main>
                </div>
                <footer className="bg-[#181818] border-t border-gray-800">
                  <Player />
                  <audio ref={audioRef} src={track?.file} preload="auto" />
                </footer>
              </div>
            }
          />

          <Route
            path="/album/:id"
            element={
              <div className="flex h-screen flex-col">
                <div className="flex flex-1 overflow-hidden">
                  <Sidebar />
                  <main className="flex-1 overflow-y-auto bg-[#181818] rounded-lg m-2">
                    <div className="flex justify-end p-4">
                      <UserDropdown />
                    </div>
                    <AlbumDetail />
                  </main>
                </div>
                <footer className="bg-[#181818] border-t border-gray-800">
                  <Player />
                  <audio ref={audioRef} src={track?.file} preload="auto" />
                </footer>
              </div>
            }
          />

          <Route
            path="/search"
            element={
              <div className="flex h-screen flex-col">
                <div className="flex flex-1 overflow-hidden">
                  <Sidebar />
                  <main className="flex-1 overflow-y-auto bg-[#181818] rounded-lg m-2">
                    <div className="flex justify-end p-4">
                      <UserDropdown />
                    </div>
                    <Search />
                  </main>
                </div>
                <footer className="bg-[#181818] border-t border-gray-800">
                  <Player />
                  <audio ref={audioRef} src={track?.file} preload="auto" />
                </footer>
              </div>
            }
          />

          <Route
            path="/videos"
            element={
              <div className="flex h-screen flex-col">
                <div className="flex flex-1 overflow-hidden">
                  <Sidebar />
                  <main className="flex-1 overflow-y-auto bg-[#181818] rounded-lg m-2">
                    <div className="flex justify-end p-4">
                      <UserDropdown />
                    </div>
                    <Videos />
                  </main>
                </div>
                <footer className="bg-[#181818] border-t border-gray-800">
                  <Player />
                  <audio ref={audioRef} src={track?.file} preload="auto" />
                </footer>
              </div>
            }
          />

          <Route
            path="/playlists"
            element={
              <div className="flex h-screen flex-col">
                <div className="flex flex-1 overflow-hidden">
                  <Sidebar />
                  <main className="flex-1 overflow-y-auto bg-[#181818] rounded-lg m-2">
                    <div className="flex justify-end p-4">
                      <UserDropdown />
                    </div>
                    <Playlist />
                  </main>
                </div>
                <footer className="bg-[#181818] border-t border-gray-800">
                  <Player />
                  <audio ref={audioRef} src={track?.file} preload="auto" />
                </footer>
              </div>
            }
          />

          <Route
            path="/playlist/:id"
            element={
              <div className="flex h-screen flex-col">
                <div className="flex flex-1 overflow-hidden">
                  <Sidebar />
                  <main className="flex-1 overflow-y-auto bg-[#181818] rounded-lg m-2">
                    <div className="flex justify-end p-4">
                      <UserDropdown />
                    </div>
                    <PlaylistDetail />
                  </main>
                </div>
                <footer className="bg-[#181818] border-t border-gray-800">
                  <Player />
                  <audio ref={audioRef} src={track?.file} preload="auto" />
                </footer>
              </div>
            }
          />

          <Route
            path="/chat"
            element={
              <div className="flex h-screen flex-col">
                <div className="flex flex-1 overflow-hidden">
                  <Sidebar />
                  <main className="flex-1 overflow-y-auto bg-[#181818] rounded-lg m-2">
                    <div className="flex justify-end p-4">
                      <UserDropdown />
                    </div>
                    <Chat />
                  </main>
                </div>
                <footer className="bg-[#181818] border-t border-gray-800">
                  <Player />
                  <audio ref={audioRef} src={track?.file} preload="auto" />
                </footer>
              </div>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/*"
            element={
              <div className="flex h-screen">
                <SidebarAdmin />
                <main className="flex-1 overflow-y-auto bg-[#121212] p-6 sm:ml-64">
                  <div className="flex justify-end">
                    <UserDropdown />
                  </div>
                  <div className="mt-2">
                    <Routes>
                      <Route path="add-song" element={<AdminAddSong />} />
                      <Route path="artists" element={<AdminArtist />} />
                      <Route path="albums" element={<AdminAlbum />} />
                      <Route path="songs" element={<AdminSong />} />
                      <Route path="songs/:id" element={<AdminAddSong />} />
                    </Routes>
                  </div>
                </main>
              </div>
            }
          />
        </Route>

        {/* Redirect to home if no route matches */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;

// Backup
// import React, { useContext } from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Sidebar from './components/user/Sidebar';
// import SidebarAdmin from './components/admin/SidebarAdmin';
// import Player from './components/user/Player';
// import Display from './components/user/Display';
// import AdminArtist from './components/admin/AdminArtist';
// import AdminAlbum from './components/admin/AdminAlbum';
// import AdminSong from './components/admin/AdminSong';
// import AdminPlaylist from './components/admin/AdminPlaylist';
// import { PlayerContext } from './context/PlayerContext';
// import AdminAddSong from './components/admin/AdminAddSong';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// export const url = "http://localhost:8000";

// const App = () => {
//   const isAdmin = window.location.pathname.startsWith('/admin');
//   const playerContext = !isAdmin ? useContext(PlayerContext) : null;
//   const { audioRef, track } = playerContext || {};

//   return (
//     <Router>
//       <div className={`h-screen ${!isAdmin ? 'bg-black' : ''}`}>
//         <ToastContainer />
//         {!isAdmin && (
//           <div className='h-[90%] flex'>
//             <Sidebar />
//             <Routes>
//               {/* User Routes */}
//               <Route path='*' element={<Display />} />
//               <Route path='/home' element={<Display />} />

//               {/* Fallback route */}
//               <Route path='*' element={<Display />} />
//             </Routes>
//           </div>
//         )}

//         {isAdmin && (
//           <div>
//             <SidebarAdmin />
//             <div className="p-4 sm:ml-64">
//               <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">

//                 <Routes>
//                   {/* Admin Routes */}
//                   <Route path='admin/add-song' element={<AdminAddSong />} />
//                   <Route path='/admin/artists' element={<AdminArtist />} />
//                   <Route path='/admin/albums' element={<AdminAlbum />} />
//                   <Route path='/admin/songs' element={<AdminSong />} />
//                   <Route path="/admin/songs/:id" element={<AdminAddSong />} />
//                   <Route path='/admin/playlists' element={<AdminPlaylist />} />
//                 </Routes>
//               </div>
//             </div>
//           </div>
//         )}

//         {!isAdmin && (
//           <>
//             <Player />
//             <audio ref={audioRef} src={track?.file} preload='auto'></audio>
//           </>
//         )}
//       </div>
//     </Router>
//   );
// };

// export default App;
