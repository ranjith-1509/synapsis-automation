import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // Here you would normally check for authentication
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;