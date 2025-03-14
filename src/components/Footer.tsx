import {useMemo} from "react";
import Navbar from 'react-bootstrap/Navbar';
import {Carousel, Container} from "react-bootstrap";

import {frontendCollection, getJupyterName, jupyterHubData, staticUrl} from "../gloabals.ts";
import {link, servers, users} from "../assets/icons"
import "../assets/css/Footer.css"

const logoWidth = "220px"
const footerMargin = "m-2"
const divClasses = "px-2 text-center"

// Define how many items per screen size
const breakpoints = {
    xl: 5, // Extra-large screens (≥1200px)
    lg: 4, // Large screens (≥992px)
    md: 3, // Medium screens (≥768px)
    sm: 2, // Small screens (≥576px)
    xs: 1  // Extra-small screens (<576px)
};

// Function to get the number of items per page based on window width
function getItemsPerPage(): number {
    const width = window.innerWidth
    if (width >= 1200) return breakpoints.xl;
    if (width >= 992) return breakpoints.lg;
    if (width >= 768) return breakpoints.md;
    if (width >= 576) return breakpoints.sm;
    return breakpoints.xs;
}

// Generate a random integer string of length len
function randomInt(len: number): string {
    let result = '';
    for (let i = 0; i < len; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
}

function numberOfUsers(system: string) {
    let systemSvg, urlSuffix, tooltipTitle;

    if (system === "jupyter") {
        systemSvg = users;
        urlSuffix = "";
        tooltipTitle = "Number of active users in the last 24 hours";
    } else if (system === "jsccloud") {
        systemSvg = servers;
        urlSuffix = "var-system=JSC-Cloud";
        tooltipTitle = "Number of active servers";
    } else {
        systemSvg = link;
        urlSuffix = `var-system=${system.toUpperCase()}`;
        tooltipTitle = "Number of active servers";
    }

    return <a className="system-users d-inline-block text-muted ms-1"
              data-bs-toggle="tooltip" data-bs-placement="top"
              title={tooltipTitle}
              href={`https://${frontendCollection.hostname}/grafana/?${urlSuffix}`}
              target="_blank">
        <span id={`${system}-users`}>0</span>
        <span>{systemSvg}</span>
        <div className="system-users-link-div d-inline-block">
           <span className="system-users-link" id={`${system}-users-link`}>{link}</span>
        </div>
    </a>
}

function checkImageExists(imageSrc: string, callback: (exists: boolean) => void) {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => callback(true);
    img.onerror = () => callback(false);
}

function Ampel({system, systemId}: { system: string; systemId: number }) {
    const systemLower = system.toLowerCase();
    const imgVersion = randomInt(10);
    const nameMapping = {
        "JUPYTER": getJupyterName(),
        "JSCCLOUD": "JSC-Cloud",
        "DENBICLOUD": "deNBI-Cloud",
        "TUDSTAGING": "TUD-Staging",
        "HLRSSTAGING": "HLRS-Staging",
        "LRZSTAGING": "LRZ-Staging"
    };

    // @ts-expect-error ToDo
    const displayName = nameMapping[system] || system;

    const knownSystem = ["JUPYTER", "JUWELS", "JURECA", "JEDI", "JUSUF", "DEEP", "JSCCLOUD"].includes(system)
    const imageSource = knownSystem
        ? staticUrl("images", "footer", "systems", `${systemLower}.svg?v=${imgVersion}`)
        : staticUrl("images", "footer", "templates", `0.svg?v=${imgVersion}`)

    if (knownSystem) {
        checkImageExists(imageSource, (exists) => {
            if (!exists) {
                const newImgSrc = `${staticUrl}/images/footer/templates/0.svg?v=${imgVersion}`;
                for (const img of document.querySelectorAll<HTMLImageElement>(`#ampel-${systemLower} .ampel-img`)) {
                    img.src = newImgSrc;
                }
            }
        });
    }

    return <div id={`ampel-${systemLower}`} className="text-center" data-system={system} data-systemlower={systemLower}>
        <img className="ampel-img" src={imageSource}/>
        <a id={`ampel-${systemLower}-tooltip`}
           href={knownSystem ? `https://status.jsc.fz-juelich.de/services/${systemId}` : undefined}
           target="_blank"
           className="align-middle"
           data-bs-toggle="tooltip"
           data-bs-placement="top">
            ${displayName}
        </a>
        ${numberOfUsers(systemLower)}
    </div>
}

function getSystemDefaultOrder() {
    const order: [string, number][] = [["JUPYTER", frontendCollection.incidentCheck.services["JUPYTER"] ?? 40]]

    Object.entries(frontendCollection.systemConfig)
        .sort((a, b) => a[1].weight - b[1].weight)
        .forEach(a => {
            const system = a[0].toUpperCase().replace("_", "")
            const statusId = frontendCollection.incidentCheck.services[system] ?? 0
            order.push([system, statusId])
        })

    return order
}

function CarouselPage({pageNum, start, numElements}: {pageNum: number, start: number, numElements: number}) {
    const order = useMemo<[string, number][]>(getSystemDefaultOrder, [])

    return <Carousel.Item>
        <div className="d-flex justify-content-evenly" id={`systems-page-${pageNum}`}>
            {
                ...order
                    .slice(start, start + numElements)
                    .map(systemConfig => <Ampel system={systemConfig[0]} systemId={systemConfig[1]} />)
            }
        </div>
    </Carousel.Item>
}

// Function to dynamically create carousel pages
function createCarouselPages() {
    const items = []

    const itemsPerPage = getItemsPerPage();
    const totalSystems: number = getSystemDefaultOrder().length; // Total number of systems
    let pageNum = 1;

    for (let i = 0; i < totalSystems; i += itemsPerPage) {
        items.push(<CarouselPage pageNum={pageNum} start={i} numElements={Math.min(totalSystems - i, itemsPerPage)} />);
        pageNum++;
    }

    return items;
}


// function reorderSystems(incidentsData) {
//     const systemsDefaultOrder = JSON.parse("{{ systems_default_order | tojson }}");
//
//     // Create copy of data and filter it
//     const systemsFiltered = {...incidentsData};
//     for (let key in systemsFiltered) {
//         if (systemsFiltered[key].health < 30) delete systemsFiltered[key];
//     }
//     delete systemsFiltered["JUPYTER"]; // Jupyter should always be first
//
//     const systemsFilteredandSortedBySeverity = Object.keys(systemsFiltered).sort((a, b) => systemsFiltered[a]["health"] < systemsFiltered[b]["health"]);
//
//     // Finally, create sorted list with all systems
//     const systemsSorted = ["JUPYTER"];
//     systemsFilteredandSortedBySeverity.forEach((system) => {
//         systemsSorted.push(system);
//     });
//     systemsDefaultOrder.forEach((systemConfig: [string, string]) => {
//         const system = systemConfig[0];
//         if (!systemsSorted.includes(system)) {
//             systemsSorted.push(system);
//         }
//     })
//
//     const carousel_exists = !!document.querySelector("#footerSystemsCarousel");
//     // Recreate footer with systems in the sorted order
//     const itemsPerPage = getItemsPerPage();
//     for (const [index, system] of systemsSorted.entries()) {
//         let ampel = $(`#ampel-${system.toLowerCase()}`);
//         ampel.remove();
//         if (!carousel_exists) {
//             $("#systems-page-1").append(ampel);
//         } else {
//             if (index < itemsPerPage) $("#systems-page-1").append(ampel);
//             else if (index < 2 * itemsPerPage) $("#systems-page-2").append(ampel);
//             else $("#systems-page-3").append(ampel);
//         }
//     }
// }
//
// const incidentsThresholdInteractiveFooter = {{ frontendCollection.get("incidentCheck", {}).get("healthThreshold", {}).get("interactive", 50) | tojson }};
//
// $(`[data-sse-incidents]`).on("sse", function (event, incidents) {
//     $(`[id^='ampel-'][id$='-tooltip']`).tooltip("dispose");
//     let newMaintenanceList = [];
//     for (const [system, systemInfo] of Object.entries(incidents)) {
//         if (systemInfo.incident) {
//             $(`#ampel-${system.toLowerCase()}-tooltip`)
//                 .attr('data-bs-original-title', systemInfo.incident);
//             if ( systemInfo.health > incidentsThresholdInteractiveFooter ) {
//                 const _system = incidentsmapping[system] ?? system;
//                 if ( !newMaintenanceList.includes(_system) ) {
//                     newMaintenanceList.push(_system);
//                 }
//             }
//         }
//     }
//     globalMaintenanceSystems = newMaintenanceList;
//     $(`[id$='-option-input']`).trigger("option");
//     $(`[id^='ampel-'][id$='-tooltip']`).tooltip();
//     reorderSystems(incidents);
// });
//
// $(`[data-sse-usercount]`).on("sse", function (event, data) {
//     var systems = {};
//     $("div[id^='ampel']").each((i, e) => {
//         let system = $(e).attr("id").split('-')[1];
//         systems[system] = false;
//     })
//     $(`[id^='ampel-'][id$='-tooltip']`).tooltip("dispose");
//     for (const [system, usercount] of Object.entries(data)) {
//         switch (system) {
//             case 'jupyterhub':
//                 $("#jupyter-users").html(usercount);
//                 systems['jupyter'] = true;
//                 break;
//             case 'JSC-Cloud':
//                 $(`#jsccloud-users`).html(usercount['total']);
//                 systems['jsccloud'] = true;
//                 break;
//             default:
//                 $(`#${system.toLowerCase()}-users`).html(usercount['total']);
//                 systems[`${system.toLowerCase()}`] = true;
//                 var partitionInfos = "";
//                 for (const [partition, users] of Object.entries(usercount['partitions'])) {
//                     partitionInfos += `\n${partition}: ${users}`;
//                 }
//                 $(`#${system.toLowerCase()}-users`)
//                     .parents("[data-toggle]").tooltip("dispose");
//                 $(`#${system.toLowerCase()}-users`)
//                     .parents("[data-bs-toggle]")
//                     .attr("data-bs-original-title", `Number of active servers${partitionInfos}`);
//                 $(`#${system.toLowerCase()}-users`)
//                     .parents("[data-toggle]").tooltip();
//         }
//     }
//     // If there was no info about a system, set running labs to 0 and reset tooltip
//     for (const [system, systemInfo] of Object.entries(systems)) {
//         if (systemInfo == false) {
//             $(`#${system.toLowerCase()}-users`)
//                 .parents("[data-toggle]").tooltip("dispose");
//             $(`#${system.toLowerCase()}-users`).html(0);
//             $(`#${system.toLowerCase()}-users`)
//                 .parents("[data-toggle]")
//                 .attr("data-bs-original-title", `Number of active servers`);
//             $(`#${system.toLowerCase()}-users`)
//                 .parents("[data-toggle]").tooltip();
//         }
//     }
// });

export default function Footer() {
    // const usercount = useSseEvent("usercount");
    // const incidents = useSseEvent("incidents");

    return <Navbar className="flex-column mt-auto p-0">
        <Container fluid id="footer-top" className="justify-content-evenly p-4">
            <Carousel controls slide variant="dark" id="footerSystemsCarousel">
                {...createCarouselPages()}
            </Carousel>
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
                <a href={`mailto:ds-support@fz-juelich.de?subject=${getJupyterName()} Support&amp;body=Please describe your problem here. (english or german)`}>Support</a>
            </div>
            <div className={`py-4 ${divClasses}`}>
                <a href="https://www.helmholtz.de/en/" target="_blank">
                    <img id="helmholtz-logo" width={logoWidth} src={staticUrl("images", "footer", "helmholtz.png")} />
                </a>
            </div>
        </Container>
    </Navbar>
}