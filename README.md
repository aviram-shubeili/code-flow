This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Branch Protection

The `main` branch is protected with the following rules:

### Required Status Checks

- **CI workflow** (`ci` job) must pass before merging

### Branch Protection Settings

Configure these in GitHub Repository Settings → Branches → Add branch protection rule:

1. **Branch name pattern:** `main`
2. **Require a pull request before merging:** ✅ Enabled
3. **Require status checks to pass before merging:** ✅ Enabled
   - Required check: `ci`
4. **Do not allow force pushes:** ✅ Enabled

### CI Workflow

The CI workflow (`.github/workflows/ci.yml`) runs on all pull requests to `main` and executes:

- Type checking (`npx tsc --noEmit`)
- Linting (`npm run lint`)
- Tests (`npm run test`)
- Build validation (`npm run build`)
