/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS || false;

// If deployed on GitHub Pages under https://<owner>.github.io/<repo>/
let basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
if (!basePath && isGithubActions) {
  const repo = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '';
  if (repo && !repo.endsWith('.github.io')) {
    basePath = `/${repo}`;
  }
}

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
