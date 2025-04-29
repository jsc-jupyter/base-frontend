import { InputButtons, InputButtonsProps } from './Buttons.tsx';
import { InputButton, InputButtonProps } from './Button.tsx';
import { InputLabel, InputLabelProps } from './Label.tsx';
import { InputModal, InputModalProps } from './Modal.tsx';
import { InputMultipleCheckboxes, InputMultipleCheckboxesProps } from './MultipleCheckboxes.tsx';
import { InputText, InputTextProps } from '@/components/input/Text.tsx';

type InputElementProps = {
  service: string;
  id: string;
  tab: string;
  elementId: string;
  elementOptions: object;
};

// @ts-expect-error Allow unused
export function InputElement({ service, id, tab, elementId, elementOptions }: InputElementProps) {
  // const idPrefix = `${service}-${id}-${tab}`;

  // @ts-expect-error ToDo
  const type: string = elementOptions.input.type;
  switch (type) {
    case 'button':
      // @ts-expect-error ToDo
      return <InputButton service={service} id={id} options={elementOptions as InputButtonProps} />;
    case 'buttons':
      // @ts-expect-error ToDo
      return <InputButtons service={service} id={id} options={elementOptions as InputButtonsProps} />;
    case 'label':
      // @ts-expect-error ToDo
      return <InputLabel service={service} id={id} options={elementOptions as InputLabelProps} />;
    case 'modal':
      // @ts-expect-error ToDo
      return <InputModal service={service} id={id} options={elementOptions as InputModalProps} />;
    case 'multiple_checkboxes':
      return (
        // @ts-expect-error ToDo
        <InputMultipleCheckboxes service={service} id={id} options={elementOptions as InputMultipleCheckboxesProps} />
      );
    case 'text':
      // @ts-expect-error ToDo
      return <InputText service={service} id={id} options={elementOptions as InputTextProps} />;
    default: {
      console.error(`Input ${type} not implemented`);
    }
  }
}
