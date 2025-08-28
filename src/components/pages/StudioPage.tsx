import { StudioHub } from '../studio/StudioHub';
import { OptimizedStudioShell } from '../studio/OptimizedStudioShell';
import { useAppStore } from '../../store/useAppStore';

export const StudioPage = () => {
  const { currentDesign } = useAppStore();
  
  // If there's a current design, show the optimized studio shell, otherwise show the hub
  if (currentDesign) {
    return <OptimizedStudioShell />;
  }
  
  return <StudioHub />;
};