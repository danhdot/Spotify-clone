import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const location = useLocation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(username, password);
    navigate(location.state?.from?.pathname || '/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-[#181818] rounded-lg">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Đăng nhập vào Spotify
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tên đăng nhập"
              className="w-full p-3 bg-[#282828] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#1DB954] placeholder-gray-400"
              required
            />
          </div>
          
          <div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              className="w-full p-3 bg-[#282828] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#1DB954] placeholder-gray-400"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#1DB954] text-black font-semibold py-3 rounded-full hover:bg-[#1ed760] transition-colors"
          >
            Đăng nhập
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6">
          Chưa có tài khoản?{' '}
          <a href="/register" className="text-[#1DB954] hover:underline">
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;