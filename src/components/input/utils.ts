import { HTMLProps } from 'react';
import { z } from 'zod';

export const commonInputOptions = z.object({
  size: z.number().optional(),
  multiple: z.boolean().optional(),
  enabled: z.coerce.boolean().optional(),
  required: z.boolean().optional(),
  pattern: z.string().optional(),
  placeholder: z.string().optional(),
  value: z.string().optional(),
  show: z.boolean().optional(),
});

export function commonParameters<T>(options?: z.infer<typeof commonInputOptions>, defineShow: boolean = false): T {
  const params: HTMLProps<HTMLInputElement> = {};

  params.size = options?.size;
  params.multiple = options?.multiple;
  params.required = options?.required;
  params.pattern = options?.pattern;
  params.placeholder = options?.placeholder;
  params.value = options?.value;

  if (options?.enabled === false) {
    params.disabled = true;
  }

  if (defineShow && options?.show === false) {
    params.style = { display: 'none' };
  }

  return params as T;
}
