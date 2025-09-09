import { SignInButton } from '@/components/auth/signin-button';

export default function SignInPage() {
  return (
    <div className='container mx-auto max-w-md p-8'>
      <div className='space-y-6 text-center'>
        <h1 className='text-2xl font-bold'>Sign In to CodeFlow</h1>
        <p className='text-muted-foreground'>
          Connect your GitHub account to access your pull request dashboard.
        </p>
        <SignInButton />
      </div>
    </div>
  );
}
