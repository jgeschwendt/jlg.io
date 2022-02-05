declare module '*.svg?svgr' {
  const JSXElement = (props: Record<string, unknown>) => JSX.Element;

  export default JSXElement;
}
