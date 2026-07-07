import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminLayout from '../layouts/AdminLayout';

import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import { LogoMark } from '../components/common/Logo';

// Lazy load pages
const Home = React.lazy(() => import('../pages/Home'));
const PublicBlogView = React.lazy(() => import('../pages/PublicBlogView'));
const Login = React.lazy(() => import('../pages/Login'));
const Register = React.lazy(() => import('../pages/Register'));
const Dashboard = React.lazy(() => import('../pages/dashboard/Dashboard'));
const AIGenerator = React.lazy(() => import('../pages/dashboard/AIGenerator'));
const SavedPosts = React.lazy(() => import('../pages/dashboard/SavedPosts'));
const Calendar = React.lazy(() => import('../pages/dashboard/Calendar'));
const Settings = React.lazy(() => import('../pages/dashboard/Settings'));
const Analytics = React.lazy(() => import('../pages/dashboard/Analytics'));
const Profile = React.lazy(() => import('../pages/dashboard/Profile'));
const Notifications = React.lazy(() => import('../pages/dashboard/Notifications'));
const Team = React.lazy(() => import('../pages/dashboard/Team'));
const BlogsList = React.lazy(() => import('../pages/dashboard/BlogsList'));
const BlogEditor = React.lazy(() => import('../pages/dashboard/BlogEditor'));
const BlogView = React.lazy(() => import('../pages/dashboard/BlogView'));

// Admin pages
const AdminDashboard = React.lazy(() => import('../pages/admin/AdminDashboard'));
const AdminUsers = React.lazy(() => import('../pages/admin/AdminUsers'));
const AdminBusinesses = React.lazy(() => import('../pages/admin/AdminBusinesses'));
const AdminAnalytics = React.lazy(() => import('../pages/admin/AdminAnalytics'));
const AdminAuditLogs = React.lazy(() => import('../pages/admin/AdminAuditLogs'));
const AdminPlatform = React.lazy(() => import('../pages/admin/AdminPlatform'));

const Features = React.lazy(() => import('../pages/Features'));
const HowItWorks = React.lazy(() => import('../pages/HowItWorks'));
const Solutions = React.lazy(() => import('../pages/Solutions'));
const Pricing = React.lazy(() => import('../pages/Pricing'));
const About = React.lazy(() => import('../pages/About'));

const Loader = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#0A0A0B]">
    <div className="animate-pulse"><LogoMark className="h-12 w-12" /></div>
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public Routes with MainLayout (Navbar & Footer) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog/:id" element={<PublicBlogView />} />
          <Route path="/blog/:id/:slug" element={<PublicBlogView />} />
        </Route>

        {/* Auth Routes (Login, Register) - Accessible only if NOT logged in */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Route>

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Add placeholder routes to avoid 404s when navigating sidebars */}
            <Route path="/dashboard/generate" element={<AIGenerator />} />
            <Route path="/dashboard/posts" element={<SavedPosts />} />
            <Route path="/dashboard/calendar" element={<Calendar />} />
            <Route path="/dashboard/analytics" element={<Analytics />} />
            <Route path="/dashboard/notifications" element={<Notifications />} />
            <Route path="/dashboard/team" element={<Team />} />
            <Route path="/dashboard/blogs" element={<BlogsList />} />
            <Route path="/dashboard/blogs/new" element={<BlogEditor />} />
            <Route path="/dashboard/blogs/:id/edit" element={<BlogEditor />} />
            <Route path="/dashboard/blogs/:id" element={<BlogView />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/dashboard/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/businesses" element={<AdminBusinesses />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
            <Route path="/admin/platform" element={<AdminPlatform />} />
            <Route path="/admin/blogs" element={<BlogsList />} />
            <Route path="/admin/blogs/new" element={<BlogEditor />} />
            <Route path="/admin/blogs/:id/edit" element={<BlogEditor />} />
            <Route path="/admin/blogs/:id" element={<BlogView />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
