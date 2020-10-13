import React from 'react';

// http://entypo.com/
const entypo = {
  'github-with-circle': 'M10.015,9.949c0,0-0.01,0-0.015,0H9.985c-1.191,0-2.24-0.303-2.861,0.268  c-0.371,0.342-0.527,0.754-0.527,1.197c0,1.852,1.483,2.08,3.389,2.08h0.029c1.905,0,3.389-0.229,3.389-2.08  c0-0.443-0.156-0.856-0.527-1.197C12.255,9.646,11.206,9.949,10.015,9.949z M8.393,12.48c-0.363,0-0.656-0.408-0.656-0.91  s0.293-0.908,0.656-0.908S9.05,11.068,9.05,11.57C9.051,12.072,8.757,12.48,8.393,12.48z M11.606,12.48  c-0.363,0-0.657-0.408-0.657-0.91s0.294-0.908,0.657-0.908c0.362,0,0.656,0.406,0.656,0.908  C12.263,12.072,11.969,12.48,11.606,12.48z M10,0.4c-5.302,0-9.6,4.298-9.6,9.6s4.298,9.6,9.6,9.6s9.6-4.298,9.6-9.6  S15.302,0.4,10,0.4z M10.876,13.939c-0.172,0-0.514,0-0.876,0.002c-0.362-0.002-0.704-0.002-0.876-0.002  c-0.76,0-3.772-0.059-3.772-3.689c0-0.834,0.286-1.445,0.755-1.955c-0.074-0.184-0.078-1.232,0.32-2.236c0,0,0.916,0.1,2.301,1.051  C9.017,7.029,9.509,6.988,10,6.988s0.982,0.041,1.273,0.121c1.385-0.951,2.301-1.051,2.301-1.051  c0.398,1.004,0.395,2.053,0.32,2.236c0.469,0.51,0.755,1.121,0.755,1.955C14.648,13.881,11.636,13.939,10.876,13.939z',
  'linkedin-with-circle': 'M10,0.4c-5.302,0-9.6,4.298-9.6,9.6s4.298,9.6,9.6,9.6s9.6-4.298,9.6-9.6S15.302,0.4,10,0.4z M7.65,13.979  H5.706V7.723H7.65V13.979z M6.666,6.955c-0.614,0-1.011-0.435-1.011-0.973c0-0.549,0.409-0.971,1.036-0.971s1.011,0.422,1.023,0.971  C7.714,6.52,7.318,6.955,6.666,6.955z M14.75,13.979h-1.944v-3.467c0-0.807-0.282-1.355-0.985-1.355  c-0.537,0-0.856,0.371-0.997,0.728c-0.052,0.127-0.065,0.307-0.065,0.486v3.607H8.814v-4.26c0-0.781-0.025-1.434-0.051-1.996h1.689  l0.089,0.869h0.039c0.256-0.408,0.883-1.01,1.932-1.01c1.279,0,2.238,0.857,2.238,2.699V13.979z',
  'mail-with-circle': 'M10,0.3999634c-5.3019409,0-9.5999756,4.2980957-9.5999756,9.6000366S4.6980591,19.5999756,10,19.5999756  S19.5999756,15.3019409,19.5999756,10S15.3019409,0.3999634,10,0.3999634z M6.2313232,7h7.5195923  c0.3988037,0,0.1935425,0.5117188-0.0234985,0.6430664c-0.217041,0.1308594-3.2213135,1.9470215-3.333313,2.0144043  s-0.256958,0.0996094-0.402771,0.0996094c-0.145874,0-0.2908325-0.0322266-0.402771-0.0996094  C9.4765625,9.5900879,6.472229,7.7739258,6.255188,7.6430664C6.038208,7.5117188,5.8328857,7,6.2313232,7z M14,12.5  c0,0.2099609-0.251709,0.5-0.444458,0.5H6.444458C6.251709,13,6,12.7099609,6,12.5c0,0,0-3.5544434,0-3.6467285  c0-0.0917969-0.001709-0.2114258,0.171875-0.109375c0.246521,0.1445312,3.265625,1.9250488,3.416687,2.013916  c0.151001,0.0888672,0.256897,0.0995483,0.402771,0.0995483c0.145813,0,0.251709-0.0106812,0.402771-0.0995483  s3.1875-1.8688965,3.434021-2.0134277C14.001709,8.642334,14,8.7619629,14,8.8537598C14,8.9460449,14,12.5,14,12.5z',
};

// eslint-disable-next-line react/display-name
const Icon = (icon: keyof typeof entypo, name: string) => (props: React.SVGProps<SVGSVGElement>): JSX.Element => (
  <svg name={name} height="1em" width="1em" viewBox="0 0 20 20" {...props}>
    <path d={entypo[icon]} fill="currentColor" />
  </svg>
);

export const Entypo = {
  GitHubWithCircle:    Icon('github-with-circle',    'GitHub with circle'),
  LinkedInWithCircle:  Icon('linkedin-with-circle',  'LinkedIn with circle'),
  MailWithCircle:      Icon('mail-with-circle',      'Mail with circle'),
};
