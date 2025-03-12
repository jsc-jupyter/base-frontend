// import {FrontendCollectionContext} from "../context.ts";
// import {useContext} from "react";


export default function Footer() {
    // const frontendCollection = useContext(FrontendCollectionContext);

    return <footer className="navbar mt-auto p-0">
        <div id="footer-top" className="container-fluid justify-content-evenly p-4">
            <div id="footerSystemsCarousel" data-sse-usercount className="carousel carousel-dark slide w-100"
                 data-bs-ride="carousel" data-bs-interval="10000">
                <div id="carousel-inner" className="carousel-inner"></div>
                <button className="carousel-control-prev" type="button" data-bs-target="#footerSystemsCarousel"
                        data-bs-slide="prev" style={{width: "unset"}}>
                    <span className="carousel-control-prev-icon"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#footerSystemsCarousel"
                        data-bs-slide="next" style={{width: "unset"}}>
                    <span className="carousel-control-next-icon"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>
        </div>
        <div id="footer-bottom" className="container-fluid justify-content-center" data-sse-incidents>
            <a className="py-2 px-2 text-center" target="_blank" href="https://www.fz-juelich.de">&copy; Forschungszentrum Jülich</a>
            <div className="flex-grow-1 px-2 text-center">
                <a href="{{ base_url }}imprint">Legal Notice</a>
                <span className="m-1">|</span>
                <a href="{{ base_url }}privacy">Privacy Policy</a>
                <span className="m-1">|</span>
                <a href="{{ base_url }}terms">Terms of Service</a>
                <span className="m-1">|</span>
                <a href="mailto:ds-support@fz-juelich.de?subject=jupyterJSC Support&amp;body=Please describe your problem here. (english or german)">Support</a>
            </div>
            <div className="py-4 px-2 text-center">
                <a href="https://www.helmholtz.de/en/" target="_blank">
                    <img id="helmholtz-logo" width="220px" src='{{ static_url("images/footer/helmholtz.png", include_version=True) }}'/>
                </a>
            </div>
        </div>
    </footer>
}