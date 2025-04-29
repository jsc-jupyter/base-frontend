import { Button, Form } from 'react-bootstrap';
import { InfoIcon } from '@/assets/icons';

const textTypes = ['text', 'texticon', 'texticonclick', 'texticonclickcheckbox', 'textcheckbox', 'texticoncheckbox'];

export type InputLabelProps = {
  service: string;
  id: string;
  elementId: string;
  elementOptions: {
    label: {
      type: string;
      value: string;
      icontext: string;
      width?: number;
      options?: {
        name?: string;
        alignRight?: boolean;
      };
    };
  };
};

// @ts-expect-error Allow unused
export function InputLabel({ service, id, elementId, elementOptions }: InputLabelProps) {
  const label: InputLabelProps['elementOptions']['label'] = elementOptions.label ?? {};

  return (
    <Form.Label className={`col-${label.width ?? 4} col-form-label d-flex align-items-start justify-content-between`}>
      <label htmlFor={`${id}-${elementId}-input`} className="d-flex align-items-center w-100">
        {label.type in textTypes && label.value}
        {label.type in ['texticon', 'texticoncheckbox'] && (
          <a className="lh-1 ms-3" style={{ paddingTop: '1px' }} title={label.icontext}>
            <InfoIcon />
          </a>
        )}
        {label.type === 'texticonclick' && (
          <Button title={label.icontext}>
            <InfoIcon />
            <span className="text-muted" style={{ fontSize: 'smaller' }}>
              (click me)
            </span>
          </Button>
        )}
        {label.type in ['textcheckbox', 'texticoncheckbox', 'texticonclickcheckbox'] && (
          <input
            type="checkbox"
            style={{ marginLeft: (label.options?.alignRight ?? true) ? 'auto' : '.5em' }}
            name={label.options?.name}
          />
        )}
        {label.type === 'header' && <h4>{label.value}</h4>}
      </label>
    </Form.Label>
  );
}
