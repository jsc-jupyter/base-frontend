import { Col, Row, RowProps } from 'react-bootstrap';
import { z } from 'zod';
import { InputElementPropsBase } from './index.tsx';
import { commonInputOptions, commonParameters } from './utils.ts';

export const flavorLegendOptions = z.object({
  type: z.literal('flavorlegend'),
  options: commonInputOptions.optional(),
});

export function InputFlavorLegend({
  prefix,
  elementId,
  elementOptions,
}: InputElementPropsBase<typeof flavorLegendOptions>) {
  const boxStyle = {
    height: '15px',
    width: '15px',
    borderRadius: '0.25rem',
  };

  return (
    <Row
      id={`${prefix}-${elementId}-input-div`}
      className="mb-1 align-items-center g-0 mt-4"
      {...commonParameters<RowProps>(elementOptions.input.options, true)}
    >
      <span className="col-4 fw-bold">Available Flavors</span>
      <Col class="d-flex align-items-center ms-2">
        <div style={{ ...boxStyle, backgroundColor: '#198754;' }}></div>
        <span className="ms-1">= Free</span>
        <span className="mx-2"></span>
        <div style={{ ...boxStyle, backgroundColor: '#023d6b;' }}></div>
        <span className="ms-1">= Used</span>
        <span className="mx-2"></span>
        <div style={{ ...boxStyle, backgroundColor: '#dc3545;' }}></div>
        <span className="ms-1">= Limit exceeded</span>
      </Col>
    </Row>
  );
}
