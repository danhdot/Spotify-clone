// src/components/UserDropdown.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const UserDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-gray-800 p-1 rounded-full"
      >
        <img 
          src={`https://ui-avatars.com/api/?name=${user.username}&background=1DB954&color=fff`}
          alt={user.username}
          className="w-8 h-8 rounded-full"
        />
        <span className="text-white font-medium">{user.username}</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10">
          <div className="py-1">
            <button
              onClick={logout}
              className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;