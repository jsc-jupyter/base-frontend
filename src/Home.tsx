import { createRoot } from 'react-dom/client';
import { Page } from '@/Page.tsx';

export function Home() {
  return <Page>ToDo!</Page>;
}

createRoot(document.getElementById('root')!).render(<Home />);
