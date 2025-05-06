import { SpawnerOptions, staticUrl } from '@/gloabals.ts';
import { ConfigItem } from '@/components/table/ConfigItem.tsx';
import { ReactNode } from 'react';
import { default as config } from '@/assets/configs/jupyterlab_config.json';
import { ServiceProperties } from '@/services/index.ts';
import { ServiceConfig } from '@/components/table/config.ts';

interface JupyterLabCloudOptions extends SpawnerOptions {
  flavor: string;
}

function JupyterLabCloudConfigSummary({ id, options }: { id: string; options: JupyterLabCloudOptions }) {
  return (
    <>
      <ConfigItem name="Option" value={options.profile} id={`jupyterlab-${id}-config-td-option`} />
      <ConfigItem name="Flavor" value={options.flavor} id={`jupyterlab-${id}-config-td-flavor`} />
    </>
  );
}

interface JupyterLabHpcOptions extends SpawnerOptions {
  account: string;
  project: string;
  partition: string;
  reservation: string;
}

export function JupyterLabHpcConfigSummary({ id, options }: { id: string; options: JupyterLabHpcOptions }) {
  return (
    <>
      <ConfigItem name="Option" value={options.profile} id={`jupyterlab-${id}-config-td-option`} />
      <ConfigItem name="Project" value={options.project} id={`jupyterlab-${id}-config-td-project`} />
      <ConfigItem name="Partition" value={options.partition} id={`jupyterlab-${id}-config-td-partition`} />
    </>
  );
}

function createConfigSummary(id: string, options: SpawnerOptions): ReactNode {
  // ToDo: Do some proper parsing (maybe with smth like zod?)
  if (options.system === 'JSC-Cloud' || 'flavor' in options) {
    return <JupyterLabCloudConfigSummary id={id} options={options as JupyterLabCloudOptions} />;
  } else if ('account' in options || 'project' in options) {
    return <JupyterLabHpcConfigSummary id={id} options={options as JupyterLabHpcOptions} />;
  }

  return <></>;
}

const jupyterLabService: ServiceProperties = {
  displayName: 'JupyterLab',
  iconPath: staticUrl('images', 'services', 'jupyterlab.svg'),
  config: config as ServiceConfig,
  createConfigSummary: createConfigSummary,
  summaryButtons: {},
};

export default jupyterLabService;
