import { InputHTMLAttributes } from 'react';

export type Options = {
  input: {
    options?: {
      size?: number;
      multiple?: boolean;
      enabled?: boolean;
      required?: boolean;
      pattern?: string;
      value?: string;
      show?: boolean;
    };
  };
};

export function elementParameters(options: Options, defineShow: boolean = false) {
  const params: InputHTMLAttributes<HTMLInputElement> = {};

  params.size = options.input.options?.size;
  params.multiple = options.input.options?.multiple;
  params.required = options.input.options?.required;
  params.pattern = options.input.options?.pattern;
  params.value = options.input.options?.value;

  if (options.input.options?.enabled != undefined) {
    params.disabled = !options.input.options.enabled;
  }

  if (defineShow && !options.input.options?.show) {
    params.style = { display: 'none' };
  }

  return params;
}
