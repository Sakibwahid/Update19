import {Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loadin from '../ui/loadin';

const ProtectedRoute = ({role, children})=>{
  const {user, userData, loading} = useAuth();
  if(loading){
    return <Loadin>Checking credentials...</Loadin>
  }
  if(!user)
   return <Navigate to="/login" replace />;
  if (userData && !userData.isApproved)
      return <Loadin>Waiting for admin approval...</Loadin>
  if(role && !role.includes(userData.role))
       return <Loadin>Access denied. Insufficient permissions.</Loadin>
    return children;

}
export default ProtectedRoute;