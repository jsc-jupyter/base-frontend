import { InputButton, InputButtonProps } from '@/components/input/Button.tsx';
import { InputModal } from '@/components/input/Modal.tsx';

export type InputButtonsProps = {
  service: string;
  id: string;
  options: {
    input: {
      options: {
        buttons: string[];
        [key: string]: unknown;
      };
    };
  };
};

export function InputButtons({ service, id, options }: InputButtonsProps) {
  const buttons = options.input.options.buttons.map(button => {
    return (
      <InputButton
        service={service}
        id={id}
        type={button as InputButtonProps['type']}
        options={options.input.options[button] as InputButtonProps['options']}
      />
    );
  });

  return (
    <>
      <hr />
      <div className="d-flex" id={`${service}-${id}-buttons-div`}>
        {...buttons}
      </div>
      <InputModal service={service} id={id} />
    </>
  );
}
