import { Layout } from '@/components/layout/Layout';
import { MyProfilePage } from '@/components/profile/MyProfilePage';

export default function TeacherProfile() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your profile photo and account settings
          </p>
        </div>

        <MyProfilePage
          photoLabel="Profile Photo"
          onPhotoChange={(url) => {
            console.log('Teacher profile photo updated:', url);
          }}
        />
      </div>
    </Layout>
  );
}
