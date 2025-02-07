/* eslint-disable react/no-multi-comp */
import type { JSX } from 'react';
import {
  type IconDefinition,
  faGithub,
  faLinkedinIn,
} from '@fortawesome/free-brands-svg-icons';
import { faAt, faFile } from '@fortawesome/free-solid-svg-icons';

function FaIcon({
  icon: fa,
  size = '1em',
}: Readonly<{ icon: IconDefinition; size?: string }>): JSX.Element {
  const { 0: width, 1: height, 4: path } = fa.icon;
  return (
    <svg
      aria-hidden
      fill="currentColor"
      role="img"
      style={{
        fill: 'currentColor',
        maxHeight: size,
        maxWidth: size,
        width: '100%',
      }}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {(Array.isArray(path) ? path : [path])
        .map((drawPath, layer) => [layer, drawPath] as const)
        .map(([layer, drawPath]) => (
          <path d={drawPath} key={layer} />
        ))}
    </svg>
  );
}

export function At(props: Readonly<{ size?: string }>): JSX.Element {
  return <FaIcon icon={faAt} {...props} />;
}

export function File(props: Readonly<{ size?: string }>): JSX.Element {
  return <FaIcon icon={faFile} {...props} />;
}

export function GitHub(props: Readonly<{ size?: string }>): JSX.Element {
  return <FaIcon icon={faGithub} {...props} />;
}

export function LinkedIn(props: Readonly<{ size?: string }>): JSX.Element {
  return <FaIcon icon={faLinkedinIn} {...props} />;
}
