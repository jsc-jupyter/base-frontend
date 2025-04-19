import { services } from '@/services';
import { Button, Container, Image, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { useState } from 'react';
import '@/assets/css/Sidebar.css';
import { ChevronIcon } from '@/assets/icons';

type SidebarProps = {
  onSelected: (name: string) => void;
};

export function Sidebar({ onSelected }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const items = Object.entries(services).map(([name, service]) => (
    <ToggleButton id={`service-${name}`} value={name} className="d-flex flex-row align-items-center p-2">
      <Image thumbnail src={service.iconPath} />
      <span className="sidebar-item-text fs-5 ms-3">{service.displayName}</span>
    </ToggleButton>
  ));

  return (
    <Container
      fluid
      id="sidebar"
      className={`h-100 p-4 text-dark bg-secondary ${collapsed ? 'sidebar-collapsed' : ''}`}
    >
      <div id="sidebar-header" className="pb-2 d-flex align-items-center">
        <span>Select Service:</span>
        <Button variant="primary" onClick={toggleSidebar} className="ms-auto">
          <ChevronIcon />
        </Button>
      </div>
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
    </Container>
  );
}
