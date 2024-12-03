import type { JSX } from 'react';

/* @see https://fontawesome.com/icons/file */
export function File(): JSX.Element {
  return (
    <svg
      aria-hidden="true"
      dangerouslySetInnerHTML={{
        __html: [
          '<!--!Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->',
          '<path d="M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 288c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128z" />',
        ].join(''),
      }}
      fill="currentColor"
      height="1em"
      role="img"
      viewBox="0 0 384 512"
      xmlns="http://www.w3.org/2000/svg"
    />
  );
}
