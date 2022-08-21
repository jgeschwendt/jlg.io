const mq = (bp: number) => `@media (min-width: ${bp}px)`;

export const bp = {
  up: {
    sm: mq(576),
    md: mq(768),
    lg: mq(992),
    xl: mq(1200),
  },
};
