// type serviceId = string;
// type rowId = string;
//
// type tabOptions = {
//   displayName: string;
//
// }
//

import { InputElementProps } from '@/components/input';

type NavbarItem = {
  displayName: string;
  show?: boolean;
  firstRow?: boolean;
  defaultRow?: boolean;
  margins?: string;
};

type TabItem = {
  center: Record<string, InputElementProps['elementOptions']>;
};

export type ServiceConfig = {
  // fillingOrder: string[];
  navbar: Record<string, NavbarItem>;
  tabs: Record<string, TabItem>;
  // default:
};
