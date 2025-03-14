import { useState } from 'react';

let eventSource: EventSource | null = null;
const callbacks: Map<string, (data: object) => void> = new Map();

export function useSseEvent(name: string): object | undefined {
  const [data, setData] = useState<object>({});
  callbacks.set(name, setData);
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
  eventSource.onmessage = (event: MessageEvent) => {
    try {
      const jsonData = JSON.parse(event.data) as object;
      for (const [key, value] of Object.entries(jsonData)) {
        callbacks.get(key)?.call(null, value);
      }
    } catch (event) {
      console.error(`Failed to parse SSE Message: ${event}`);
    }
  };
  eventSource.onerror = (event: Event) => {
    console.error(`SSE Error: ${event}`);
  };
}

export function cleanupSse() {
  if (eventSource) {
    eventSource.close();
  }
}
