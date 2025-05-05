import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { url } from '../App';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${url}/api/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login');
      } else {
        // Hiển thị thông báo lỗi cụ thể từ backend
        toast.error(data.error || 'Đăng ký thất bại!');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại!');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-[#181818] rounded-lg">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Đăng ký Spotify
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
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
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
            Đăng ký
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6">
          Đã có tài khoản?{' '}
          <a href="/login" className="text-[#1DB954] hover:underline">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;