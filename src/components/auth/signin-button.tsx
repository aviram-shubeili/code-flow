import { signIn } from '@/auth';

export function SignInButton() {
  return (
    <form
      action={async () => {
        'use server';
        await signIn('github');
      }}
    >
      <button
        type='submit'
        className='inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'
      >
        Sign in with GitHub
      </button>
    </form>
  );
}
