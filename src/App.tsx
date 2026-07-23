import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { SuccessStories } from './pages/SuccessStories';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Library } from './pages/Library';
import { Exams } from './pages/Exams';
import { Packages } from './pages/Packages';
import { Buy } from './pages/Buy';
import { Verify } from './pages/Verify';
import { AdminOverview } from './pages/AdminOverview';
import { AdminSales } from './pages/AdminSales';
import { UserDashboard } from './pages/UserDashboard';

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="library" element={<Library />} />
          <Route path="packages" element={<Packages />} />
          <Route path="buy" element={<Buy />} />
          <Route path="verify" element={<Verify />} />
          <Route path="exams" element={<Exams />} />
          <Route path="stories" element={<SuccessStories />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="dashboard" element={<UserDashboard />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="sales" element={<AdminSales />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}