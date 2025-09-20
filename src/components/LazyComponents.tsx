import { lazy } from 'react';
import { ComponentType } from 'react';

// Lazy load heavy studio components
export const UnifiedStudioShell = lazy(() => 
  import('./studio/UnifiedStudioShell').then(module => ({
    default: module.UnifiedStudioShell
  }))
);

export const Canvas3D = lazy(() => 
  import('./studio/Canvas3D').then(module => ({
    default: module.Canvas3D
  }))
);

export const AIDesignCreator = lazy(() => 
  import('./studio/AIDesignCreator').then(module => ({
    default: module.AIDesignCreator
  }))
);

export const StudioHub = lazy(() => 
  import('./studio/StudioHub').then(module => ({
    default: module.StudioHub
  }))
);

// Marketplace components - using existing pages
export const Index = lazy(() => 
  import('../pages/Index')
);

// Profile components
export const ProfileHub = lazy(() => 
  import('../pages/ProfileHub')
);

export const ProfileEdit = lazy(() => 
  import('../pages/ProfileEdit')
);

export const ProfileSettings = lazy(() => 
  import('../pages/ProfileSettings').then(module => ({
    default: module.ProfileSettings
  }))
);

// Admin components
export const AdminTemplates = lazy(() => 
  import('../pages/AdminTemplates')
);

export const TemplatesUploader = lazy(() => 
  import('../pages/admin/TemplatesUploader')
);

// Heavy utility components
export const AdvancedFilters = lazy(() => 
  import('./marketplace/AdvancedFilters').then(module => ({
    default: module.AdvancedFilters
  }))
);

export const VirtualizedGrid = lazy(() => 
  import('./marketplace/VirtualizedGrid').then(module => ({
    default: module.VirtualizedGrid
  }))
);