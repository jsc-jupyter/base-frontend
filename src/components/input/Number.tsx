import { Form, FormControlProps } from 'react-bootstrap';
import { z } from 'zod';
import { InputElementPropsBase } from './index.tsx';
import { commonInputOptions, commonParameters } from './utils.ts';
import { InputFormElement } from './FormElement.tsx';

export const numberOptions = z.object({
  type: z.literal('number'),
  options: commonInputOptions
    .extend({
      name: z.string().optional(),
      placeholder: z.string().optional(),
      warning: z.string().optional(),
    })
    .optional(),
});

export function InputNumber({
  prefix,
  service,
  row,
  tab,
  elementId,
  elementOptions,
}: InputElementPropsBase<typeof numberOptions>) {
  return (
    <InputFormElement
      prefix={prefix}
      service={service}
      row={row}
      tab={tab}
      elementId={elementId}
      elementOptions={elementOptions}
    >
      <Form.Control
        type="number"
        name={elementOptions.input.options?.name ?? elementId}
        {...commonParameters<FormControlProps>(elementOptions.input.options)}
      />
      <div className="invalid-feedback">{elementOptions.input.options?.warning ?? ''}</div>
    </InputFormElement>
  );
}
