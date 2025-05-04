import { Card, CardBodyProps } from 'react-bootstrap';
import { z } from 'zod';
import { InputElementPropsBase } from './index.tsx';
import { commonInputOptions, commonParameters } from './utils.ts';

export const logContainerOptions = z.object({
  type: z.literal('logcontainer'),
  options: commonInputOptions.optional(),
});

export function InputLogContainer({
  prefix,
  elementId,
  elementOptions,
}: InputElementPropsBase<typeof logContainerOptions>) {
  return (
    <>
      <div id={`${prefix}-terminal-container-div`}>
        <div id={`${prefix}-terminal-container-flex`} className="d-flex justify-content-center align-items-center mb-3">
          <div
            id={`${prefix}-terminal-container`}
            style={{ width: '60%', maxHeight: '50%', backgroundColor: 'black', overflow: 'auto' }}
          ></div>
        </div>
      </div>
      <Card.Body
        id={`${prefix}-${elementId}-input`}
        className="text-black row g-0"
        {...commonParameters<CardBodyProps>(elementOptions.input.options)}
      >
        <div className="log-div">Logs collected during the Start process will be shown here.</div>
      </Card.Body>
    </>
  );
}
