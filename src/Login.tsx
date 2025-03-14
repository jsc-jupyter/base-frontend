import { createRoot } from 'react-dom/client';
import { Page } from '@/Page.tsx';
import '@/assets/css/Login.css';
import { Button, Container, ListGroup, Row, Col } from 'react-bootstrap';
import { jupyterHubData, staticUrl } from '@/gloabals.ts';
import { HelpIcon } from '@/assets/icons';
import urlJoin from 'url-join';

// @ts-expect-error Buttons off: the sign-in options are for now just an informational list, September 2024
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ListItem({ id, image, alt }: { id: string; image: string; alt: string }) {
  return (
    <ListGroup.Item className="bg-light">
      {/*<Button variant="outline-light" type="button" id={id} >*/}
      <img src={staticUrl('images', 'pages', 'login', image)} alt={alt} className="logo rounded-3 py-1 my-2" />
      {/*</Button>*/}
    </ListGroup.Item>
  );
}

function LeftColumn() {
  return (
    <div id="accounts-login-div" className="d-flex col-md-7 justify-content-center align-items-center ps-5 pe-1">
      <Row className="g-0 w-100 d-flex justify-content-center align-items-center">
        <p className="fs-5 text-dark ps-3">
          Sign in using one of the following accounts
          <ListGroup variant="flush" className="my-2">
            <ListItem id="jsc-login" image="Logo_FZ_Juelich_jsc.png" alt="JSC-Account" />
            <ListItem id="helmholz-login" image="Helmholz_AAI_ID.png" alt="Helmholz AAI ID" />
            {/*<ListItem id="nfdi-login" image="nfdi_rgb_dark.png" alt="NFDI Login" />*/}
          </ListGroup>
        </p>
      </Row>
    </div>
  );
}

function RightColumn() {
  const onLogin = function () {
    window.location.href = urlJoin(jupyterHubData.baseUrl, 'oauth_login', window.location.search);
  };

  return (
    <Col id="button-login-div" className="d-flex h-100 px-5">
      <Row className="g-0 d-flex w-100">
        <div className="d-flex justify-content-center align-items-center pt-5">
          <Button variant="primary" size="lg" type="button" onClick={onLogin} className="shadow p-4">
            {/*<img src={staticUrl("images", "pages", "login", "User.svg")} alt="User" />*/}
            Sign In
          </Button>
        </div>
        <p className="fs-6 fw-light text-dark align-self-end text-center">
          No account yet?
          <a href="https://jupyterjsc.pages.jsc.fz-juelich.de/docs/jupyterjsc/authentication/" target="_blank">
            Help
            <HelpIcon />
          </a>
        </p>
      </Row>
    </Col>
  );
}

export function Login() {
  const backgroundImage = staticUrl('images', 'pages', 'login', 'background.jpg');

  return (
    <Page>
      <Row className="g-0 h-100 justify-content-center">
        <div
          id="login-background"
          className="col-12 flex-column d-flex justify-content-center align-items-center h-100"
          style={{ background: `url(${backgroundImage}) center center no-repeat`, backgroundSize: 'cover' }}
        >
          <Container className="border shadow rounded-3 bg-light py-5">
            <Row className="g-0 justify-content-center w-100">
              <LeftColumn />
              <RightColumn />
            </Row>
          </Container>
        </div>
      </Row>
    </Page>
  );
}

createRoot(document.getElementById('root')!).render(<Login />);
