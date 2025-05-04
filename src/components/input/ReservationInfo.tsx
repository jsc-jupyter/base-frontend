import { Row, RowProps } from 'react-bootstrap';
import { z } from 'zod';
import { InputElementPropsBase } from './index.tsx';
import { commonInputOptions, commonParameters } from './utils.ts';

export const reservationInfoOptions = z.object({
  type: z.literal('reservationinfo'),
  options: commonInputOptions.optional(),
});

export function InputReservationInfo({
  prefix,
  elementId,
  elementOptions,
}: InputElementPropsBase<typeof reservationInfoOptions>) {
  return (
    <Row
      id={`${prefix}-${elementId}-input-div`}
      className="mb-1"
      {...commonParameters<RowProps>(elementOptions.input.options, true)}
    >
      <div id={`${prefix}-${elementId}-info`} className="col-8 offset-4">
        <div className="row">
          <span className="col-4 fw-bold">Start Time:</span>
          <span id={`${prefix}-${elementId}-start`} className="col-auto"></span>
        </div>
        <div className="row">
          <span className="col-4 fw-bold">End Time:</span>
          <span id={`${prefix}-${elementId}-end`} className="col-auto"></span>
        </div>
        <div className="row">
          <span className="col-4 fw-bold">State:</span>
          <span id={`${prefix}-${elementId}-state`} className="col-auto"></span>
        </div>
        <div className="mt-1">
          <details>
            <summary className="fw-bold">Detailed reservation information:</summary>
            <pre id={`${prefix}-${elementId}-details`}></pre>
          </details>
        </div>
      </div>
    </Row>
  );
}
