import { ReactNode, useState } from 'react';
import { Button, ProgressBar, Row, useAccordionButton } from 'react-bootstrap';
import { ConfigItem } from '@/components/table/ConfigItem.tsx';
import { services } from '@/services';
import { DeleteIcon, NaIcon, OpenIcon, StartIcon, StopIcon } from '@/assets/icons';
import { ButtonVariant } from 'react-bootstrap/types';
import { SpawnerOptions } from '@/gloabals.ts';

type ProgressBarProps = {
  service: string;
  row: string;
  progress: number;
};

function SpawnerProgressBar({ service, row, progress }: ProgressBarProps) {
  const ready = progress == 100;
  const active = false; // ToDo

  const barId = `${service}-${row}-progress-bar`;
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
          id={`${service}-${row}-progress-text`}
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
        id={`${service}-${row}-progress-info-text`}
        className="progress-info-text text-center text-muted"
        style={{ fontSize: 'smaller' }}
      >
        {ready ? 'running' : active ? 'active' : progress == 99 ? 'cancelling' : ''}
      </span>
    </div>
  );
}

type SpawnerButtonProps = {
  icon: ReactNode;
  label: string;
  variant: ButtonVariant;
  id: string;
  hidden?: boolean;
  className?: string;
};

function SpawnerButton({ icon, label, variant, id, className, hidden }: SpawnerButtonProps) {
  return (
    <Button variant={variant} id={id} className={className} hidden={hidden}>
      {icon}
      {label}
    </Button>
  );
}

type RowSummaryProps = {
  service: string;
  row: string;
  options: SpawnerOptions;
};

export function RowSummary({ service, row, options }: RowSummaryProps) {
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const openDetails = useAccordionButton(row, () => setCollapsed(!collapsed));

  // ToDo: Prevent opening Details when Buttons are clicked

  return (
    <tr onMouseDown={openDetails} id={`${service}-${row}-summary-tr`} className="summary-tr existing-spawner-tr">
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
          id={`${service}-${row}-config-td-div`}
          className="mx-3 mb-1 g-0 justify-content-between align-items-center"
          style={{ maxHeight: '152px', overflow: 'auto' }}
        >
          <ConfigItem name="System" value={options.system} id={`${service}-${row}-config-td-system`} />
          {services[service].createConfigSummary(row, options)}
        </Row>
      </td>

      <th scope="row" className="status-td">
        <div className="d-flex justify-content-center">
          <SpawnerProgressBar service={service} row={row} progress={0} />
        </div>
      </th>

      <th scope="row" className="url-td text-center" style={{ whiteSpace: 'nowrap' }}>
        <SpawnerButton
          icon={<OpenIcon />}
          label="Open"
          variant="success"
          id={`${service}-${row}-open-btn-header`}
          hidden={true}
        />
        <SpawnerButton
          icon={<StopIcon />}
          label="Stop"
          variant="danger"
          id={`${service}-${row}-stop-btn-header`}
          hidden={true}
        />
        <SpawnerButton
          icon={<StopIcon />}
          label="Cancel"
          variant="danger"
          id={`${service}-${row}-cancel-btn-header`}
          hidden={true}
        />
        <SpawnerButton
          icon={<StartIcon />}
          label="Start"
          variant="primary"
          id={`${service}-${row}-start-btn-header`}
          hidden={false}
        />
        <SpawnerButton
          icon={<NaIcon />}
          label="N/A"
          variant="secondary"
          id={`${service}-${row}-na-btn-header`}
          className="btn-na-lab disabled"
          hidden={true}
        />
        <SpawnerButton
          icon={<DeleteIcon />}
          label="Delete"
          variant="danger"
          id={`${service}-${row}-del-btn-header`}
          hidden={true}
        />
      </th>
    </tr>
  );
}
