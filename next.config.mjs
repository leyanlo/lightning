import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  disable: process.env.NODE_ENV === 'development',
  globPublicPatterns: ['**/*', '!workbox-*.js', '!workbox-*.js.map'],
  swDest: 'public/sw.js',
  swSrc: 'sw.ts',
});

export default withSerwist({
  outputFileTracingRoot: process.cwd(),
  reactStrictMode: true,
});
