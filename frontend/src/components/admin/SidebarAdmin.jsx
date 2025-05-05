import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaMusic, FaCompactDisc, FaUserAlt, FaSignOutAlt } from "react-icons/fa";

const SidebarAdmin = () => {
  const location = useLocation();

  // Kiểm tra path hiện tại để highlight menu active
  const isActive = (path) => {
    return location.pathname === path ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-800";
  };

  return (
    <>
      {/* Mobile Navbar */}
      <nav className="fixed top-0 z-50 w-full bg-gray-900 border-b border-gray-800 sm:hidden">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                data-drawer-target="logo-sidebar"
                data-drawer-toggle="logo-sidebar"
                aria-controls="logo-sidebar"
                type="button"
                className="inline-flex items-center p-2 text-sm rounded-lg hover:bg-gray-800 focus:outline-none text-gray-400"
              >
                <span className="sr-only">Open sidebar</span>
                <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                </svg>
              </button>
              <Link to="/admin" className="flex ms-2">
                <span className="self-center text-xl font-semibold whitespace-nowrap text-white">MusicAdmin</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        id="logo-sidebar"
        className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-gray-900 border-r border-gray-800 sm:translate-x-0"
        aria-label="Sidebar"
      >
        <div className="h-full px-3 pb-4 overflow-y-auto flex flex-col justify-between bg-gray-900">
          {/* Menu Items */}
          <ul className="space-y-2 mt-4">
            <li>
              <a
                href="/"
                className={`flex items-center p-3 rounded-lg group ${isActive("/")}`}
              >
                <FaHome className="w-5 h-5" />
                <span className="ms-3">Home</span>
              </a>
            </li>
            <li>
              <Link
                to="/admin/songs"
                className={`flex items-center p-3 rounded-lg group ${isActive("/admin/songs")}`}
              >
                <FaMusic className="w-5 h-5" />
                <span className="ms-3">Song Management</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/albums"
                className={`flex items-center p-3 rounded-lg group ${isActive("/admin/albums")}`}
              >
                <FaCompactDisc className="w-5 h-5" />
                <span className="ms-3">Album Management</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/artists"
                className={`flex items-center p-3 rounded-lg group ${isActive("/admin/artists")}`}
              >
                <FaUserAlt className="w-5 h-5" />
                <span className="ms-3">Artist Management</span>
              </Link>
            </li>
            {/* <li>
              <Link
                to="/admin/playlists"
                className={`flex items-center p-3 rounded-lg group ${isActive("/admin/playlists")}`}
              >
                <FaUserAlt className="w-5 h-5" />
                <span className="ms-3">Playlist Management</span>
              </Link>
            </li> */}
          </ul>
        </div>
      </aside>

      {/* Overlay for mobile (click to close sidebar) */}
      <div
        className="sm:hidden fixed inset-0 z-30 bg-black bg-opacity-50 hidden"
        id="sidebar-overlay"
      ></div>
    </>
  );
};

export default SidebarAdmin;