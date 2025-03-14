import { Container, Dropdown, Nav, Navbar } from "react-bootstrap";

import { authState, frontendCollection, jupyterHubData, staticUrl } from "../gloabals.ts";
import "../assets/css/Header.css";

function UserDropdown() {
    const displayName = authState.oauth_user?.name ?? "ToDo!";

    return <Dropdown>
        <Dropdown.Toggle type="button" variant="outline-primary" className="mb-2">{displayName}</Dropdown.Toggle>
        <Dropdown.Menu className="w-100">
            <Dropdown.Item id="logout">
                <svg className="align-middle bi bi-box-arrow-right" xmlns="http://www.w3.org/2000/svg" width="16"
                     height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd"
                          d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                    <path fill-rule="evenodd"
                          d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                </svg>
                <span className="align-middle">Logout</span>
            </Dropdown.Item>
        </Dropdown.Menu>
    </Dropdown>
}

function Navigation({prefix}: {prefix: string}) {
    const loggedInItems = <>
        <Nav.Item>
            <a id={`${prefix}start-nav-item`} className="nav-link text-decoration-none"
               href={`${jupyterHubData.baseUrl}home`}>
                JupyterLab
            </a>
        </Nav.Item>
        { authState.groups.includes("geant:dfn.de:fz-juelich.de:jsc:jupyter:workshop_instructors")
            && <Nav.Item>
                <a id={`${prefix}workshop-manage-nav-item`} className="nav-link text-decoration-none"
                   href={`${jupyterHubData.baseUrl}workshopmanager`}>
                    Manage Workshops
                </a>
            </Nav.Item>
        }
        { jupyterHubData.adminAccess
            && <Nav.Item>
                <a id={`${prefix}admin-nav-item`} className="nav-link text-decoration-none"
                   href={`${jupyterHubData.baseUrl}admin`}>
                    Admin
                </a>
            </Nav.Item>
        }
    </>

    return <Nav>
        { jupyterHubData.user && loggedInItems }
        <Nav.Item>
            <a id={`${jupyterHubData.prefix}docs-nav-item`} className="nav-link text-decoration-none"
               target="_blank" href="https://docs.jupyter.jsc.fz-juelich.de">
                Documentation
            </a>
        </Nav.Item>
    </Nav>
}

export default function Header() {
    return <Navbar variant="light" expand="lg" className="bg-white pb-0">
        <Container fluid>
            <Navbar.Brand href="https://fz-juelich.de/jsc/en" target="_blank">
                <img id="jsc-logo" className="p-3" width="335px" title="https://fz-juelich.de/jsc/en" alt='JSC'
                     src={staticUrl("images", "header", "jsc.png")}/>
            </Navbar.Brand>

            <Navbar.Toggle type="button" className="mb-4" />
            <Navbar.Collapse className="align-self-end">
                <Navigation prefix=""/>
            </Navbar.Collapse>

            <div className="d-flex flex-column align-items-end ms-auto">
                <Navbar.Brand href="/">
                    <img id="jupyter-logo" src={staticUrl("images", "header", "jupyterjsc.png")}
                         height="60px" alt="Jupyter-JSC"
                         title={`${frontendCollection.hostname}${jupyterHubData.baseUrl}`}/>
                </Navbar.Brand>
                <UserDropdown />
            </div>
        </Container>
        <Navbar.Collapse className="d-lg-none" id="navbarCollapsibleContent" style={{marginLeft: "2rem"}} >
            <Navigation prefix="collapse-" />
        </Navbar.Collapse>
    </Navbar>
}