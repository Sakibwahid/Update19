import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

function TestAuth() {
  const { user, userData, loading, isAdmin, isApproved } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-white mt-4">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen container-mobile py-8">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Auth Context Test</h1>
        
        <div className="space-y-3 text-gray-300">
          <p>
            <strong>User:</strong> {user ? '✅ Logged in' : '❌ Not logged in'}
          </p>
          
          {user && (
            <>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>UID:</strong> {user.uid}</p>
            </>
          )}
          
          <p>
            <strong>User Data:</strong> {userData ? '✅ Loaded' : '❌ Not loaded'}
          </p>
          
          {userData && (
            <>
              <p><strong>Username:</strong> {userData.username}</p>
              <p><strong>Team Name:</strong> {userData.teamName}</p>
              <p><strong>Role:</strong> {userData.role}</p>
              <p><strong>Budget:</strong> ${userData.budget?.toLocaleString()}</p>
              <p><strong>Is Admin:</strong> {isAdmin ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Is Approved:</strong> {isApproved ? '✅ Yes' : '❌ No'}</p>
            </>
          )}
        </div>

        <pre className="mt-4 bg-gray-900 p-4 rounded text-xs text-gray-400 overflow-auto">
          {JSON.stringify({ user, userData, isAdmin, isApproved }, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default TestAuth;