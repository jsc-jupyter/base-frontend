import * as JupyterLab from './jupyterlab.tsx';
import * as Xpra from './xpra.tsx';
import * as Repo2Docker from './repo2docker.tsx';
import { ReactNode } from 'react';
import { SpawnerOptions } from '@/gloabals.ts';

type ServiceProperties = {
  displayName: string;
  iconPath: string;
  createConfigSummary: (id: string, options: SpawnerOptions) => ReactNode;
};

export const services: Record<string, ServiceProperties> = {
  jupyterlab: JupyterLab,
  xpra: Xpra,
  repo2docker: Repo2Docker,
};
