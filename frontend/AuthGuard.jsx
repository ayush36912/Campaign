// AuthGuard.js (Hook)
import { Navigate } from 'react-router-dom';
import { useAuth } from './src/components/context/AuthContext';



const AuthGuard = ({ children }) => {
  const { isLoggedIn, user } = useAuth();

  if (isLoggedIn && user && user.email === 'niralipatel13006@gmail.com') {
    return <>{children}</>;
  } 
  // else {
  //   return <Navigate to="/login" />;
  // }
};

export default AuthGuard;
