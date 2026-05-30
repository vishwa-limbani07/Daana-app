// Navbar.jsx — editorial top bar.
//
// Behaviour:
//   - Transparent over the hero (when scrollY === 0)
//   - On any scroll, fades in: white background, backdrop blur, soft border
//   - Mobile: hamburger reveals a slide-down menu
//
// Visual:
//   - Brand mark (green square with द) + serif "Daana" wordmark
//   - Underline-on-hover nav items (animated 200ms left → right reveal)
//   - "Sign up" is an outline-style button (matches landing CTAs)

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice.js';

export default function Navbar() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Only the landing route should start transparent — every other page has
  // content right under the navbar and looks weird if it's transparent.
  const allowTransparent = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isSolid = !allowTransparent || scrolled;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        isSolid
          ? 'bg-white/85 backdrop-blur-md border-b border-gray-200'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center text-sm font-bold shadow-sm shadow-emerald-200 group-hover:shadow-emerald-300 transition-shadow">
            द
          </span>
          <span className="font-serif text-xl tracking-tight text-gray-900">Daana</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          <NavItem to="/browse">Browse</NavItem>
          {user ? (
            <>
              <NavItem to="/create">Start a campaign</NavItem>
              <NavItem to="/dashboard">Dashboard</NavItem>
              <div className="mx-2 w-px h-5 bg-gray-300" />
              <UserChip name={user.name} onLogout={() => dispatch(logout())} />
            </>
          ) : (
            <>
              <NavItem to="/login">Login</NavItem>
              <Link
                to="/signup"
                className="ml-2 inline-flex items-center border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-4 py-1.5 text-xs uppercase tracking-widest transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden p-2 -mr-2 text-gray-700"
          aria-label="Menu"
        >
          {mobileOpen ? <IconX /> : <IconMenu />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-3 space-y-1">
          <MobileItem to="/browse">Browse</MobileItem>
          {user ? (
            <>
              <MobileItem to="/create">Start a campaign</MobileItem>
              <MobileItem to="/dashboard">Dashboard</MobileItem>
              <button
                onClick={() => dispatch(logout())}
                className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <MobileItem to="/login">Login</MobileItem>
              <MobileItem to="/signup">Sign up</MobileItem>
            </>
          )}
        </div>
      )}
    </header>
  );
}

// ----- desktop nav item with animated underline -----
function NavItem({ to, children }) {
  return (
    <Link
      to={to}
      className="relative text-gray-700 hover:text-gray-900 px-3 py-2 transition-colors group"
    >
      {children}
      <span className="absolute left-3 right-3 bottom-1 h-px bg-emerald-600 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
    </Link>
  );
}

// ----- user chip with dropdown for logged-in state -----
function UserChip({ name, onLogout }) {
  const [open, setOpen] = useState(false);
  const initial = (name || '?')[0].toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold">
          {initial}
        </span>
        <span className="text-gray-700">{name?.split(' ')[0]}</span>
        <IconChevron open={open} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-sm">
          <Link to="/dashboard" className="block px-3 py-2 hover:bg-gray-50">Dashboard</Link>
          <Link to="/create" className="block px-3 py-2 hover:bg-gray-50">Start a campaign</Link>
          <hr className="my-1 border-gray-100" />
          <button
            onMouseDown={onLogout}
            className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

function MobileItem({ to, children }) {
  return (
    <Link to={to} className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors">
      {children}
    </Link>
  );
}

// ----- inline icons (no dependency) -----
function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
function IconX() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="6" y1="18" x2="18" y2="6" />
    </svg>
  );
}
function IconChevron({ open }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
