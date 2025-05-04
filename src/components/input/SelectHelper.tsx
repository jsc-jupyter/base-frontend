import { Form, Row, RowProps } from 'react-bootstrap';
import { z } from 'zod';
import { InputElementPropsBase } from './index.tsx';
import { commonInputOptions, commonParameters } from './utils.ts';

export const selectHelperOptions = z.object({
  type: z.literal('selecthelper'),
  options: commonInputOptions.optional(),
});

export function InputSelectHelper({
  prefix,
  elementId,
  elementOptions,
}: InputElementPropsBase<typeof selectHelperOptions>) {
  return (
    <>
      <hr />
      <Row
        id={`${prefix}-${elementId}-input-div`}
        className="g-0"
        {...commonParameters<RowProps>(elementOptions.input.options, true)}
      >
        <Form.Check
          label="Select all"
          id={`${prefix}-${elementId}-select-all`}
          className="col-sm-6 col-md-4 col-lg-3"
        />
        <Form.Check
          label="Deselect all"
          id={`${prefix}-${elementId}-select-none`}
          className="col-sm-6 col-md-4 col-lg-3"
        />
      </Row>
    </>
  );
}
