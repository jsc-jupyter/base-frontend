import { z } from 'zod';
import { Button, Form, FormControlProps, InputGroup } from 'react-bootstrap';
import { commonInputOptions, commonParameters } from '@/components/input/utils.ts';
import { CopyIcon } from '@/assets/icons';
import { InputElementPropsBase } from '@/components/input/index.tsx';
import { InputFormElement } from '@/components/input/FormElement.tsx';

export const textOptions = z.object({
  type: z.literal('text'),
  options: commonInputOptions
    .extend({
      secret: z.boolean().optional(),
      copy: z.boolean().optional(),
      name: z.string().optional(),
    })
    .optional(),
});

export function InputText({
  prefix,
  service,
  row,
  tab,
  elementId,
  elementOptions,
}: InputElementPropsBase<typeof textOptions>) {
  const secret = !!elementOptions.input.options?.secret;
  const copy = !!elementOptions.input.options?.copy;

  const inner = (
    <>
      <Form.Control
        type={secret ? 'password' : 'text'}
        name={`${elementOptions.input.options?.name ?? elementId}`}
        {...commonParameters<FormControlProps>(elementOptions.input.options)}
      />
      {secret ? (
        <>
          <span className="input-group-append">
            <Button variant="light">
              <i className="fa fa-eye" aria-hidden="true"></i>
            </Button>
          </span>
        </>
      ) : copy ? (
        <button
          type="button"
          title="Copy to clipboard"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-md border border-gray-300 hover:bg-gray-100 active:bg-gray-200"
        >
          <CopyIcon />
        </button>
      ) : (
        <></>
      )}
    </>
  );

  return (
    <InputFormElement
      prefix={prefix}
      service={service}
      row={row}
      tab={tab}
      elementId={elementId}
      elementOptions={elementOptions}
    >
      {secret || copy ? <InputGroup>{inner}</InputGroup> : inner}
    </InputFormElement>
  );
}
