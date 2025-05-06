import { SpawnerOptions, staticUrl } from '@/gloabals.ts';
import { ReactNode } from 'react';
import { ServiceProperties } from '@/services/index.ts';

// @ts-expect-error Allow Unused
function createConfigSummary(id: string, options: SpawnerOptions): ReactNode {
  return <></>;
}

const xpraService: ServiceProperties = {
  displayName: 'Xpra (Remote Desktop)',
  iconPath: staticUrl('images', 'services', 'xpra.svg'),
  config: { navbar: {}, tabs: {} },
  createConfigSummary: createConfigSummary,
  summaryButtons: {},
};

export default xpraService;
