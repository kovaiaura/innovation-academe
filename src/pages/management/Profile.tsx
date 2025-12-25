import { Layout } from '@/components/layout/Layout';
import { MyProfilePage } from '@/components/profile/MyProfilePage';

export default function ManagementProfile() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and institution branding
          </p>
        </div>

        <MyProfilePage
          photoLabel="Institution Logo"
          onPhotoChange={(url) => {
            console.log('Institution logo updated:', url);
            // Could update institution settings here
          }}
        />
      </div>
    </Layout>
  );
}
