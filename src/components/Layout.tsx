import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Nav } from './Nav';
import { Footer } from './Footer';
export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (!location.hash) window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has('tx_ref') || (params.get('status') === 'successful' && params.has('transaction_id'))) {
      navigate(`/verify${location.search}`, { replace: true });
    }
  }, [location.pathname, location.search, navigate]);
  return (
    <div className="min-h-screen flex flex-col bg-background font-heading">
      <Nav />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>);
}