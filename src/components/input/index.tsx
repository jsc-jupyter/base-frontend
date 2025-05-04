import { z } from 'zod';

import { InputButtonRow, buttonRowOptions } from './ButtonRow.tsx';
import { InputCheckbox, checkboxOptions } from './Checkbox.tsx';
import { InputDate, dateOptions } from './Date.tsx';
import { InputFlavorInfo, flavorInfoOptions } from './FlavorInfo.tsx';
import { InputFlavorLegend, flavorLegendOptions } from './FlavorLegend.tsx';
import { InputLabel, labelOptions, labelDetails } from './Label.tsx';
import { InputLogContainer, logContainerOptions } from './LogContainer.tsx';
import { InputMultipleCheckboxes, multipleCheckboxesOptions } from './MultipleCheckboxes.tsx';
import { InputNumber, numberOptions } from './Number.tsx';
import { InputReservationInfo, reservationInfoOptions } from './ReservationInfo.tsx';
import { InputSelect, selectOptions } from './Select.tsx';
import { InputSelectHelper, selectHelperOptions } from './SelectHelper.tsx';
import { InputText, textOptions } from './Text.tsx';
import { InputTextGrower, textGrowerOptions } from './TextGrower.tsx';

export type InputElementPropsBase<T extends z.ZodType> = {
  prefix: string;
  service: string;
  row: string;
  tab: string;
  elementId: string;
  elementOptions: {
    input: z.infer<T>;
    label?: z.infer<typeof labelDetails>;
  };
};

const inputOptions = z.discriminatedUnion('type', [
  buttonRowOptions,
  checkboxOptions,
  dateOptions,
  flavorInfoOptions,
  flavorLegendOptions,
  labelOptions,
  logContainerOptions,
  multipleCheckboxesOptions,
  numberOptions,
  reservationInfoOptions,
  selectOptions,
  selectHelperOptions,
  textOptions,
  textGrowerOptions,
  z.object({ type: z.literal('hr') }),
]);

export type InputElementProps = Omit<InputElementPropsBase<typeof inputOptions>, 'prefix'>;

export function InputElement({ service, row, tab, elementId, elementOptions }: InputElementProps) {
  // Parse the element Options based on the type
  const result = inputOptions.safeParse(elementOptions.input);

  if (!result.success) {
    console.error(`Error when parsing input`);
    console.error(elementOptions.input);
    console.error(result.error.toString());
    return <></>;
  }

  const options = result.data!;
  const props = {
    prefix: `${service}-${row}-${tab}`,
    service: service,
    row: row,
    tab: tab,
    elementId: elementId,
  };

  switch (options.type) {
    case 'buttons':
      return <InputButtonRow {...props} elementOptions={{ input: options, label: elementOptions.label }} />;
    case 'checkbox':
      return <InputCheckbox {...props} elementOptions={{ input: options, label: elementOptions.label }} />;
    case 'date':
      return <InputDate {...props} elementOptions={{ input: options, label: elementOptions.label }} />;
    case 'flavorinfo':
      return <InputFlavorInfo {...props} elementOptions={{ input: options, label: elementOptions.label }} />;
    case 'flavorlegend':
      return <InputFlavorLegend {...props} elementOptions={{ input: options, label: elementOptions.label }} />;
    case 'label':
      return <InputLabel {...props} elementOptions={{ input: options, label: elementOptions.label }} />;
    case 'logcontainer':
      return <InputLogContainer {...props} elementOptions={{ input: options, label: elementOptions.label }} />;
    case 'multiple_checkboxes':
      return <InputMultipleCheckboxes {...props} elementOptions={{ input: options, label: elementOptions.label }} />;
    case 'number':
      return <InputNumber {...props} elementOptions={{ input: options, label: elementOptions.label }} />;
    case 'reservationinfo':
      return <InputReservationInfo {...props} elementOptions={{ input: options, label: elementOptions.label }} />;
    case 'select':
      return <InputSelect {...props} elementOptions={{ input: options, label: elementOptions.label }} />;
    case 'selecthelper':
      return <InputSelectHelper {...props} elementOptions={{ input: options, label: elementOptions.label }} />;
    case 'text':
      return <InputText {...props} elementOptions={{ input: options, label: elementOptions.label }} />;
    case 'textgrower':
      return <InputTextGrower {...props} elementOptions={{ input: options, label: elementOptions.label }} />;
    case 'hr':
      return <hr />;
  }
}
