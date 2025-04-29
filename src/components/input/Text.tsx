import { Button, FormControl, InputGroup, Row } from 'react-bootstrap';
import { elementParameters, Options } from '@/components/input/utils.ts';
import { InputLabel, InputLabelProps } from '@/components/input/Label.tsx';
import { CopyIcon } from '@/assets/icons';

export type InputTextProps = {
  service: string;
  id: string;
  elementId: string;
  elementOptions: Options & {
    input: {
      options?: {
        secret?: boolean;
        copy?: boolean;
        name?: string;
      };
    };
    label?: {
      width?: number;
    };
  };
};

export function InputText({ service, id, elementId, elementOptions = { input: {} } }: InputTextProps) {
  const secret = !!elementOptions.input.options?.secret;
  const copy = !!elementOptions.input.options?.copy;

  const inner = (
    <>
      {/* @ts-expect-error ToDo */}
      <FormControl
        type={secret ? 'password' : 'text'}
        name={`${elementOptions.input.options?.name ?? elementId}`}
        {...elementParameters(elementOptions)}
      />
      {secret ? (
        <>
          <span className="input-group-append">
            <Button variant="light">
              <i className="fa fa-eye" aria-hidden="true"></i>
            </Button>
          </span>
        </>
      ) : copy ? (
        <button
          type="button"
          title="Copy to clipboard"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-md border border-gray-300 hover:bg-gray-100 active:bg-gray-200"
        >
          <CopyIcon />
        </button>
      ) : (
        <></>
      )}
    </>
  );

  return (
    <Row class="mb-1" {...elementParameters(elementOptions, true)}>
      {/* @ts-expect-error ToDo */}
      <InputLabel service={service} id={id} elementId={elementId} elementOptions={elementOptions as InputLabelProps} />
      <div className={`col-${12 - (elementOptions.label?.width ?? 4)} d-flex flex-column justify-content-center`}>
        {secret || copy ? <InputGroup>{inner}</InputGroup> : inner}
      </div>
    </Row>
  );
}
