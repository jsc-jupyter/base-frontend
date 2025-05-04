import { z } from 'zod';
import { commonInputOptions, commonParameters } from './utils.ts';
import { InputElementPropsBase } from './index.tsx';
import { InputFormElement } from './FormElement.tsx';

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
    <InputFormElement
      prefix={prefix}
      service={service}
      row={row}
      tab={tab}
      elementId={elementId}
      elementOptions={elementOptions}
    >
      <input
        id={`${prefix}-${elementId}-checkboxes-div`}
        className="row g-0"
        {...commonParameters(elementOptions.input.options, true)}
      ></input>
    </InputFormElement>
  );
}
