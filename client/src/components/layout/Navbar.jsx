// Navbar.jsx — sticky top bar with logo + auth-aware links.
// Reads `user` from Redux and dispatches `logout` on click.

import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice.js';

export default function Navbar() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl text-indigo-600">CrowdFund</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className="hover:text-indigo-600">Browse</Link>
          {user ? (
            <>
              <Link to="/create" className="hover:text-indigo-600">Start a Campaign</Link>
              <Link to="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
              <button onClick={() => dispatch(logout())} className="text-gray-600 hover:text-red-600">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-indigo-600">Login</Link>
              <Link to="/signup" className="bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
