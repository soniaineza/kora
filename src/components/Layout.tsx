import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Nav } from './Nav';
import { Footer } from './Footer';
export function Layout() {
  const location = useLocation();
  // Scroll to top on route change (except hash routes)
  useEffect(() => {
    if (!location.hash) window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);
  return (
    <div className="min-h-screen flex flex-col bg-background font-heading">
      <Nav />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>);

}