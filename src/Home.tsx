import { Page } from '@/Page.tsx';
import { ReactNode, useState } from 'react';
import { Sidebar } from '@/components/Sidebar.tsx';
import { ServiceTable } from '@/components/table/ServiceTable.tsx';
import { Accordion, Button, Col, ProgressBar, Row, useAccordionButton } from 'react-bootstrap';
import { frontendCollection, SpawnerOptions } from '@/gloabals.ts';
import { DeleteIcon, NaIcon, OpenIcon, StartIcon, StopIcon } from '@/assets/icons';
import { createRoot } from 'react-dom/client';
import { ButtonVariant } from 'react-bootstrap/types';
import '@/assets/css/Home.css';

function HomeTableHeader() {
  return (
    <>
      <th scope="col" style={{ width: '1%' }}></th>
      <th scope="col" style={{ width: '20%' }}>
        Name
      </th>
      <th scope="col">Configuration</th>
      <th scope="col" className="text-center" style={{ width: '10%' }}>
        Status
      </th>
      <th scope="col" className="text-center" style={{ width: '10%' }}>
        Action
      </th>
    </>
  );
}

function ConfigItem({ name, value, id, hidden }: { name: string; value: string; id: string; hidden?: boolean }) {
  return (
    <Col lg={3} hidden={hidden} id={`${id}-div`} className="text-lg-center">
      <span className="text-muted" style={{ fontSize: 'smaller' }}>
        {name}
      </span>
      <br />
      <span id={id}>{value}</span>
    </Col>
  );
}

function SpawnerProgressBar({ service, id, progress }: { service: string; id: string; progress: number }) {
  const ready = progress == 100;
  const active = false; // ToDo

  const barId = `${service}-${id}-progress-bar`;
  const bar = ready ? (
    <ProgressBar now={progress} animated striped id={barId} />
  ) : (
    <div id={barId} className="bg-success" />
  );

  const color = progress >= 60 ? 'white' : 'black';

  return (
    <div className="d-flex flex-column">
      <div
        className="d-flex justify-content-center progress"
        style={{ backgroundColor: '#d3e4f4', height: '20px', minWidth: '100px' }}
      >
        {bar}
        <span
          id={`${service}-${id}-progress-text`}
          style={{
            position: 'absolute',
            width: '100px',
            textAlign: 'center',
            lineHeight: '20px',
            color: color,
          }}
        >
          {progress > 0 && progress < 100 && progress}
        </span>
      </div>
      <span
        id={`${service}-${id}-progress-info-text`}
        className="progress-info-text text-center text-muted"
        style={{ fontSize: 'smaller' }}
      >
        {ready ? 'running' : active ? 'active' : progress == 99 ? 'cancelling' : ''}
      </span>
    </div>
  );
}

function SpawnerButton({
  icon,
  label,
  variant,
  id,
  className,
  hidden,
}: {
  icon: ReactNode;
  label: string;
  variant: ButtonVariant;
  id: string;
  hidden?: boolean;
  className?: string;
}) {
  return (
    <Button variant={variant} id={id} className={className} hidden={hidden}>
      {icon}
      {label}
    </Button>
  );
}

function RowSummary({ service, id, options }: { service: string; id: string; options: SpawnerOptions }) {
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const openDetails = useAccordionButton(id, () => setCollapsed(!collapsed));

  // ToDo: Prevent opening Details when Buttons are clicked

  return (
    <tr onMouseDown={openDetails} id={`${service}-${id}-summary-tr`} className="summary-tr existing-spawner-tr">
      <td className="details-td">
        <div className={`d-flex mx-4 accordion-icon ${collapsed ? 'collapsed' : ''}`} />
      </td>
      <th scope="row" className="name-td">
        {options.name ?? 'Unnamed'}
      </th>
      <td scope="row" className="config-td">
        <Row
          md={6}
          lg={12}
          id={`${service}-${id}-config-td-div`}
          className="mx-3 mb-1 g-0 justify-content-between align-items-center"
          style={{ maxHeight: '152px', overflow: 'auto' }}
        >
          <ConfigItem name="System" value={options.system} id={`${service}-${id}-config-td-system`} />
          <ConfigItem name="Option" value={options.option} id={`${service}-${id}-config-td-option`} />
          <ConfigItem name="Project" value="ToDo" id={`${service}-${id}-config-td-project`} hidden={true} />
          {/*spawner.user_options.get("hpc", {}).get("project", "")*/}
          <ConfigItem name="Partition" value="ToDo" id={`${service}-${id}-config-td-partition`} hidden={true} />
          {/*spawner.user_options.get("hpc", {}).get("partition", "")*/}
          <ConfigItem name="Repository Tye" value="ToDo" id={`${service}-${id}-config-td-repotype`} hidden={true} />
          {/*repotypeMapping.get(repotype, repotype)*/}
          <ConfigItem name="Value" value="ToDo" id={`${service}-${id}-config-td-repourl`} hidden={true} />
          {/*{%- set repourl = spawner.user_options.get("repo2docker", {}).get("repourl", "") %}*/}
          {/*{%- set repourlVal = repourl.split('/') | select('string') | list | last %}*/}
          {/*repourlVal*/}
        </Row>
      </td>

      <th scope="row" className="status-td">
        <div className="d-flex justify-content-center">
          <SpawnerProgressBar service={service} id={id} progress={0} />
        </div>
      </th>

      <th scope="row" className="url-td text-center" style={{ whiteSpace: 'nowrap' }}>
        <SpawnerButton
          icon={<OpenIcon />}
          label="Open"
          variant="success"
          id={`${service}-${id}-open-btn-header`}
          hidden={true}
        />
        <SpawnerButton
          icon={<StopIcon />}
          label="Stop"
          variant="danger"
          id={`${service}-${id}-stop-btn-header`}
          hidden={true}
        />
        <SpawnerButton
          icon={<StopIcon />}
          label="Cancel"
          variant="danger"
          id={`${service}-${id}-cancel-btn-header`}
          hidden={true}
        />
        <SpawnerButton
          icon={<StartIcon />}
          label="Start"
          variant="primary"
          id={`${service}-${id}-start-btn-header`}
          hidden={false}
        />
        <SpawnerButton
          icon={<NaIcon />}
          label="N/A"
          variant="secondary"
          id={`${service}-${id}-na-btn-header`}
          className="btn-na-lab disabled"
          hidden={true}
        />
        <SpawnerButton
          icon={<DeleteIcon />}
          label="Delete"
          variant="danger"
          id={`${service}-${id}-del-btn-header`}
          hidden={true}
        />
      </th>
    </tr>
  );
}

export function Home() {
  const [service, setService] = useState<string>('jupyterlab');

  const rows = Object.entries(frontendCollection.decrypted_user_options);
  // const description = <p>You can configure your existing JupyterLabs by expanding the corresponding table row.</p>;
  const description = <p>Selected Service: {service}</p>;

  return (
    <Page>
      <Row className="h-100">
        <Sidebar onSelected={setService} />
        <Col className="h-100">
          <ServiceTable service={service} description={description} header={<HomeTableHeader />}>
            {rows.map(([rowId, rowOptions]) => (
              <>
                <RowSummary service={service} id={rowId} options={rowOptions} />
                <Accordion.Collapse eventKey={rowId}>
                  <tr>
                    <td colSpan={100} className="p-0">
                      Hello!
                    </td>
                  </tr>
                </Accordion.Collapse>
              </>
            ))}
          </ServiceTable>
        </Col>
      </Row>
    </Page>
  );
}

createRoot(document.getElementById('root')!).render(<Home />);
