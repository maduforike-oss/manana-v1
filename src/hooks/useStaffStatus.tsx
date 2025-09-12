import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { isUserStaff } from '@/lib/garmentTemplates';

/**
 * Hook to check if the current user has staff privileges
 */
export function useStaffStatus() {
  const { user } = useAuth();
  const [isStaff, setIsStaff] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkStaffStatus = async () => {
      if (!user) {
        setIsStaff(false);
        setIsLoading(false);
        return;
      }

      try {
        const staffStatus = await isUserStaff();
        if (mounted) {
          setIsStaff(staffStatus);
        }
      } catch (error) {
        console.error('Error checking staff status:', error);
        if (mounted) {
          setIsStaff(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkStaffStatus();

    return () => {
      mounted = false;
    };
  }, [user]);

  return { isStaff, isLoading };
}