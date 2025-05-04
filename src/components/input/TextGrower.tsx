import { z } from 'zod';
import { InputElementPropsBase } from '@/components/input/index.tsx';
import { Button, Form, FormControlProps, InputGroup } from 'react-bootstrap';
import { commonInputOptions, commonParameters } from '@/components/input/utils.ts';
import { PlusIcon } from '@/assets/icons';
import { InputFormElement } from '@/components/input/FormElement.tsx';

export const textGrowerOptions = z.object({
  type: z.literal('textgrower'),
  options: commonInputOptions
    .extend({
      name: z.string().optional(),
      enabled: z.boolean().optional(),
      warning: z.string().optional(),
      secret: z.boolean().optional(),
    })
    .optional(),
});

export function InputTextGrower({
  prefix,
  service,
  row,
  tab,
  elementId,
  elementOptions,
}: InputElementPropsBase<typeof textGrowerOptions>) {
  return (
    <InputFormElement
      prefix={prefix}
      service={service}
      row={row}
      tab={tab}
      elementId={elementId}
      elementOptions={elementOptions}
    >
      <InputGroup className="d-flex align-items-center mb-2">
        <Form.Control
          type={elementOptions.input.options?.secret ? 'password' : 'text'}
          id={`${prefix}-${elementId}-input`}
          name={`${elementOptions.input.options?.name ?? elementId}`}
          {...commonParameters<FormControlProps>(elementOptions.input.options)}
        >
          <Button
            variant="primary"
            disabled={elementOptions.input.options?.enabled ?? true}
            id={`${prefix}-1-addbtn-${elementId}-input`}
            style={{ marginLeft: '8px' }}
          >
            <PlusIcon />
          </Button>
        </Form.Control>
      </InputGroup>
    </InputFormElement>
  );
}
