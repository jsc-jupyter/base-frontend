import { Col } from 'react-bootstrap';

type ConfigItemProps = {
  name: string;
  value: string;
  id: string;
  hidden?: boolean;
};

export function ConfigItem({ name, value, id, hidden }: ConfigItemProps) {
  return (
    <Col lg={3} hidden={hidden} id={`${id}-div`} className="text-lg-center">
      <span className="text-muted" style={{ fontSize: 'smaller' }}>
        {name}
      </span>
      <br />
      <span id={id}>{value}</span>
    </Col>
  );
}
