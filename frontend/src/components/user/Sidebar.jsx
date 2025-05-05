import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaSearch,
  FaBook,
  FaPlus,
  FaHeart,
  FaVideo,
  FaEnvelope,
  FaUserShield,
} from "react-icons/fa";
import { useState, useEffect } from "react";

const Sidebar = () => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("access_token"); // Adjust based on your auth setup
        if (!token) {
          return;
        }

        const response = await fetch("http://127.0.0.1:8000/api/auth/user/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user info: ${response.status}`);
        }

        const data = await response.json();
        setUserInfo(data);
      } catch (err) {
        console.error("Error fetching user info:", err.message);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <div className="w-64 bg-black text-gray-300 p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold mb-6">Spotify</h1>
        <nav>
          <ul className="space-y-4">
            <li>
              <NavLink
                to="/home"
                className={({ isActive }) =>
                  `flex items-center gap-4 hover:text-white transition ${
                    isActive ? "text-white" : ""
                  }`
                }
              >
                <FaHome size={24} />
                <span>Home</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/chat"
                className={({ isActive }) =>
                  `flex items-center gap-4 hover:text-white transition ${
                    isActive ? "text-white" : ""
                  }`
                }
              >
                <FaEnvelope size={24} />
                <span>Chat</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/search"
                className={({ isActive }) =>
                  `flex items-center gap-4 hover:text-white transition ${
                    isActive ? "text-white" : ""
                  }`
                }
              >
                <FaSearch size={24} />
                <span>Search</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/videos"
                className={({ isActive }) =>
                  `flex items-center gap-4 hover:text-white transition ${
                    isActive ? "text-white" : ""
                  }`
                }
              >
                <FaVideo size={24} />
                <span>Videos</span>
              </NavLink>
            </li>
            {userInfo?.is_staff && (
              <li>
                <NavLink
                  to="/admin/songs"
                  onClick={window.location.reload}
                  className={({ isActive }) =>
                    `flex items-center gap-4 hover:text-white transition ${
                      isActive ? "text-white" : ""
                    }`
                  }
                >
                  <FaUserShield size={24} />
                  <span>Admin Manager</span>
                </NavLink>
              </li>
            )}
          </ul>
        </nav>
      </div>

      <div className="mt-6">
        <ul className="space-y-4">
          <li>
            <NavLink
              to="/playlists"
              className={({ isActive }) =>
                `flex items-center gap-4 hover:text-white transition ${
                  isActive ? "text-white" : ""
                }`
              }
            >
              <div className="bg-gray-300 rounded-sm p-1">
                <FaPlus size={16} className="text-black" />
              </div>
              <span>Playlists</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
