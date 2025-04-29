import { elementParameters, type Options } from '@/components/input/utils.ts';
import { InputLabel, InputLabelProps } from '@/components/input/Label.tsx';

export type InputMultipleCheckboxesProps = {
  service: string;
  id: string;
  prefix: string;
  elementId: string;
  options: Options;
};

export function InputMultipleCheckboxes({ service, id, prefix, elementId, options }: InputMultipleCheckboxesProps) {
  return (
    <div id={`${prefix}-${id}-input-div`} {...elementParameters(options)}>
      <InputLabel
        service={service}
        id={id}
        elementId={elementId}
        elementOptions={options as unknown as InputLabelProps['elementOptions']}
      />
      <input
        id={`${prefix}-${elementId}-checkboxes-div`}
        className="row g-0"
        {...elementParameters(options, true)}
      ></input>
    </div>
  );
}
