import { z } from 'zod';
import { Row, RowProps } from 'react-bootstrap';
import { ReactNode } from 'react';
import { InputElementPropsBase } from './index.tsx';
import { commonInputOptions, commonParameters } from './utils.ts';
import { InputLabel, InputLabelCallbacks } from './Label.tsx';

const inputElementOptions = z.object({
  options: commonInputOptions.optional(),
});

type InputFormElementProps = InputElementPropsBase<typeof inputElementOptions> &
  InputLabelCallbacks & {
    children: ReactNode;
  };

export function InputFormElement({
  prefix,
  service,
  row,
  tab,
  elementId,
  elementOptions,
  children,
  onCheckboxChange,
  onInfoClick,
}: InputFormElementProps) {
  const width = 12 - (elementOptions.label?.width ?? 4);

  return (
    <Row
      id={`${prefix}-${elementId}-input-div`}
      className="mb-1"
      {...commonParameters<RowProps>(elementOptions.input.options, true)}
    >
      <InputLabel
        prefix={prefix}
        service={service}
        row={row}
        tab={tab}
        elementId={elementId}
        elementOptions={{ input: { type: 'label' }, label: elementOptions.label }}
        onCheckboxChange={onCheckboxChange}
        onInfoClick={onInfoClick}
      />
      <div className={`col-${width} d-flex flex-column justify-content-center`}>{children}</div>
    </Row>
  );
}
