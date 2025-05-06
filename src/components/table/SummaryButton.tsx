import { Button } from 'react-bootstrap';
import { DeleteIcon, NaIcon, OpenIcon, StartIcon, StopIcon } from '@/assets/icons';
import { services, SummaryButtonType } from '@/services';
import { useRef } from 'react';

const summaryButtonMapping = {
  start: {
    label: 'Start',
    icon: <StartIcon />,
    variant: 'primary',
  },
  open: {
    label: 'Open',
    icon: <OpenIcon />,
    variant: 'success',
  },
  stop: {
    label: 'Stop',
    icon: <StopIcon />,
    variant: 'danger',
  },
  cancel: {
    label: 'Cancel',
    icon: <StopIcon />,
    variant: 'danger',
  },
  delete: {
    label: 'Delete',
    icon: <DeleteIcon />,
    variant: 'danger',
  },
  na: {
    label: 'N/A',
    icon: <NaIcon />,
    variant: 'secondary',
  },
};

type SummayButtonProps = {
  service: string;
  row: string;
  type: SummaryButtonType;
  visible?: boolean;
};

export function SummaryButton({ service, row, type, visible = true }: SummayButtonProps) {
  const id = `${service}-${row}-${type}-btn-header`;
  const options = summaryButtonMapping[type];

  const buttonRef = useRef<HTMLButtonElement>(null);
  const onClick = () => services[service].summaryButtons[type]?.(service, row, buttonRef.current);

  return (
    <Button
      variant={options.variant}
      id={id}
      className={`ms-1 ${type == 'na' ? 'btn-na-lab disabled' : ''}`}
      onClick={onClick}
      ref={buttonRef}
      hidden={!visible}
    >
      {options.icon} {options.label}
    </Button>
  );
}
