import type { JSX } from 'react';

// Phosphor Icons (MIT, https://phosphoricons.com), drawn on a 256-unit grid.
function PhosphorIcon({
  path,
  size = '1em',
}: Readonly<{ path: string; size?: string }>): JSX.Element {
  return (
    <svg
      aria-hidden
      fill="currentColor"
      role="img"
      style={{ fill: 'currentColor', maxHeight: size, maxWidth: size, width: '100%' }}
      viewBox="0 0 256 256"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={path} />
    </svg>
  );
}

// at · bold weight
export function At(properties: Readonly<{ size?: string }>): JSX.Element {
  return (
    <PhosphorIcon
      path="M128,20a108,108,0,0,0,0,216c22.27,0,45.69-6.73,62.64-18a12,12,0,1,0-13.29-20c-13,8.63-31.89,14-49.35,14a84,84,0,1,1,84-84c0,9.29-1.67,17.08-4.69,21.95-2.64,4.24-6,6.05-11.31,6.05s-8.67-1.81-11.31-6.05c-3-4.87-4.69-12.66-4.69-21.95V88a12,12,0,0,0-23.49-3.46,52,52,0,1,0,8.86,79.57C172.3,174.3,182.81,180,196,180c24.67,0,40-19.92,40-52A108.12,108.12,0,0,0,128,20Zm0,136a28,28,0,1,1,28-28A28,28,0,0,1,128,156Z"
      {...properties}
    />
  );
}

// file · fill weight
export function File(properties: Readonly<{ size?: string }>): JSX.Element {
  return (
    <PhosphorIcon
      path="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM152,88V44l44,44Z"
      {...properties}
    />
  );
}

// github-logo · fill weight
export function GitHub(properties: Readonly<{ size?: string }>): JSX.Element {
  return (
    <PhosphorIcon
      path="M216,104v8a56.06,56.06,0,0,1-48.44,55.47A39.8,39.8,0,0,1,176,192v40a8,8,0,0,1-8,8H104a8,8,0,0,1-8-8V216H72a40,40,0,0,1-40-40A24,24,0,0,0,8,152a8,8,0,0,1,0-16,40,40,0,0,1,40,40,24,24,0,0,0,24,24H96v-8a39.8,39.8,0,0,1,8.44-24.53A56.06,56.06,0,0,1,56,112v-8a58.14,58.14,0,0,1,7.69-28.32A59.78,59.78,0,0,1,69.07,28,8,8,0,0,1,76,24a59.75,59.75,0,0,1,48,24h24a59.75,59.75,0,0,1,48-24,8,8,0,0,1,6.93,4,59.74,59.74,0,0,1,5.37,47.68A58,58,0,0,1,216,104Z"
      {...properties}
    />
  );
}
