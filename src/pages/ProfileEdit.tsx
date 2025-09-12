import { BrandHeader } from '@/components/ui/brand-header';
import { ProfileSettingsForm } from '@/components/profile/ProfileSettingsForm';
import RequireAuth from '@/components/auth/RequireAuth';
import BackButton from '@/components/BackButton';

export default function ProfileEdit() {
  return (
    <RequireAuth>
      <div className="h-full bg-background overflow-auto modern-scroll">
        <BrandHeader 
          title="Edit Profile" 
          subtitle="Update your profile information"
        >
          <BackButton fallback="/profile" />
        </BrandHeader>

        <div className="container mx-auto py-6 px-4 max-w-4xl">
          <ProfileSettingsForm />
        </div>
      </div>
    </RequireAuth>
  );
}