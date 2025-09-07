import { StudioHub } from '../studio/StudioHub';
import { UnifiedStudioShell } from '../studio/UnifiedStudioShell';
import { useAppStore } from '../../store/useAppStore';

export const StudioPage = () => {
  const { currentDesign } = useAppStore();
  
  // If there's a current design, show the unified studio shell, otherwise show the hub
  if (currentDesign) {
    return <UnifiedStudioShell />;
  }
  
  return <StudioHub />;
};