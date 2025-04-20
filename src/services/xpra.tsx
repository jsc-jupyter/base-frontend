import { SpawnerOptions, staticUrl } from '@/gloabals.ts';
import { ReactNode } from 'react';

export const displayName = 'Xpra (Remote Desktop)';
export const iconPath = staticUrl('images', 'services', 'xpra.svg');

// @ts-expect-error Allow unused
export function createConfigSummary(id: string, options: SpawnerOptions): ReactNode {
  return <></>;
}
