import { RowProps } from 'react-bootstrap';
import { z } from 'zod';
import { InputElementPropsBase } from './index.tsx';
import { commonInputOptions, commonParameters } from './utils.ts';

export const flavorInfoOptions = z.object({
  type: z.literal('flavorinfo'),
  options: commonInputOptions.optional(),
});

export function InputFlavorInfo({
  prefix,
  elementId,
  elementOptions,
}: InputElementPropsBase<typeof flavorInfoOptions>) {
  // useSse('flavors')

  return (
    <div
      id={`${prefix}-${elementId}-input-div`}
      className="mb-3"
      {...commonParameters<RowProps>(elementOptions.input.options, true)}
    ></div>
  );
}
