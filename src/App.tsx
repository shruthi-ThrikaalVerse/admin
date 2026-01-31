import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
  Navigate
} from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { HRMSProvider, useHRMS } from './context/HRMSContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Dashboard from './pages/Dashboard';
import EmployeeHub from './pages/EmployeeHub';
import DocumentManagement from './pages/DocumentManagement';
import AttendanceMonitor from './pages/AttendanceMonitor';
import LeaveCenter from './pages/LeaveCenter';
import Tasks from './pages/Tasks';
import EventsAdmin from './pages/EventsAdmin';
import NotificationsAdmin from './pages/NotificationsAdmin';
import PayrollProcessing from './pages/PayrollProcessing';
import PayslipsAdmin from './pages/PayslipsAdmin';
import PerformanceManagement from './pages/PerformanceManagement';
import SystemAdmin from './pages/SystemAdmin';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import TailwindTest from './pages/TailwindTest';
import AuditLogsPage from './pages/AuditLogs';

import { NAV_ITEMS } from './constants';

import Icon from './components/Icon';
import LayoutWrapper from './components/LayoutWrapper';
import { ProtectedRoute, PublicRoute } from './components/RouteGuards';










const App: React.FC = () => {
  return (
    <AuthProvider>
      <HRMSProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/" element={<ProtectedRoute><LayoutWrapper><Dashboard /></LayoutWrapper></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><LayoutWrapper><Dashboard /></LayoutWrapper></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute><LayoutWrapper><EmployeeHub /></LayoutWrapper></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><LayoutWrapper><DocumentManagement /></LayoutWrapper></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><LayoutWrapper><AttendanceMonitor /></LayoutWrapper></ProtectedRoute>} />
            <Route path="/leave" element={<ProtectedRoute><LayoutWrapper><LeaveCenter /></LayoutWrapper></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><LayoutWrapper><Tasks /></LayoutWrapper></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><LayoutWrapper><EventsAdmin /></LayoutWrapper></ProtectedRoute>} />
            <Route path="/notifications-admin" element={<ProtectedRoute><LayoutWrapper><NotificationsAdmin /></LayoutWrapper></ProtectedRoute>} />
            <Route path="/payroll" element={<ProtectedRoute><LayoutWrapper><PayrollProcessing /></LayoutWrapper></ProtectedRoute>} />
            <Route path="/payslips" element={<ProtectedRoute><LayoutWrapper><PayslipsAdmin /></LayoutWrapper></ProtectedRoute>} />
            <Route path="/performance" element={<ProtectedRoute><LayoutWrapper><PerformanceManagement /></LayoutWrapper></ProtectedRoute>} />
            <Route path="/system" element={<ProtectedRoute><LayoutWrapper><SystemAdmin /></LayoutWrapper></ProtectedRoute>} />
            <Route path="/audit-logs" element={<ProtectedRoute><AuditLogsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><LayoutWrapper><Profile /></LayoutWrapper></ProtectedRoute>} />
            <Route path="/tailwind-test" element={<ProtectedRoute><LayoutWrapper><TailwindTest /></LayoutWrapper></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </HRMSProvider>
    </AuthProvider>
  );
};

export default App;

