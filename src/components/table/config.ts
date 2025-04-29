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

type NavbarItem = {
  displayName: string;
  show?: boolean;
  firstRow?: boolean;
  defaultRow?: boolean;
  margins?: string;
};

type TabItem = {
  // ToDo: Correct Type
  center: Record<string, object>;
};

export type ServiceConfig = {
  // fillingOrder: string[];
  navbar: Record<string, NavbarItem>;
  tabs: Record<string, TabItem>;
  // default:
};
