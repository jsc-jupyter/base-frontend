import urlJoin from 'url-join';
import { jupyterHubData } from '@/gloabals.ts';

function encodeUriComponents(uri: string): string {
  return urlJoin(uri.split('/').map(encodeURIComponent));
}

type ApiRequestOptions = {
  method?: string;
  responseType?: XMLHttpRequestResponseType;
  data?: Document | XMLHttpRequestBodyInit;
};

function apiRequest(path: string, options: ApiRequestOptions = {}) {
  const request = new XMLHttpRequest();
  request.responseType = options.responseType ?? 'json';

  // Retry when we get a 503
  let maxTries = 5;
  request.onerror = function (this: XMLHttpRequest) {
    if (this.status == 503) {
      maxTries--;
      if (maxTries >= 0) {
        this.send(options.data);
        return;
      }
      return;
    }
  };

  let url = urlJoin(jupyterHubData.baseUrl, 'api', encodeUriComponents(path));

  // Add xsrf token to url parameter
  if (jupyterHubData.xsrfToken) {
    url = urlJoin(url, '?_xsrf=', jupyterHubData.xsrfToken);
  }

  request.open(options.method ?? 'GET', url);
  request.send(options.data);
}

export function startServer(user: string, options: ApiRequestOptions) {
  const url = urlJoin('users', user, 'server');
  apiRequest(url, { method: 'POST', responseType: '', ...options });
}

export function startNamedServer(user: string, server_name: string, options: ApiRequestOptions) {
  const url = urlJoin('users', user, 'encryptedservers', server_name);
  apiRequest(url, { method: 'POST', responseType: '', ...options });
}

export function updateNamedServer(user: string, server_name: string, options: ApiRequestOptions) {
  const url = urlJoin('users', user, 'servers', server_name, 'update');
  apiRequest(url, { method: 'POST', responseType: '', ...options });
}

export function shareServer(options: ApiRequestOptions) {
  const url = urlJoin('share', 'user_options');
  apiRequest(url, { method: 'POST', responseType: '', ...options });
}

export function stopServer(user: string, options: ApiRequestOptions) {
  const url = urlJoin('users', user, 'server');
  apiRequest(url, { method: 'DELETE', responseType: '', ...options });
}

export function stopNamedServer(user: string, server_name: string, options: ApiRequestOptions) {
  const url = urlJoin('users', user, 'servers', server_name);
  apiRequest(url, { method: 'DELETE', responseType: '', ...options });
}

export function cancelNamedServer(user: string, server_name: string, options: ApiRequestOptions) {
  const data = JSON.stringify({
    failed: true,
    progress: 100,
  });
  const url = urlJoin('users', 'progress', 'events', user, server_name);
  apiRequest(url, { method: 'POST', data: data, ...options });
}

export function cancelServer(user: string, options: ApiRequestOptions) {
  const data = JSON.stringify({
    failed: true,
    progress: 100,
    html_message: '<details><summary>Start cancelled.</summary></details>',
  });
  const url = urlJoin('users', 'progress', 'events', user);
  apiRequest(url, { method: 'POST', data: data, ...options });
}

export function deleteNamedServer(user: string, server_name: string, options: ApiRequestOptions) {
  const data = JSON.stringify({ remove: true });
  stopNamedServer(user, server_name, { data: data, ...options });
}

export function createTemplate(user: string, server_name: string, options: ApiRequestOptions) {
  const url = urlJoin('templates', user, server_name);
  apiRequest(url, { method: 'POST', responseType: '', ...options });
}

export function listUsers(options: ApiRequestOptions) {
  apiRequest('users', options);
}

export function getUser(user: string, options: ApiRequestOptions) {
  apiRequest(urlJoin('users', user), options);
}

export function addUsers(usernames: string[], userinfo: object, options: ApiRequestOptions) {
  const data = { ...userinfo, usernames: usernames };
  apiRequest('users', { method: 'POST', responseType: '', data: JSON.stringify(data), ...options });
}

export function editUser(user: string, userinfo: object, options: ApiRequestOptions) {
  const url = urlJoin('users', user);
  apiRequest(url, { method: 'PATCH', responseType: '', data: JSON.stringify(userinfo), ...options });
}
