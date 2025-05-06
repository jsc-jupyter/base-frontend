import jupyterLabService from './jupyterlab.tsx';
import xpraService from './xpra.tsx';
import repo2dockerService from './repo2docker.tsx';
import { ReactNode } from 'react';
import { SpawnerOptions } from '@/gloabals.ts';
import { ServiceConfig } from '@/components/table/config.ts';

export type SummaryButtonType = 'start' | 'open' | 'stop' | 'cancel' | 'delete' | 'na';

type summaryButton = (service: string, row: string, element: HTMLButtonElement | null) => void;

export type ServiceProperties = {
  displayName: string;
  iconPath: string;
  config: ServiceConfig;
  createConfigSummary: (id: string, options: SpawnerOptions) => ReactNode;
  summaryButtons: Partial<Record<SummaryButtonType, summaryButton>>;
};

export const services: Record<string, ServiceProperties> = {
  jupyterlab: jupyterLabService,
  xpra: xpraService,
  repo2docker: repo2dockerService,
};
