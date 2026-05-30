// App.jsx — top-level component. Owns the route table.
//
// Layout rules:
//   /login, /signup → no navbar, no outer max-width container (auth pages
//                     handle their own canvas — editorial layout breathes
//                     edge-to-edge)
//   /              → full-bleed landing page (no max-width container,
//                     but navbar visible)
//   everything else → navbar + max-w-6xl content wrapper

import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import ToastContainer from './components/common/ToastContainer.jsx';
import Landing from './pages/Landing.jsx';
import Browse from './pages/Browse.jsx';
import CampaignDetail from './pages/CampaignDetail.jsx';
import CreateCampaign from './pages/CreateCampaign.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  const { pathname } = useLocation();
  const isAuthRoute = pathname === '/login' || pathname === '/signup';
  const isFullBleed = isAuthRoute || pathname === '/';

  // Navbar is `fixed`. Routes other than the landing need top padding so
  // their content doesn't slide under the bar. Landing handles its own
  // spacing because its hero starts with deliberate top whitespace.
  const needsTopPad = !isAuthRoute && pathname !== '/';

  return (
    <div className="min-h-screen bg-stone-50 text-gray-900">
      {!isAuthRoute && <Navbar />}

      {isFullBleed ? (
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      ) : (
        <main className={`max-w-6xl mx-auto px-4 py-8 ${needsTopPad ? 'pt-24' : ''}`}>
          <Routes>
            <Route path="/browse" element={<Browse />} />
            <Route path="/campaigns/:id" element={<CampaignDetail />} />
            <Route path="/create" element={<CreateCampaign />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      )}

      <ToastContainer />
    </div>
  );
}
