import Navbar from 'react-bootstrap/Navbar';
import { Container } from 'react-bootstrap';
import { getJupyterName, jupyterHubData, staticUrl } from '@/gloabals.ts';
import '@/assets/css/Footer.css';
import { SystemsCarousel } from '@/components/SystemsCarousel.tsx';

const logoWidth = '220px';
const footerMargin = 'm-2';
const divClasses = 'px-2 text-center';

export default function Footer() {
  return (
    <Navbar className="flex-column mt-auto p-0">
      <Container fluid id="footer-top" className="justify-content-evenly p-4">
        <SystemsCarousel />
      </Container>
      <Container fluid id="footer-bottom" className="justify-content-center">
        <a className={`py-2 ${divClasses}`} target="_blank" href="https://www.fz-juelich.de">
          &copy; Forschungszentrum Jülich
        </a>
        <div className={`flex-grow-1 ${divClasses}`}>
          <a href={`${jupyterHubData.baseUrl}imprint`}>Legal Notice</a>
          <span className={footerMargin}>|</span>
          <a href={`${jupyterHubData.baseUrl}privacy`}>Privacy Policy</a>
          <span className={footerMargin}>|</span>
          <a href={`${jupyterHubData.baseUrl}terms`}>Terms of Service</a>
          <span className={footerMargin}>|</span>
          <a
            href={`mailto:ds-support@fz-juelich.de?subject=${getJupyterName()} Support&amp;body=Please describe your problem here. (english or german)`}
          >
            Support
          </a>
        </div>
        <div className={`py-4 ${divClasses}`}>
          <a href="https://www.helmholtz.de/en/" target="_blank">
            <img id="helmholtz-logo" width={logoWidth} src={staticUrl('images', 'footer', 'helmholtz.png')} />
          </a>
        </div>
      </Container>
    </Navbar>
  );
}
