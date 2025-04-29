import { Accordion, Container, Table } from 'react-bootstrap';
import { ReactNode } from 'react';

type TablesProps = {
  service?: string;
  // config?: any;
  description?: ReactNode;
  header?: ReactNode;
  children?: ReactNode;
};

export function ServiceTable({ service, description, header, children }: TablesProps) {
  // useSseEvent("reservations")

  if (!service) {
    return <></>;
  }

  // ToDo: Start first row open if no spawners exist
  return (
    <Container fluid id="global-content-div" className="p-4">
      {description}
      <Accordion>
        <Table bordered striped hover responsive="md" variant="light" className="align-middle">
          <thead className="table-secondary">
            <tr>{header}</tr>
          </thead>
          <tbody>{children}</tbody>
        </Table>
      </Accordion>
    </Container>
  );
}
