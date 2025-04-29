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
import { Button } from 'react-bootstrap';

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

type ButtonType = keyof typeof types;

export type InputButtonProps = {
  service: string;
  id: string;
  type: ButtonType;
  options: {
    text?: string;
    alignRight?: boolean;
    textFirst?: boolean;
    dependency?: object;
  };
};

export function InputButton({ service, id, type, options }: InputButtonProps) {
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
