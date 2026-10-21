import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import CommonFAQ from '../components/common/CommonFAQ';

export default function MainLayout() {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
        <CommonFAQ />
      </main>
      <Footer />
    </div>
  );
}
