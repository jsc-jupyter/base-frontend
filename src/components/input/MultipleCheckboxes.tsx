import { z } from 'zod';
import { commonInputOptions, commonParameters } from './utils.ts';
import { InputElementPropsBase } from './index.tsx';
import { InputLabel } from '@/components/input/Label.tsx';
import { Row, RowProps } from 'react-bootstrap';

export const multipleCheckboxesOptions = z.object({
  type: z.literal('multiple_checkboxes'),
  options: commonInputOptions.optional(),
});

export function InputMultipleCheckboxes({
  prefix,
  service,
  row,
  tab,
  elementId,
  elementOptions,
}: InputElementPropsBase<typeof multipleCheckboxesOptions>) {
  return (
    <div id={`${prefix}-${elementId}-input-div`}>
      <InputLabel
        prefix={prefix}
        service={service}
        row={row}
        tab={tab}
        elementId={elementId}
        elementOptions={{ input: { type: 'label' }, label: elementOptions.label }}
      />
      <Row
        id={`${prefix}-${elementId}-checkboxes-div`}
        className="g-0"
        {...commonParameters<RowProps>(elementOptions.input.options, true)}
      ></Row>
    </div>
  );
}
