import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  // Nếu không có user, chuyển hướng về login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu đường dẫn bắt đầu bằng '/admin' và user không phải superuser, chuyển về trang chủ
  if (location.pathname.startsWith('/admin') && !user.is_superuser) {
    return <Navigate to="/" replace />;
  }

  // Nếu vượt qua các kiểm tra, cho phép truy cập route
  return <Outlet />;
};

export default ProtectedRoute;