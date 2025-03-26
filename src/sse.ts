import { useState } from 'react';

let eventSource: EventSource | null = null;
const callbacks: Map<string, (data: unknown) => void> = new Map();

export function useSseEvent<T>(name: string, initialValue: T): T {
  const [data, setData] = useState<T>(initialValue);
  callbacks.set(name, setData as (data: unknown) => void);
  return data;
}

export function initSse(baseUrl: string, user?: string, xsrfToken?: string) {
  let sseUrl = `${baseUrl}api/sse`;
  if (user) {
    sseUrl += `/${user}`;
  }
  if (xsrfToken) {
    sseUrl += `?_xsrf=${xsrfToken}`;
  }

  if (eventSource) {
    eventSource.close();
  }

  eventSource = new EventSource(sseUrl);
  eventSource.onopen = () => {
    console.log('SSE Connection established');
  };
  eventSource.onmessage = (event: MessageEvent) => {
    try {
      const jsonData = JSON.parse(event.data);
      for (const [key, value] of Object.entries(jsonData)) {
        callbacks.get(key)?.call(null, value);
      }
    } catch (error) {
      console.error('Failed to parse SSE Message:', error);
    }
  };
  eventSource.onerror = event => {
    console.error('SSE Error: ', event);
  };
}

export function cleanupSse() {
  if (eventSource) {
    eventSource.close();
  }
}
