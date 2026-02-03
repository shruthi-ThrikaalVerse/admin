import React from 'react';
import { Navigate } from 'react-router-dom';

// SystemAdmin page has been removed. Redirecting to dashboard if accessed.
const SystemAdmin: React.FC = () => {
  return <Navigate to="/" replace />;
};

export default SystemAdmin;
