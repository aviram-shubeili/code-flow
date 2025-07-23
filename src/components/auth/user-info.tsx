import { getCurrentUser } from '@/lib/authUtils';
import { SignInButton } from './signin-button';
import { SignOutButton } from './signout-button';

export async function UserInfo() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className='flex items-center gap-4'>
        <span className='text-sm text-gray-500'>Not signed in</span>
        <SignInButton />
      </div>
    );
  }

  return (
    <div className='flex items-center gap-4'>
      <div className='flex items-center gap-2'>
        {user.image && (
          <img
            src={user.image}
            alt={user.name || 'User'}
            className='h-8 w-8 rounded-full'
          />
        )}
        <span className='text-sm font-medium'>{user.name || user.email}</span>
      </div>
      <SignOutButton />
    </div>
  );
}
