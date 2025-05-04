import { Button } from 'react-bootstrap';
import { z } from 'zod';
import { InputModal } from './Modal.tsx';
import {
  DeleteIcon,
  OpenIcon,
  PlusIcon,
  ResetIcon,
  RetryIcon,
  SaveIcon,
  ShareIcon,
  StartIcon,
  StopIcon,
} from '@/assets/icons';
import { InputElementPropsBase } from './index.tsx';

const types = {
  cancel: {
    variant: 'danger',
    svg: <StopIcon />,
    text: 'Cancel',
  },
  create: {
    variant: 'primary',
    svg: <PlusIcon />,
    text: 'Create',
  },
  delete: {
    variant: 'danger',
    svg: <DeleteIcon />,
    text: 'Delete',
  },
  new: {
    variant: 'primary',
    svg: <PlusIcon />,
    text: 'New',
  },
  open: {
    variant: 'success',
    svg: <OpenIcon />,
    text: 'Open',
  },
  reset: {
    variant: 'danger',
    svg: <ResetIcon />,
    text: 'Reset',
  },
  retry: {
    variant: 'success',
    svg: <RetryIcon />,
    text: 'Retry',
  },
  save: {
    variant: 'success',
    svg: <SaveIcon />,
    text: 'Save',
  },
  share: {
    variant: '',
    svg: <ShareIcon />,
    text: 'Share',
  },
  start: {
    variant: 'success',
    svg: <StartIcon />,
    text: 'Start',
  },
  startblue: {
    variant: 'primary',
    svg: <StartIcon />,
    text: 'Start',
  },
  startgreen: {
    variant: 'success',
    svg: <StartIcon />,
    text: 'Start',
  },
  stop: {
    variant: 'success',
    svg: <StopIcon />,
    text: 'Stop',
  },
};

const [first, ...other] = Object.keys(types) as (keyof typeof types)[];
const buttonTypes = z.enum([first, ...other]);

const buttonOptions = z.object({
  text: z.string().optional(),
  alignRight: z.boolean().optional(),
  textFirst: z.boolean().optional(),
});

type ButtonProps = {
  service: string;
  id: string;
  type: z.infer<typeof buttonTypes>;
  options: z.infer<typeof buttonOptions>;
};

function InputButton({ service, id, type, options }: ButtonProps) {
  const defaults = types[type];
  const text = options.text ?? defaults.text;

  return (
    <Button
      variant={defaults.variant}
      id={`${service}-${id}-${type}-btn`}
      className={(options.alignRight ?? false) ? 'ms-auto' : 'me-2'}
    >
      {(options.textFirst ?? false) ? (
        <>
          {text} {defaults.svg}
        </>
      ) : (
        <>
          {defaults.svg} {text}
        </>
      )}
    </Button>
  );
}

/*
 ToDo: There is a bug in zod, where we cannot represent the `buttons` array in the options.
  Issue: https://github.com/colinhacks/zod/issues/2195.
  Maybe use a custom validator/transform? Using passthrough for now.
*/
export const buttonRowOptions = z.object({
  type: z.literal('buttons'),
  options: z
    .object({
      buttons: z.array(buttonTypes),
    })
    .passthrough(),
});

export function InputButtonRow({ service, row, elementOptions }: InputElementPropsBase<typeof buttonRowOptions>) {
  const buttons = Object.entries(elementOptions.input.options)
    .filter(([type, _]) => type !== 'buttons') // Ignore the `buttons` array
    .map(([type, opts]) => {
      return (
        <InputButton service={service} id={row} type={buttonTypes.parse(type)} options={buttonOptions.parse(opts)} />
      );
    });

  return (
    <>
      <hr />
      <div className="d-flex" id={`${service}-${row}-buttons-div`}>
        {...buttons}
      </div>
      <InputModal service={service} id={row} />
    </>
  );
}
