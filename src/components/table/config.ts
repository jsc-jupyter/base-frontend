// type serviceId = string;
// type rowId = string;
//
// type tabOptions = {
//   displayName: string;
//
// }
//
// type summaryButton = (serviceId: serviceId, rowId: rowId, buttonId: string, button_options: object, user: string, api: any, base_url: string, utils: any) => void;
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
