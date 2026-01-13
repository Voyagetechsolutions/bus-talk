import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../hooks/useStore';
import { signOut } from '../utils/supabase';
import AuthModal from './AuthModal';
import CreatePostModal from './CreatePostModal';
import SpotterApplicationModal from './SpotterApplicationModal';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useAppStore();

  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'signin' as 'signin' | 'signup' });
  const [createPostModal, setCreatePostModal] = useState({ isOpen: false, type: 'news' as 'news' | 'sighting' });
  const [spotterApplicationModal, setSpotterApplicationModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dropdown states
  const [exploreOpen, setExploreOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Refs for dropdown positioning
  const exploreRef = useRef<HTMLDivElement>(null);
  const communityRef = useRef<HTMLDivElement>(null);
  const createRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setExploreOpen(false);
      }
      if (communityRef.current && !communityRef.current.contains(event.target as Node)) {
        setCommunityOpen(false);
      }
      if (createRef.current && !createRef.current.contains(event.target as Node)) {
        setCreateOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setProfileOpen(false);
  };

  const closeAllDropdowns = () => {
    setExploreOpen(false);
    setCommunityOpen(false);
    setCreateOpen(false);
    setProfileOpen(false);
    setMobileMenuOpen(false);
  };

  const Dropdown: React.FC<{
    isOpen: boolean;
    children: React.ReactNode;
    className?: string;
  }> = ({ isOpen, children, className = '' }) => (
    <div className={`absolute top-full left-0 mt-3 w-48 bg-gray-900 rounded-xl shadow-2xl border border-gray-700 z-50 transition-all duration-300 ${isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
      } ${className}`}>
      <div className="py-2">
        {children}
      </div>
    </div>
  );

  const DropdownItem: React.FC<{
    to?: string;
    onClick?: () => void;
    children: React.ReactNode;
    icon?: string;
  }> = ({ to, onClick, children, icon }) => {
    const content = (
      <div className="flex items-center space-x-3 px-4 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
        {icon && <span className="text-base opacity-70">{icon}</span>}
        <span className="text-sm">{children}</span>
      </div>
    );

    if (to) {
      return (
        <Link to={to} onClick={closeAllDropdowns}>
          {content}
        </Link>
      );
    }

    return <div onClick={onClick}>{content}</div>;
  };

  return (
    <>
      <nav className="bg-[#0a0a0c]/95 backdrop-blur-md sticky top-0 z-50 border-b border-[rgba(255,255,255,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-lg flex items-center justify-center text-lg">
                🚌
              </div>
              <span className="text-lg font-semibold text-white">
                Bus Talk
              </span>
            </Link>

            {/* Primary Navigation */}
            <div className="hidden lg:flex items-center space-x-1">

              <Link
                to="/"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative ${location.pathname === '/'
                  ? 'text-white bg-white/10 shadow-lg border border-white/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                Home
              </Link>

              {/* Explore Dropdown */}
              <div ref={exploreRef} className="relative">
                <button
                  onClick={() => setExploreOpen(!exploreOpen)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${['/companies', '/buses', '/drivers'].includes(location.pathname)
                    ? 'text-white bg-white/10 shadow-lg border border-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <span>Explore</span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${exploreOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <Dropdown isOpen={exploreOpen}>
                  <DropdownItem to="/companies" icon="🏢">Companies</DropdownItem>
                  <DropdownItem to="/buses" icon="🚌">Buses</DropdownItem>
                  <DropdownItem to="/drivers" icon="👨✈️">Drivers</DropdownItem>
                </Dropdown>
              </div>

              {/* Community Dropdown */}
              <div ref={communityRef} className="relative">
                <button
                  onClick={() => setCommunityOpen(!communityOpen)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${['/posts', '/sightings'].includes(location.pathname)
                    ? 'text-white bg-white/10 shadow-lg border border-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <span>Community</span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${communityOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <Dropdown isOpen={communityOpen}>
                  <DropdownItem to="/posts" icon="📰">News & Posts</DropdownItem>
                  <DropdownItem to="/sightings" icon="📸">Bus Sightings</DropdownItem>
                  <DropdownItem to="/coach-talk" icon="🗣️">Coach Talk</DropdownItem>
                </Dropdown>
              </div>

              <Link
                to="/vote"
                className="px-3 py-1.5 rounded text-sm text-gray-500 hover:text-white transition-colors"
              >
                🗳️ Vote
              </Link>

              <Link
                to="/awards"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${location.pathname === '/awards'
                  ? 'text-white bg-white/10 shadow-lg border border-white/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                🏆 Awards
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="hidden lg:flex items-center space-x-3">

              {/* Rate Trip CTA */}
              <button
                onClick={() => navigate('/rate-trip')}
                className="bg-[#f59e0b] hover:bg-[#d97706] text-[#0a0a0c] px-4 py-2 rounded font-semibold text-sm transition-colors"
              >
                <span>⭐</span>
                <span>Rate Trip</span>
              </button>

              {/* Search */}
              <Link
                to="/search"
                className="p-2 text-gray-400 hover:text-accent-teal hover:bg-white/5 rounded-xl transition-all duration-200"
                title="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>

              {/* Create Dropdown */}
              {user && (
                <div ref={createRef} className="relative">
                  <button
                    onClick={() => setCreateOpen(!createOpen)}
                    className="p-2 text-gray-400 hover:text-accent-teal hover:bg-white/5 rounded-xl transition-all duration-200 flex items-center"
                    title="Create Content"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <Dropdown isOpen={createOpen} className="w-56">
                    {user.spotter_status && (
                      <DropdownItem
                        onClick={() => {
                          setCreatePostModal({ isOpen: true, type: 'news' });
                          setCreateOpen(false);
                        }}
                        icon="📰"
                      >
                        Write News Post
                      </DropdownItem>
                    )}
                    <DropdownItem
                      onClick={() => {
                        setCreatePostModal({ isOpen: true, type: 'sighting' });
                        setCreateOpen(false);
                      }}
                      icon="📸"
                    >
                      Post Bus Sighting
                    </DropdownItem>
                    <DropdownItem to="/companies" icon="🏢">Suggest Company</DropdownItem>
                  </Dropdown>
                </div>
              )}

              {/* User Menu */}
              {user ? (
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center space-x-2 p-1.5 hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-teal to-accent-teal-600 rounded-full flex items-center justify-center text-primary font-bold text-sm ring-2 ring-white/10">
                      {user.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    {user.spotter_status && (
                      <div className="w-5 h-5 bg-accent-amber rounded-full flex items-center justify-center shadow-glow-amber">
                        <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                  <Dropdown isOpen={profileOpen} className="w-52 right-0 left-auto">
                    <div className="px-4 py-3 border-b border-gray-700 mx-2">
                      <p className="font-semibold text-white">{user.username}</p>
                      <p className="text-xs text-gray-400">
                        {user.role === 'admin' ? 'Admin' :
                          user.spotter_status ? 'Verified Spotter' : 'Regular User'}
                      </p>
                    </div>
                    <DropdownItem to="/profile" icon="👤">My Profile</DropdownItem>
                    <DropdownItem to="/dashboard" icon="📊">Dashboard</DropdownItem>
                    <DropdownItem to="/following" icon="👥">Following</DropdownItem>
                    {user.role === 'admin' && (
                      <DropdownItem to="/admin" icon="⚙️">Admin Panel</DropdownItem>
                    )}
                    {!user.spotter_status && (
                      <DropdownItem
                        onClick={() => {
                          setSpotterApplicationModal(true);
                          setProfileOpen(false);
                        }}
                        icon="⭐"
                      >
                        Apply for Spotter
                      </DropdownItem>
                    )}
                    <div className="border-t border-gray-700 mt-2 pt-2">
                      <DropdownItem onClick={handleSignOut} icon="🚪">Sign Out</DropdownItem>
                    </div>
                  </Dropdown>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setAuthModal({ isOpen: true, mode: 'signin' })}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors font-medium text-sm"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })}
                    className="px-5 py-2 bg-gradient-to-r from-accent-amber to-accent-amber-500 hover:from-accent-amber-300 hover:to-accent-amber-400 text-primary rounded-xl transition-all font-semibold text-sm shadow-md shadow-accent-amber/20 hover:shadow-lg"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-700 bg-gray-900/98 backdrop-blur-lg">
            <div className="px-4 py-4 space-y-3">

              {/* Mobile Rate Trip Button */}
              <button
                onClick={() => {
                  navigate('/rate-trip');
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-accent-cyan to-blue-500 text-black py-3 rounded-lg font-semibold text-center flex items-center justify-center space-x-2"
              >
                <span>⭐</span>
                <span>Rate a Trip</span>
              </button>

              {/* Mobile Nav Links */}
              <div className="space-y-1">
                <Link to="/" onClick={closeAllDropdowns} className="flex items-center space-x-3 py-3 px-3 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
                  <span>🏠</span>
                  <span>Home</span>
                </Link>
                <Link to="/companies" onClick={closeAllDropdowns} className="flex items-center space-x-3 py-3 px-3 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
                  <span>🏢</span>
                  <span>Companies</span>
                </Link>
                <Link to="/buses" onClick={closeAllDropdowns} className="flex items-center space-x-3 py-3 px-3 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
                  <span>🚌</span>
                  <span>Buses</span>
                </Link>
                <Link to="/drivers" onClick={closeAllDropdowns} className="flex items-center space-x-3 py-3 px-3 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
                  <span>👨✈️</span>
                  <span>Drivers</span>
                </Link>
                <Link to="/posts" onClick={closeAllDropdowns} className="flex items-center space-x-3 py-3 px-3 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
                  <span>📰</span>
                  <span>News & Posts</span>
                </Link>
                <Link to="/sightings" onClick={closeAllDropdowns} className="flex items-center space-x-3 py-3 px-3 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
                  <span>📸</span>
                  <span>Bus Sightings</span>
                </Link>
                <Link to="/coach-talk" onClick={closeAllDropdowns} className="flex items-center space-x-3 py-3 px-3 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
                  <span>🗣️</span>
                  <span>Coach Talk</span>
                </Link>
                <Link to="/vote" onClick={closeAllDropdowns} className="flex items-center space-x-3 py-3 px-3 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
                  <span>🗳️</span>
                  <span>Vote</span>
                </Link>
                <Link to="/awards" onClick={closeAllDropdowns} className="flex items-center space-x-3 py-3 px-3 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
                  <span>🏆</span>
                  <span>Awards</span>
                </Link>
                <Link to="/search" onClick={closeAllDropdowns} className="flex items-center space-x-3 py-3 px-3 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
                  <span>🔍</span>
                  <span>Search</span>
                </Link>
              </div>

              {/* Mobile User Section */}
              {user ? (
                <div className="border-t border-gray-700 pt-4 space-y-2">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-full flex items-center justify-center text-black font-bold text-sm">
                      {user.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{user.username}</p>
                      <p className="text-xs text-gray-400">
                        {user.role === 'admin' ? '⚙️ Admin' : user.spotter_status ? '✓ Verified Spotter' : 'Regular User'}
                      </p>
                    </div>
                  </div>

                  {/* Post Sighting Button */}
                  <button
                    onClick={() => {
                      setCreatePostModal({ isOpen: true, type: 'sighting' });
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-black rounded-lg font-semibold text-center flex items-center justify-center space-x-2"
                  >
                    <span>📸</span>
                    <span>Post Sighting</span>
                  </button>

                  {/* Spotter News Button - only for spotters */}
                  {user.spotter_status && (
                    <button
                      onClick={() => {
                        setCreatePostModal({ isOpen: true, type: 'news' });
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold text-center flex items-center justify-center space-x-2"
                    >
                      <span>📰</span>
                      <span>Write News</span>
                    </button>
                  )}

                  <Link to="/profile" onClick={closeAllDropdowns} className="flex items-center space-x-3 py-3 px-3 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
                    <span>👤</span>
                    <span>My Profile</span>
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={closeAllDropdowns} className="flex items-center space-x-3 py-3 px-3 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
                      <span>⚙️</span>
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <button onClick={handleSignOut} className="flex items-center space-x-3 py-3 px-3 text-gray-400 w-full text-left font-medium rounded-lg hover:bg-gray-800 transition-colors">
                    <span>🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-700 pt-4 space-y-3">
                  <button
                    onClick={() => {
                      setAuthModal({ isOpen: true, mode: 'signin' });
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-3 text-white text-center font-medium bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthModal({ isOpen: true, mode: 'signup' });
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-3 bg-accent-yellow text-black rounded-lg font-semibold text-center hover:bg-yellow-400 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => {
          if (user) {
            setCreatePostModal({ isOpen: true, type: 'sighting' });
          } else {
            setAuthModal({ isOpen: true, mode: 'signin' });
          }
        }}
        className="lg:hidden fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-full shadow-lg flex items-center justify-center z-40 hover:scale-105 transition-transform"
        style={{ boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)' }}
        title="Post Sighting"
      >
        <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Modals */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        mode={authModal.mode}
        onModeChange={(mode) => setAuthModal({ ...authModal, mode })}
      />

      <CreatePostModal
        isOpen={createPostModal.isOpen}
        onClose={() => setCreatePostModal({ ...createPostModal, isOpen: false })}
        type={createPostModal.type}
      />

      <SpotterApplicationModal
        isOpen={spotterApplicationModal}
        onClose={() => setSpotterApplicationModal(false)}
      />
    </>
  );
};

export default Navbar;