import '@tailwindcss/vite'; // ESM import of Tailwind
console.log('Tailwind loaded successfully.');

import('file:///c:/Users/70487/Downloads/m=milyarderrrrr/node_modules/@tailwindcss/node/dist/esm-cache.loader.mts')
  .then(() => console.log('Successfully imported!'))
  .catch((err) => {
    console.error('Failed to import:', err);
  });
