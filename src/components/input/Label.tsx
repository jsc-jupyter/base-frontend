import { Button, Form } from 'react-bootstrap';
import { InfoIcon } from '@/assets/icons';
import { z } from 'zod';
import { InputElementPropsBase } from '@/components/input/index.tsx';

const textLabel = z.object({
  value: z.string(),
  width: z.number().optional(),
});

const iconLabel = z.object({
  icontext: z.string(),
});

const checkboxLabel = z.object({
  options: z.object({
    name: z.string().optional(),
    alignRight: z.boolean().optional(),
  }),
});

export const labelDetails = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text') }).merge(textLabel),
  z
    .object({ type: z.literal('texticon') })
    .merge(textLabel)
    .merge(iconLabel),
  z
    .object({ type: z.literal('texticonclick') })
    .merge(textLabel)
    .merge(iconLabel),
  z
    .object({ type: z.literal('texticonclickcheckbox') })
    .merge(textLabel)
    .merge(iconLabel)
    .merge(checkboxLabel),
  z
    .object({ type: z.literal('textcheckbox') })
    .merge(textLabel)
    .merge(checkboxLabel),
  z
    .object({ type: z.literal('texticoncheckbox') })
    .merge(textLabel)
    .merge(iconLabel)
    .merge(checkboxLabel),
  z.object({ type: z.literal('header') }).merge(textLabel),
]);

export const labelOptions = z.object({
  type: z.literal('label'),
});

export function InputLabel({ prefix, elementId, elementOptions }: InputElementPropsBase<typeof labelOptions>) {
  if (!elementOptions.label) {
    return <></>;
  }

  const label = elementOptions.label;
  return (
    <Form.Label
      htmlFor={`${prefix}-${elementId}-input`}
      column={true}
      className={`col-${label.width ?? 4} d-flex align-items-start justify-content-between`}
    >
      {label.type !== 'header' && label.value}
      {(label.type === 'texticon' || label.type === 'texticoncheckbox') && (
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
      {(label.type === 'textcheckbox' ||
        label.type === 'texticonclickcheckbox' ||
        label.type === 'texticoncheckbox') && (
        <input
          type="checkbox"
          style={{ marginLeft: (label.options?.alignRight ?? true) ? 'auto' : '.5em' }}
          name={label.options?.name}
        />
      )}
      {label.type === 'header' && <h4>{label.value}</h4>}
    </Form.Label>
  );
}
