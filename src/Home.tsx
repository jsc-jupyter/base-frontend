import { Page } from '@/Page.tsx';
import { useMemo, useState } from 'react';
import { Sidebar } from '@/components/Sidebar.tsx';
import { ServiceTable } from '@/components/table/ServiceTable.tsx';
import { Col, Row } from 'react-bootstrap';
import { frontendCollection } from '@/gloabals.ts';
import { createRoot } from 'react-dom/client';
import '@/assets/css/Home.css';
import { RowSummary } from '@/components/table/RowSummary.tsx';
import { RowDetails } from '@/components/table/RowDetails.tsx';

function HomeTableHeader() {
  return (
    <>
      <th scope="col" style={{ width: '1%' }}></th>
      <th scope="col" style={{ width: '20%' }}>
        Name
      </th>
      <th scope="col">Configuration</th>
      <th scope="col" className="text-center" style={{ width: '10%' }}>
        Status
      </th>
      <th scope="col" className="text-center" style={{ width: '10%' }}>
        Action
      </th>
    </>
  );
}

export function Home() {
  const [service, setService] = useState<string>('jupyterlab');
  const spawners = useMemo(
    () =>
      Object.entries(frontendCollection.decrypted_user_options).filter(([_, options]) => options.service === service),
    [service],
  );

  // const description = <p>You can configure your existing JupyterLabs by expanding the corresponding table row.</p>;
  const description = <p>Selected Service: {service}</p>;

  return (
    <Page>
      <Row className="h-100">
        <Sidebar onSelected={setService} />
        <Col className="h-100">
          <ServiceTable service={service} description={description} header={<HomeTableHeader />}>
            {spawners.map(([row, options]) => (
              <>
                <RowSummary service={service} row={row} options={options} />
                <RowDetails service={service} row={row} />
              </>
            ))}
          </ServiceTable>
        </Col>
      </Row>
    </Page>
  );
}

createRoot(document.getElementById('root')!).render(<Home />);
