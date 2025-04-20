/**
 * This file defines various global vaiables, which will be filled with the actual values when rendering by jinja2
 */
import urlJoin from 'url-join';

type IncidentCheck = {
  interval: number;
  url: string;
  services: Record<string, number>;
  healthThreshold: {
    interactive: number;
    compute: number;
  };
};

type SystemConfiguration = {
  interactivePartitions: [number];
  weight: number;
  backendService: string;
  maxPerUser?: {
    default: number;
  };
};

export interface SpawnerOptions {
  name: string;
  service: string;
  profile: string;
  system: string;
  secret_keys?: unknown[];
}

type FrontendCollection = {
  hostname: string;
  incidentCheck: IncidentCheck;
  systemConfig: Record<string, SystemConfiguration>;
  mapSystems: Record<string, string>;
  mapPartitions: Record<string, string>;
  defaultPartitions: Record<string, [string]>;
  serviceConfig: Record<string, object>;
  decrypted_user_options: Record<string, SpawnerOptions>;
};

export const frontendCollection: FrontendCollection = JSON.parse(
  document.getElementById('data-frontendCollection')?.textContent ?? '{}',
);

export function getJupyterName() {
  switch (frontendCollection.hostname) {
    case 'portal.gauss-centre.eu':
      return 'GaussCentre Portal';
    case 'portal-staging.gauss-centre.eu':
      return 'GaussCentre StagingPortal';
    default:
      return 'Jupyter-JSC';
  }
}

type JupyterHubData = {
  baseUrl: string;
  prefix: string;
  user?: string;
  userActive: boolean;
  adminAccess: boolean;
  optionsForm: boolean;
  cancelUrl?: string;
  xsrfToken: string;
};

export const jupyterHubData: JupyterHubData = JSON.parse(
  document.getElementById('data-jupyterHubData')?.textContent ?? '{}',
);

const staticUrlBase: string = document.getElementById('data-staticUrlBase')?.textContent?.trim() ?? '/';

export function staticUrl(...paths: string[]) {
  return urlJoin(staticUrlBase, ...paths);
}

// ToDo: Convert to camelcase somehow?
type OAuthUser = {
  name?: string;
};

type AuthState = {
  access_token: string;
  refresh_token: string;
  id_token: string;
  scope: string[];
  oauth_user?: OAuthUser;
  groups: string[];
};

export const authState: AuthState = JSON.parse(document.getElementById('data-authState')?.textContent ?? '{}');
