import {StrictMode, useEffect} from 'react'
import { createRoot } from 'react-dom/client'
import {cleanupSse, initSse} from "./sse.ts";

export function Home() {
    useEffect(() => {
        // @ts-expect-error ToDo
        initSse(window.jhdata.base_url, window.jhdata.user, window.jhdata.xsrf_token)

        return cleanupSse
    })

    return <>

    </>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Home />
  </StrictMode>,
)
