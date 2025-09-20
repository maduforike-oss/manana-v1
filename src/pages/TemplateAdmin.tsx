import React from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import { TemplateManager } from '@/components/admin/TemplateManager';

const TemplateAdminPage: React.FC = () => {
  return (
    <RequireAuth>
      <TemplateManager />
    </RequireAuth>
  );
};

export default TemplateAdminPage;