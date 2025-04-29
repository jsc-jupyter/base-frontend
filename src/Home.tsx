import { Page } from '@/Page.tsx';
import { CSSProperties, ReactNode, useMemo, useState } from 'react';
import { Sidebar } from '@/components/Sidebar.tsx';
import { ServiceTable } from '@/components/table/ServiceTable.tsx';
import {
  Accordion,
  Button,
  Col,
  Form,
  Nav,
  ProgressBar,
  Row,
  TabContent,
  TabPane,
  useAccordionButton,
} from 'react-bootstrap';
import { frontendCollection, SpawnerOptions } from '@/gloabals.ts';
import { DeleteIcon, NaIcon, OpenIcon, StartIcon, StopIcon, WarningIcon } from '@/assets/icons';
import { createRoot } from 'react-dom/client';
import { ButtonVariant } from 'react-bootstrap/types';
import '@/assets/css/Home.css';
import { services } from '@/services';
import { ConfigItem } from '@/components/table/ConfigItem.tsx';
import { type ServiceConfig } from '@/components/table/config.ts';

// ToDo
import { default as config } from '@/assets/configs/jupyterlab_config.json';
import { InputElement } from '@/components/input';

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

type RowProps = {
  service: string;
  id: string;
  options: SpawnerOptions;
};

function RowSummary({ service, id, options }: RowProps) {
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
          {services[service].createConfigSummary(id, options)}
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

// @ts-expect-error Allow unused
function RowDetails({ service, id, options }: RowProps) {
  // Instead of just .hide() it, we want to keep the width of the buttons, so the interface
  // does not wabble around when showing / hiding buttons.
  const styleHide: CSSProperties = {
    height: '0 !important',
    overflow: 'hidden !important',
    paddingTop: '0 !important',
    paddingBottom: '0 !important',
    border: 'none !important',
    margin: '0 !important',
  };

  const navItems = Object.entries((config as ServiceConfig).navbar).map(([name, navOptions], index) => {
    // ToDo: firstRow and defaultRow
    return (
      <Nav.Link
        as="button"
        active={index == 0}
        id={`${service}-${id}-${name}-navbar-button`}
        className={`${navOptions.margins ?? 'mb-3'}`}
        style={navOptions.show ? {} : styleHide}
      >
        <span>{navOptions.displayName}</span>
        <span className="d-flex invisible">
          <WarningIcon />
          <span className="visually-hidden">settings changed</span>
        </span>
      </Nav.Link>
    );
  });

  const tabs = Object.entries((config as ServiceConfig).tabs).map(([tabName, tabOptions], index) => {
    const elements = Object.entries(tabOptions.center).map(([elementId, elementOptions]) => {
      return (
        <InputElement service={service} id={id} tab={tabName} elementId={elementId} elementOptions={elementOptions} />
      );
    });

    return (
      <TabPane active={index == 0 || tabName === 'buttonrow'}>
        {/* table_elements.create_element */}
        <Row className="col-12">{...elements}</Row>
      </TabPane>
    );
  });

  return (
    <tr>
      <td colSpan={100} className="p-0">
        <Accordion.Collapse eventKey={id}>
          <div className="d-flex align-items-start m-3">
            <Nav variant="pills" className="flex-column p-3 ps-0" style={{ minWidth: '15% !important' }}>
              {...navItems}
            </Nav>
            <TabContent className="w-100">
              <Form>{...tabs}</Form>
            </TabContent>
          </div>
        </Accordion.Collapse>
      </td>
    </tr>
  );
}

export function Home() {
  const [service, setService] = useState<string>('jupyterlab');
  const spawners = useMemo(
    () =>
      Object.entries(frontendCollection.decrypted_user_options).filter(([_, options]) => options.service === service),
    [service],
  );

  // const description = <p>You can configure your existing JupyterLabs by expanding the corresponding table row.</p>;
  const description = <p>Selected Service: {service}</p>;

  return (
    <Page>
      <Row className="h-100">
        <Sidebar onSelected={setService} />
        <Col className="h-100">
          <ServiceTable service={service} description={description} header={<HomeTableHeader />}>
            {spawners.map(([rowId, rowOptions]) => (
              <>
                <RowSummary service={service} id={rowId} options={rowOptions} />
                <RowDetails service={service} id={rowId} options={rowOptions} />
              </>
            ))}
          </ServiceTable>
        </Col>
      </Row>
    </Page>
  );
}

createRoot(document.getElementById('root')!).render(<Home />);
