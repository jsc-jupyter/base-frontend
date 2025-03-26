import { useSseEvent } from '@/sse.ts';
import { Carousel, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useMemo } from 'react';
import { frontendCollection, getJupyterName, staticUrl } from '@/gloabals.ts';
import { LinkIcon, ServersIcon, UsersIcon } from '@/assets/icons';
import { chunkArray } from '@/utils.ts';

function Usercount({ system }: { system: System }) {
  let systemSvg, usercount, urlSuffix, tooltipTitle;

  const systemLower = system.name.toLowerCase();
  if (systemLower === 'jupyter') {
    systemSvg = <UsersIcon />;
    usercount = system.users as number;
    urlSuffix = '';
    tooltipTitle = 'Number of active users in the last 24 hours';
  } else if (systemLower === 'jsccloud') {
    systemSvg = <ServersIcon />;
    usercount = (system?.users as Users)?.total;
    urlSuffix = 'var-system=JSC-Cloud';
    tooltipTitle = 'Number of active servers';
  } else {
    systemSvg = <LinkIcon />;
    usercount = (system?.users as Users)?.total;
    urlSuffix = `var-system=${systemLower.toUpperCase()}`;
    tooltipTitle = 'Number of active servers';
  }

  const tooltip = <Tooltip placement="top">{tooltipTitle}</Tooltip>;

  return (
    <OverlayTrigger overlay={tooltip} delay={{ show: 600, hide: 0 }}>
      <a
        className="system-users d-inline-block text-muted ms-1"
        href={`https://${frontendCollection.hostname}/grafana/?${urlSuffix}`}
        target="_blank"
      >
        <span id={`${systemLower}-users`}>{usercount}</span>
        {systemSvg}
        <div className="system-users-link-div d-inline-block">
          <span className="system-users-link" id={`${systemLower}-users-link`}>
            <LinkIcon />
          </span>
        </div>
      </a>
    </OverlayTrigger>
  );
}

function checkImageExists(imageSrc: string, callback: (exists: boolean) => void) {
  const img = new Image();
  img.src = imageSrc;
  img.onload = () => callback(true);
  img.onerror = () => callback(false);
}

function Ampel({ system }: { system: System }) {
  const systemLower = system.name.toLowerCase();

  const knownSystem = ['JUPYTER', 'JUWELS', 'JURECA', 'JEDI', 'JUSUF', 'DEEP', 'JSCCLOUD'].includes(system.name);
  const imageSource = knownSystem
    ? staticUrl('images', 'footer', 'systems', `${systemLower}.svg`)
    : staticUrl('images', 'footer', 'templates', `0.svg`);

  if (knownSystem) {
    checkImageExists(imageSource, exists => {
      if (!exists) {
        const newImgSrc = `${staticUrl}/images/footer/templates/0.svg`;
        for (const img of document.querySelectorAll<HTMLImageElement>(`#ampel-${systemLower} .ampel-img`)) {
          img.src = newImgSrc;
        }
      }
    });
  }

  return (
    <div id={`ampel-${systemLower}`} className="text-center">
      <img className="ampel-img" alt={`${system.serviceId}`} src={imageSource} />
      <a
        id={`ampel-${systemLower}-tooltip`}
        href={knownSystem ? `https://status.jsc.fz-juelich.de/services/${system.serviceId}` : undefined}
        target="_blank"
        className="align-middle"
      >
        {system.displayName}
      </a>
      <Usercount system={system} />
    </div>
  );
}

function CarouselPage({ i, systems }: { i: number; systems: System[] }) {
  return (
    <Carousel.Item>
      <div className="d-flex justify-content-evenly" id={`systems-page-${i}`}>
        {...systems.map(systemConfig => <Ampel system={systemConfig} />)}
      </div>
    </Carousel.Item>
  );
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

// Number of systems per Carousel page based on window width
function getItemsPerPage(): number {
  const width = window.innerWidth;
  if (width >= 1200) return 5;
  if (width >= 992) return 4;
  if (width >= 768) return 3;
  if (width >= 576) return 2;
  return 1;
}

function getSystemDefaultOrder() {
  const order: [string, number][] = [['JUPYTER', frontendCollection.incidentCheck.services['JUPYTER'] ?? 40]];

  Object.entries(frontendCollection.systemConfig)
    .sort((a, b) => a[1].weight - b[1].weight)
    .forEach(a => {
      const system = a[0].toUpperCase().replace('_', '');
      const statusId = frontendCollection.incidentCheck.services[system] ?? 0;
      order.push([system, statusId]);
    });

  return order;
}

type Users = {
  total: number;
  partitions: Record<string, number>;
};

type System = {
  name: string;
  displayName: string;
  serviceId: number;
  users?: number | Users;
  systemInfo?: { incident: string; health: number };
};

const systemDisplayNames: Record<string, string> = {
  JUPYTER: getJupyterName(),
  JSCCLOUD: 'JSC-Cloud',
  DENBICLOUD: 'deNBI-Cloud',
  TUDSTAGING: 'TUD-Staging',
  HLRSSTAGING: 'HLRS-Staging',
  LRZSTAGING: 'LRZ-Staging',
};

function parseSystems(
  defaultOrder: [string, number][],
  usercounts: Record<string, object>,
  incidents: Record<string, object>,
): System[] {
  const systems = new Set([...defaultOrder.map(e => e[0]), ...Object.keys(usercounts)]);

  return [...systems].map(name => {
    const idx = defaultOrder.findIndex(e => e[0] == name);

    return {
      name: name,
      displayName: systemDisplayNames[name] ?? name,
      serviceId: idx != -1 ? defaultOrder[idx][1] : 0,
      users: usercounts[name] ?? undefined,
      systemInfo: incidents[name] ?? undefined,
    } as System;
  });
}

export function SystemsCarousel() {
  const defaultOrder = useMemo<[string, number][]>(getSystemDefaultOrder, []);
  const usercounts = useSseEvent<Record<string, object>>('usercount', {});
  const incidents = useSseEvent<Record<string, object>>('incidents', {});

  const systems = parseSystems(defaultOrder, usercounts, incidents);

  const itemsPerPage = useMemo<number>(getItemsPerPage, []);

  return (
    <Carousel
      controls
      slide
      variant="dark"
      interval={10000}
      indicators={false}
      className="w-100"
      id="footerSystemsCarousel"
    >
      {chunkArray(systems, itemsPerPage).map((chunk, i) => (
        <CarouselPage i={i} systems={chunk} />
      ))}
    </Carousel>
  );
}
