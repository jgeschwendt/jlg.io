export const palindrome = (term: number | string): boolean => (
  (string: string): boolean => string === Array.from(string).reverse().join('')
)(term.toString());
