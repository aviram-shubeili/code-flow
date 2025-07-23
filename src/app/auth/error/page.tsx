import Link from 'next/link';

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;

  let errorMessage = 'There was an error signing you in. Please try again.';
  let errorTitle = 'Authentication Error';

  if (error === 'OAuthAccountNotLinked') {
    errorTitle = 'Account Already Exists';
    errorMessage =
      'An account with this email address already exists. Please sign in with your original provider or contact support.';
  }

  return (
    <div className='container mx-auto max-w-md p-8'>
      <div className='space-y-6 text-center'>
        <h1 className='text-2xl font-bold text-red-600'>{errorTitle}</h1>
        <p className='text-gray-600'>{errorMessage}</p>
        {error && (
          <div className='rounded bg-gray-100 p-3 text-sm'>
            <strong>Error Code:</strong> {error}
          </div>
        )}
        <Link
          href='/'
          className='inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
