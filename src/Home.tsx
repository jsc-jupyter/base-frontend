import { createRoot } from 'react-dom/client';
import { Page } from './Page.tsx';

export function Home() {
  return <></>;
}

createRoot(document.getElementById('root')!).render(
  <Page>
    <Home />
  </Page>,
);
