import * as JupyterLab from './jupyterlab.ts';
import * as Xpra from './xpra.ts';

type ServiceProperties = {
  displayName: string;
  iconPath: string;
  config: unknown;
};

export const services: Record<string, ServiceProperties> = {
  jupyterlab: {
    displayName: 'JupyterLab',
    iconPath: JupyterLab.iconpath,
    config: JupyterLab.config,
  },
  xpra: {
    displayName: 'Xpra',
    iconPath: Xpra.iconpath,
    config: {},
  },
};
