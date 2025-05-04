import { SpawnerOptions, staticUrl } from '@/gloabals.ts';
import { ReactNode } from 'react';
import { ServiceConfig } from '@/components/table/config.ts';

export const displayName = 'Xpra (Remote Desktop)';
export const iconPath = staticUrl('images', 'services', 'xpra.svg');
export const config: ServiceConfig = { navbar: {}, tabs: {} };

// @ts-expect-error Allow unused
export function createConfigSummary(id: string, options: SpawnerOptions): ReactNode {
  return <></>;
}
