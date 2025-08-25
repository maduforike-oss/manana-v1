import { StudioHub } from '../studio/StudioHub';
import { StudioShell } from '../studio/StudioShell';
import { useAppStore } from '../../store/useAppStore';

export const StudioPage = () => {
  const { currentDesign } = useAppStore();
  
  // If there's a current design, show the studio shell, otherwise show the hub
  if (currentDesign) {
    return <StudioShell />;
  }
  
  return <StudioHub />;
};