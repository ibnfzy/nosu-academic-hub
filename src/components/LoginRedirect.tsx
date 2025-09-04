import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginRedirect = ({ currentUser }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      // Redirect ke dashboard sesuai role
      const dashboardPath = `/dashboard/${currentUser.role}`;
      
      navigate(dashboardPath, { replace: true });
    }
  }, [currentUser, navigate]);

  return null;
};

export default LoginRedirect;