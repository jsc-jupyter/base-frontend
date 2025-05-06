import { useState } from 'react';
import { Row, useAccordionButton } from 'react-bootstrap';
import { ConfigItem } from '@/components/table/ConfigItem.tsx';
import { services } from '@/services';
import { SpawnerOptions } from '@/gloabals.ts';
import { SummaryButton } from '@/components/table/SummaryButton.tsx';
import { SummaryProgressBar } from '@/components/table/SummaryProgressBar.tsx';

type RowSummaryProps = {
  service: string;
  row: string;
  options: SpawnerOptions;
};

export type SummaryButtonState = 'stopped' | 'starting' | 'running' | 'stopping' | 'na';

export function RowSummary({ service, row, options }: RowSummaryProps) {
  // Collapsible
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const openDetails = useAccordionButton(row, () => setCollapsed(!collapsed));

  // Show/Hide SummaryButtons based on progress. Will be updated from the SummaryProgressBar
  const [buttonState, setButtonState] = useState<SummaryButtonState>('stopped');

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
          <SummaryProgressBar service={service} row={row} updateSummaryButtons={setButtonState} />
        </div>
      </th>

      <th scope="row" className="url-td text-center" style={{ whiteSpace: 'nowrap' }}>
        <SummaryButton service={service} row={row} type="open" visible={buttonState === 'running'} />
        <SummaryButton service={service} row={row} type="stop" visible={buttonState === 'running'} />
        <SummaryButton
          service={service}
          row={row}
          type="cancel"
          visible={buttonState === 'starting' || buttonState === 'stopping'}
        />
        <SummaryButton service={service} row={row} type="start" visible={buttonState === 'stopped'} />
        <SummaryButton service={service} row={row} type="na" visible={buttonState === 'na'} />
        <SummaryButton service={service} row={row} type="delete" visible={buttonState === 'na'} />
      </th>
    </tr>
  );
}
