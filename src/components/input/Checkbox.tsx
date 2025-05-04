import { Form, FormControlProps } from 'react-bootstrap';
import { z } from 'zod';
import { InputElementPropsBase } from './index.tsx';
import { commonInputOptions, commonParameters } from './utils.ts';
import { InputFormElement } from './FormElement.tsx';

export const checkboxOptions = z.object({
  type: z.literal('checkbox'),
  options: commonInputOptions
    .extend({
      name: z.string().optional(),
      default: z.boolean().optional(),
      warning: z.string().optional(),
    })
    .optional(),
});

export function InputCheckbox({
  prefix,
  service,
  row,
  tab,
  elementId,
  elementOptions,
}: InputElementPropsBase<typeof checkboxOptions>) {
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
        type="checkbox"
        name={elementOptions.input.options?.name ?? elementId}
        checked={elementOptions.input.options?.default}
        {...commonParameters<FormControlProps>(elementOptions.input.options)}
      />
      <div className="invalid-feedback">{elementOptions.input.options?.warning ?? ''}</div>
    </InputFormElement>
  );
}
