import { auth } from '@/auth';
import { UserInfo } from '@/components/auth/user-info';

export default async function DashboardPage() {
  // This page is protected by middleware, so we know the user is authenticated
  const session = await auth();

  return (
    <div className='container mx-auto p-8'>
      <div className='mb-8'>
        <UserInfo />
      </div>

      <h1 className='mb-8 text-3xl font-bold'>Protected Dashboard</h1>

      <div className='space-y-4'>
        <p>Welcome to your protected dashboard, {session?.user?.name}!</p>
        <p className='text-gray-600'>
          This page is only accessible to authenticated users. The middleware
          automatically redirected you here after authentication.
        </p>

        <div className='rounded-md bg-gray-100 p-4'>
          <h3 className='mb-2 font-medium'>User Info:</h3>
          <pre className='text-sm'>
            {JSON.stringify(session?.user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
