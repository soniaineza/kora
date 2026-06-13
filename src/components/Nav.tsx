import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '../i18n';
import { getStoredProfile } from '../lib/profile';

export function Nav() {

  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();
  const isHome = location.pathname === '/';
  
  // Use localStorage for custom OTP auth state
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('kora-jwt'));
  const [profile, setProfile] = useState(() => getStoredProfile());


  React.useEffect(() => {
    // Check for auth state changes (simple polling/event approach)
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('kora-jwt'));
      setProfile(getStoredProfile());
    };

    
    window.addEventListener('storage', checkAuth);
    const interval = setInterval(checkAuth, 1000);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('kora-jwt');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  // For hash links on home, plain anchors; otherwise navigate to /#xxx
  const hashLink = (hash: string) => isHome ? `#${hash}` : `/#${hash}`;
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/70 backdrop-blur-xl transition-colors duration-300 glass-strong smooth-pop">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-baseline gap-0">
          <span className="font-heading font-bold text-xl tracking-tight text-primary">
            KORA
          </span>
          <span className="font-heading font-bold text-xl tracking-tight text-foreground">
            .RW
          </span>
        </Link>

      
        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-muted-foreground">
          <a
            href={hashLink('how')}
            className="transition-colors duration-300 hover:text-foreground">
            
            {t.nav.how}
          </a>
          <a
            href={hashLink('traffic-laws')}
            className="transition-colors duration-300 hover:text-foreground">
            
            {t.nav.laws}
          </a>
          <Link
            to="/packages"
            className="transition-colors duration-300 hover:text-foreground">
            {t.nav.packages}
          </Link>
          <Link
            to="/library"
            className="transition-colors duration-300 hover:text-foreground">
            {t.nav.library}
          </Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <LanguageToggle />
          <a
            href={hashLink('quiz')}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md">
            {t.nav.start}
          </a>

          {!isLoggedIn ? (
            <Link
              to="/register"
              className="text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground">
              Create account
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <img
                src={profile?.avatarUrl || getStoredProfile()?.avatarUrl || ''}
                alt=""
                className="h-8 w-8 rounded-full border border-border object-cover ring-2 ring-green-500"

              />
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground">
                Logout
              </button>
            </div>

          )}

        </div>

        {/* Mobile theme toggle (next to hamburger) */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />

          {/* Mobile Menu Toggle */}
          <button
            className="-mr-2 rounded-full p-2 text-foreground transition-colors duration-300 hover:bg-muted"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={t.nav.toggleMenu}>
            
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen &&
      <div
        className="md:hidden flex flex-col gap-2 border-t border-border bg-background/95 px-6 py-4 shadow-lg backdrop-blur-xl"
        onClick={() => setIsOpen(false)}>
        
          <a
          href={hashLink('how')}
          className="border-b border-border/50 py-3 text-sm font-medium transition-colors duration-300 hover:text-primary">
          
            {t.nav.how}
          </a>
          <a
          href={hashLink('traffic-laws')}
          className="border-b border-border/50 py-3 text-sm font-medium transition-colors duration-300 hover:text-primary">
          
            {t.nav.laws}
          </a>
          <Link
            to="/packages"
            className="border-b border-border/50 py-3 text-sm font-medium transition-colors duration-300 hover:text-primary">
            {t.nav.packages}
          </Link>
          <Link
            to="/library"
            className="border-b border-border/50 py-3 text-sm font-medium transition-colors duration-300 hover:text-primary">
            {t.nav.library}
          </Link>
          
          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className="border-b border-border/50 py-3 text-sm font-medium transition-colors duration-300 hover:text-primary">
                {t.nav.login}
              </Link>
              <Link
                to="/register"
                className="py-3 text-sm font-medium transition-colors duration-300 hover:text-primary">
                Create account
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="py-3 text-left text-sm font-medium transition-colors duration-300 hover:text-primary">
              Logout
            </button>
          )}

          <a
            href={hashLink('quiz')}
            className="mt-2 rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground transition-colors duration-300 hover:bg-primary/90">
            {t.nav.start}
          </a>
        </div>
      }
    </nav>);

}
