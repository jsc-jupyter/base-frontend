import { CSSProperties } from 'react';
import { Accordion, Form, Nav, Row, Tab } from 'react-bootstrap';
import { WarningIcon } from '@/assets/icons';
import { InputElement } from '@/components/input';
import { services } from '@/services';

type RowDetailsProps = {
  service: string;
  row: string;
};

// Instead of just .hide() it, we want to keep the width of the buttons, so the interface
// does not wabble around when showing / hiding buttons.
const styleHide: CSSProperties = {
  height: '0 !important',
  overflow: 'hidden !important',
  paddingTop: '0 !important',
  paddingBottom: '0 !important',
  border: 'none !important',
  margin: '0 !important',
};

export function RowDetails({ service, row }: RowDetailsProps) {
  const config = services[service].config;

  const navs = Object.entries(config.navbar).map(([name, navOptions]) => {
    // ToDo: firstRow and defaultRow
    return (
      <Nav.Link
        as="button"
        eventKey={name}
        id={`${service}-${row}-${name}-navbar-button`}
        className={`${navOptions.margins ?? 'mb-3'}`}
        style={navOptions.show ? {} : styleHide}
      >
        <span>{navOptions.displayName}</span>
        <span className="d-flex invisible">
          <WarningIcon />
          <span className="visually-hidden">settings changed</span>
        </span>
      </Nav.Link>
    );
  });

  const tabs = Object.entries(config.tabs).map(([tab, tabOptions]) => {
    const elements = Object.entries(tabOptions.center).map(([elementId, elementOptions]) => {
      return (
        <InputElement service={service} row={row} tab={tab} elementId={elementId} elementOptions={elementOptions} />
      );
    });

    return (
      <Tab.Pane eventKey={tab} active={tab == 'buttonrow' ? true : undefined}>
        <Row className="col-12">{...elements}</Row>
      </Tab.Pane>
    );
  });

  return (
    <tr>
      <td colSpan={100} className="p-0">
        <Accordion.Collapse eventKey={row}>
          <div className="d-flex align-items-start m-3">
            <Tab.Container defaultActiveKey={Object.entries(config.tabs)[0][0]}>
              <Nav variant="pills" className="flex-column p-3 ps-0" style={{ minWidth: '15% !important' }}>
                {...navs}
              </Nav>
              <Tab.Content className="w-100">
                <Form>{...tabs}</Form>
              </Tab.Content>
            </Tab.Container>
          </div>
        </Accordion.Collapse>
      </td>
    </tr>
  );
}
