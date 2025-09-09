export default function RootPage() {
  // This should never be reached due to middleware redirects
  // If it is reached, it indicates a middleware configuration issue
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='text-center'>
        <h1 className='mb-2 text-2xl font-semibold text-gray-900'>CodeFlow</h1>
        <p className='text-gray-600'>Redirecting...</p>
      </div>
    </div>
  );
}
