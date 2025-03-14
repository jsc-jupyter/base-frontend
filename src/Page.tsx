import { ReactNode, StrictMode, useEffect } from 'react';
import { cleanupSse, initSse } from './sse.ts';
import { jupyterHubData } from './gloabals.ts';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import './assets/css/index.css';

export function Page({ children }: { children: ReactNode }) {
  useEffect(() => {
    initSse(jupyterHubData.baseUrl, jupyterHubData.user, jupyterHubData.xsrfToken);

    return cleanupSse;
  });

  return (
    <>
      <StrictMode>
        <Header />
        <main>{children}</main>
        <Footer />
      </StrictMode>
    </>
  );
}
