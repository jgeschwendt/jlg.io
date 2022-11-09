import { statement } from './statement';

export default function Head() {
  return (
    <>
      <title>{'Joshua L Geschwendt—Web Engineer'}</title>
      <meta name="description" content={statement()} />
    </>
  );
}
