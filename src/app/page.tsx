import { useId } from 'react';
import Content from './main';

export default function Page() {
  const id = useId();
  return (
    <main className="flex items-center justify-center" id={id}>
      <Content />
    </main>
  );
}
