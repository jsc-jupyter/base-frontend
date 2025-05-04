import { Form, FormSelectProps } from 'react-bootstrap';
import { z } from 'zod';
import { InputElementPropsBase } from './index.tsx';
import { commonInputOptions, commonParameters } from './utils.ts';
import { InputFormElement } from './FormElement.tsx';

export const selectOptions = z.object({
  type: z.literal('select'),
  values: z.record(z.string(), z.string()).optional(),
  options: commonInputOptions
    .extend({
      name: z.string().optional(),
      warning: z.string().optional(),
    })
    .optional(),
});

export function InputSelect({
  prefix,
  service,
  row,
  tab,
  elementId,
  elementOptions,
}: InputElementPropsBase<typeof selectOptions>) {
  return (
    <InputFormElement
      prefix={prefix}
      service={service}
      row={row}
      tab={tab}
      elementId={elementId}
      elementOptions={elementOptions}
    >
      <Form.Select
        name={elementOptions.input.options?.name ?? elementId}
        {...commonParameters<FormSelectProps>(elementOptions.input.options)}
      >
        {Object.entries(elementOptions.input.values ?? []).map(([key, value]) => (
          <option value={key}>{value}</option>
        ))}
      </Form.Select>
      <div className="invalid-feedback">{elementOptions.input.options?.warning ?? ''}</div>
    </InputFormElement>
  );
}
