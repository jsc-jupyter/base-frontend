import { Form, FormControlProps } from 'react-bootstrap';
import { z } from 'zod';
import { InputElementPropsBase } from './index.tsx';
import { commonInputOptions, commonParameters } from './utils.ts';
import { InputFormElement } from './FormElement.tsx';

export const dateOptions = z.object({
  type: z.literal('date'),
  options: commonInputOptions
    .extend({
      name: z.string().optional(),
      warning: z.string().optional(),
    })
    .optional(),
});

export function InputDate({
  prefix,
  service,
  row,
  tab,
  elementId,
  elementOptions,
}: InputElementPropsBase<typeof dateOptions>) {
  const now = new Date();
  const value = new Date().setMonth(now.getMonth() + 6);
  const max = new Date().setFullYear(now.getFullYear() + 1);

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
        type="date"
        value={value}
        min={now.valueOf()}
        max={max}
        name={elementOptions.input.options?.name ?? elementId}
        {...commonParameters<FormControlProps>(elementOptions.input.options)}
      />
      <div className="invalid-feedback">{elementOptions.input.options?.warning ?? ''}</div>
    </InputFormElement>
  );
}
