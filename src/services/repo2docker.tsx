import { SpawnerOptions, staticUrl } from '@/gloabals.ts';
import { ReactNode } from 'react';
import { ConfigItem } from '@/components/table/ConfigItem.tsx';
import { ServiceConfig } from '@/components/table/config.ts';

export const displayName = 'repo2docker';
export const iconPath = staticUrl('images', 'services', 'repo2docker.svg');
export const config: ServiceConfig = { navbar: {}, tabs: {} };

const repotypeMapping = {
  gh: 'GitHub',
  git: 'Git repository',
  gl: 'GitLab',
  gist: 'GitHub Gist',
  zenodo: 'Zenodo DOI',
  figshare: 'FigShare DOI',
  hydroshare: 'Hydroshare resource',
  dataverse: 'Dataverse DOI',
  ckan: 'CKAN dataset',
};

interface Repo2DockerOptions extends SpawnerOptions {
  repo2dockerdirectlink: string;
  repo2docker: {
    repotype: keyof typeof repotypeMapping;
    repourl: string;
    reporef: string;
    repopathtype: 'file' | 'url';
    image: string;
  };
  r2d_id?: string;
}

export function Repo2DockerConfigSummary({ id, options }: { id: string; options: Repo2DockerOptions }) {
  const parts = options.repo2docker.repourl.split('/', 2);

  return (
    <>
      <ConfigItem
        name="Type"
        value={repotypeMapping[options.repo2docker.repotype]}
        id={`jupyterlab-${id}-config-td-repotype`}
      />
      <ConfigItem name="Organization" value={parts[0]} id={`jupyterlab-${id}-config-td-organization`} />
      <ConfigItem name="Project" value={parts[1]} id={`jupyterlab-${id}-config-td-project`} />
    </>
  );
}

export function createConfigSummary(id: string, options: SpawnerOptions): ReactNode {
  // ToDo: Validation
  if ('repo2docker' in options) {
    return <Repo2DockerConfigSummary id={id} options={options as Repo2DockerOptions} />;
  }

  return <></>;
}
