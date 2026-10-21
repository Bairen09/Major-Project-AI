import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminLayout from '../layouts/AdminLayout';
import BloggerLayout from '../layouts/BloggerLayout';
import SupportLayout from '../layouts/SupportLayout';

import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import { LogoMark } from '../components/common/Logo';

// Lazy load pages
const Home = React.lazy(() => import('../pages/Home'));
const PublicBlogsList = React.lazy(() => import('../pages/PublicBlogsList'));
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
const MyTickets = React.lazy(() => import('../pages/dashboard/MyTickets'));

// Admin pages
const AdminDashboard = React.lazy(() => import('../pages/admin/AdminDashboard'));
const AdminUsers = React.lazy(() => import('../pages/admin/AdminUsers'));
const AdminBusinesses = React.lazy(() => import('../pages/admin/AdminBusinesses'));
const AdminAnalytics = React.lazy(() => import('../pages/admin/AdminAnalytics'));
const AdminAuditLogs = React.lazy(() => import('../pages/admin/AdminAuditLogs'));
const AdminPlatform = React.lazy(() => import('../pages/admin/AdminPlatform'));
const AdminSubscriptions = React.lazy(() => import('../pages/admin/AdminSubscriptions'));

const Features = React.lazy(() => import('../pages/Features'));
const HowItWorks = React.lazy(() => import('../pages/HowItWorks'));
const Solutions = React.lazy(() => import('../pages/Solutions'));
const Pricing = React.lazy(() => import('../pages/Pricing'));
const About = React.lazy(() => import('../pages/About'));

// Static SEO Pages
const PrivacyPolicy = React.lazy(() => import('../pages/static/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('../pages/static/TermsOfService'));
const RefundPolicy = React.lazy(() => import('../pages/static/RefundPolicy'));
const Contact = React.lazy(() => import('../pages/static/Contact'));
const Careers = React.lazy(() => import('../pages/static/Careers'));
const Integrations = React.lazy(() => import('../pages/static/Integrations'));
const HelpCenter = React.lazy(() => import('../pages/static/HelpCenter'));
const Guides = React.lazy(() => import('../pages/static/Guides'));
const APIDocs = React.lazy(() => import('../pages/static/APIDocs'));

// Support portal pages
const SupportLogin = React.lazy(() => import('../pages/support/SupportLogin'));
const SupportInbox = React.lazy(() => import('../pages/support/SupportInbox'));
const SupportStats = React.lazy(() => import('../pages/support/SupportStats'));

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
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/refund" element={<RefundPolicy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/api-docs" element={<APIDocs />} />
          <Route path="/blogs" element={<PublicBlogsList />} />
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
            <Route path="/dashboard/tickets" element={<MyTickets />} />
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
            <Route path="/admin/notifications" element={<Notifications />} />
            <Route path="/admin/blogs" element={<BlogsList />} />
            <Route path="/admin/blogs/new" element={<BlogEditor />} />
            <Route path="/admin/blogs/:id/edit" element={<BlogEditor />} />
            <Route path="/admin/blogs/:id" element={<BlogView />} />
            <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
          </Route>
        </Route>

        {/* Protected Blogger Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<BloggerLayout />}>
            <Route path="/blogger" element={<Navigate to="/blogger/blogs" replace />} />
            <Route path="/blogger/blogs" element={<BlogsList />} />
            <Route path="/blogger/notifications" element={<Notifications />} />
            <Route path="/blogger/new" element={<BlogEditor />} />
            <Route path="/blogger/:id/edit" element={<BlogEditor />} />
            <Route path="/blogger/:id" element={<BlogView />} />
            <Route path="/blogger/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Support Portal Routes — staff only, no ProtectedRoute needed (SupportLayout checks staffToken) */}
        <Route path="/support/login" element={<SupportLogin />} />
        <Route element={<SupportLayout />}>
          <Route path="/support" element={<Navigate to="/support/inbox" replace />} />
          <Route path="/support/inbox" element={<SupportInbox />} />
          <Route path="/support/stats" element={<SupportStats />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
