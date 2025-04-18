import { services } from '@/services';
import { Col, Image, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import '@/assets/css/Sidebar.css';

type SidebarProps = {
  onSelected: (name: string) => void;
  width: number;
};

export function Sidebar({ onSelected, width }: SidebarProps) {
  const items = Object.entries(services).map(([name, service]) => (
    <ToggleButton id={`service-${name}`} value={name} className="d-flex flex-row align-items-center fs-5">
      <Image thumbnail src={service.iconPath} className="me-3" />
      {service.displayName}
    </ToggleButton>
  ));

  return (
    <Col id="sidebar" className="h-100 p-2 text-dark bg-secondary" style={{ width: width }}>
      <h5>Select Service: </h5>
      <ToggleButtonGroup
        vertical
        name="serviceSelection"
        type="radio"
        defaultValue="jupyterlab"
        onChange={(name: string) => onSelected(name)}
        className="w-100"
      >
        {...items}
      </ToggleButtonGroup>
    </Col>
  );
}
