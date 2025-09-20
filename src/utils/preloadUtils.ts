// Preload critical resources
export const preloadCriticalAssets = () => {
  const criticalAssets = [
    '/public/brand/manana-logo.png',
    '/public/brand/manana-mark@256.png',
  ];

  criticalAssets.forEach(asset => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = asset;
    document.head.appendChild(link);
  });
};

// Preload next route components
export const preloadRouteComponent = async (route: string) => {
  try {
    switch (route) {
      case '/studio':
        await import('../components/studio/UnifiedStudioShell');
        break;
      case '/profile':
        await import('../pages/ProfileHub');
        break;
      case '/admin':
        await import('../pages/AdminTemplates');
        break;
      default:
        break;
    }
  } catch (error) {
    console.warn(`Failed to preload component for route ${route}:`, error);
  }
};

// Smart preloading based on user behavior
export const setupIntelligentPreloading = () => {
  let hoverTimeout: NodeJS.Timeout;

  document.addEventListener('mouseover', (e) => {
    const link = (e.target as Element).closest('a[href]') as HTMLAnchorElement;
    if (link && link.href.includes(window.location.origin)) {
      hoverTimeout = setTimeout(() => {
        const path = new URL(link.href).pathname;
        preloadRouteComponent(path);
      }, 100); // Small delay to avoid preloading on quick hovers
    }
  });

  document.addEventListener('mouseout', () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
  });
};

// Preload images based on viewport proximity
export const createImagePreloader = () => {
  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    },
    {
      rootMargin: '50px'
    }
  );

  return imageObserver;
};

// Resource hints for external dependencies
export const addResourceHints = () => {
  const hints = [
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//api.supabase.co' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
  ];

  hints.forEach(hint => {
    const link = document.createElement('link');
    Object.assign(link, hint);
    document.head.appendChild(link);
  });
};