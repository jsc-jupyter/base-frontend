

require(["jquery", "utils"], function (
  $,
  utils
) {

  
  $(document).on("click", '.open-workshop-btn', function() {
    const $this =$(this);
    const rowId = $this.attr('data-row');
    window.open(`${window.origin}/workshops/${rowId}`);
  });

  $(document).on("click", `[id$='-sharecopy-btn-header']`, function () {
    const $this = $(this);
    const serviceId = $this.attr("data-service");
    const rowId = $this.attr("data-row");
    // const originalIcon = $this.find(".copy-icon").html();
    const shareId = globalUserOptions[serviceId][rowId].share_id;
    let tooltipInstance = bootstrap.Tooltip.getInstance($this);
    let url = utils.url_path_join(window.origin, "share", shareId).replace("//", "/");

    navigator.clipboard.writeText(url).then(() => {
      $this.html(getSvg("check"));
      setTimeout(function () {
        if (tooltipInstance) {
          tooltipInstance.hide();
        }
        $this.html(getSvg("copy"));
      }, 1000);
    }).catch(err => {
      console.error("Failed to copy:", err);
    });
  });

  $(document).on("click", `[id$='-workshopcopy-btn-header']`, function () {
    const $this = $(this);
    const serviceId = $this.attr("data-service");
    const rowId = $this.attr("data-row");
    // const originalIcon = $this.find(".copy-icon").html();
    const workshopId = globalUserOptions[serviceId][rowId].workshop_id;
    let tooltipInstance = bootstrap.Tooltip.getInstance($this);
    let url = utils.url_path_join(window.origin, "workshops", workshopId).replace("//", "/");

    navigator.clipboard.writeText(url).then(() => {
      $this.html(getSvg("check"));
      setTimeout(function () {
        if (tooltipInstance) {
          tooltipInstance.hide();
        }
        $this.html(getSvg("copy"));
      }, 1000);
    }).catch(err => {
      console.error("Failed to copy:", err);
    });
  });
});

  let logDebug = false;




    // Define the regex pattern with named capture groups
    const serviceConfig = getFrontendCollection()?.serviceConfig || {};
    const userModulesConfig = getFrontendCollection()?.userModules || {};
    const systemConfig = getFrontendCollection()?.systemConfig || {};
    const resourcesConfig = getFrontendCollection()?.resourcesConfig || {};
    const backendServicesConfig = getFrontendCollection()?.backendServices || {};

    const notAllowedKeys = ["secret_keys", "defaultvalues", "attachvalues"];
    const mappingDict = {};
    const globalUserOptions = {};
    const globalFillingOrder = {};
    const globalStorageCounter = {};
    const initIncidents = getFrontendCollection()?.incidents || {};
    // initIncidents.JSCCLOUD.health = 50;
    const incidentsmapping = {
      "JSCCLOUD": "JSC-Cloud"
    };
    const incidentsThresholdInteractive = getFrontendCollection()?.incidentCheck?.healthThreshold?.interactive || 50;
    Object.entries(initIncidents).forEach(([system, incident]) =>{
      const health = incident?.health ?? 0;
      if ( health >= incidentsThresholdInteractive ) {
        const _system = incidentsmapping?.[system] ?? system;
        if ( !globalMaintenanceSystems.includes(_system) ) globalMaintenanceSystems.push(_system);
      }
    });

    const services = getFrontendConfig()?.services?.options ?? {};

  for (const [serviceId, serviceOptions] of Object.entries(services)) {
    if ( pageType(null) == pageType("home") || pageType(null) == pageType("start") || pageType(null) == pageType("workshop") ) {
      for (const [spawnerName, spawnerUserOptions] of Object.entries(getSpawnerUserOptions())) {
        const userOptions = getFrontendCollection()?.decrypted_user_options?.[spawnerName] || spawnerUserOptions;
        const serviceId = spawnerUserOptions?.service || "jupyterlab";
        if ( !Object.keys(globalUserOptions).includes(serviceId) ) {
          globalUserOptions[serviceId] = {};
        }
        globalUserOptions[serviceId][spawnerName] = userOptions;
      }
      globalFillingOrder[serviceId] = serviceOptions?.fillingOrder || [];
    }
  }




  const authState = getAuthState();
  const kubeOutpostFlavors = authState?.outpost_flavors || true;
  function _getKubeSystems() {
    return Object.keys(systemConfig).filter(system => {
      const backendService = systemConfig[system].backendService;
      // Check if the backend service type is "kube"
      return backendServicesConfig[backendService]?.type === "kube";
    });
  }

  const kubeSystems = _getKubeSystems();

  function _getKubeFlavorSystems() {
    return Object.keys(systemConfig).filter(system => {
      const backendService = systemConfig[system].backendService;
      // Check if the backend service type is "kube"
      return backendServicesConfig[backendService]?.flavorsRequired;
    });
  }

  const kubeFlavorSystems = _getKubeFlavorSystems();

  function getAvailableKubeFlavorsS(systems) {
    let ret = [];

    systems.forEach(system => {
      const allFlavors = kubeOutpostFlavors[system];
      if ( allFlavors ) {
        ret.push(...Object.keys(allFlavors)
          .filter(key => allFlavors[key].max != 0) // do not use flavor.max == 0
          .filter(key => allFlavors[key].current < allFlavors[key].max || allFlavors[key].max == -1 ) // must be room for new jupyterlabs
          .sort((a, b) => allFlavors[b].weight - allFlavors[a].weight) // sort by weight
          .map(key => [key, allFlavors[key].display_name])); // get keyname + displayname
      }
    });
    return ret;
  }

  function getUnavailableKubeFlavorsS(systems) {
    let ret = [];

    systems.forEach(system => {
      const allFlavors = kubeOutpostFlavors[system];

      if ( allFlavors ) {
        ret.push(...Object.keys(allFlavors)
          .filter(key => allFlavors[key].max != 0) // do not use flavor.max == 0
          .filter(key => allFlavors[key].current >= allFlavors[key].max && allFlavors[key].max != -1)
          .sort((a, b) => allFlavors[b].weight - allFlavors[a].weight)
          .map(key => [key, allFlavors[key].display_name]));
      }
    });
    return ret;
  }
  const resPattern = /^urn:(?<namespace>.+?(?=:res:)):res:(?<systempartition>[^:]+):(?<project>[^:]+):act:(?<account>[^:]+):(?<accounttype>[^:]+)$/;
  const entitlements = authState?.oauth_user?.entitlements || [];
  const unicoreEntitlements = Array.isArray(entitlements) ? entitlements : entitlements ? [entitlements] : [];
  const unicorePreferredUsername = authState?.preferred_username || "none";
  let unicoreReservations = getFrontendCollection()?.reservations || {};
  const unicoreMapSystems = getFrontendCollection()?.mapSystems || {};
  const unicoreMapPartitions = getFrontendCollection()?.mapPartitions || {};
  const unicoreDefaultPartitions = getFrontendCollection()?.defaultPartitions || {};

  function setReservations(data) {
    if (data) {
      unicoreReservations = data;
    } else {
      unicoreReservations = {};
    }
  }

  function extractEntitlementResources(entitlement) {
    const match = resPattern.exec(entitlement);
    if (match) {
      // Access named capture groups using match.groups
      let system_ = unicoreMapSystems[match.groups.systempartition.toLowerCase()];
      let partition_ = unicoreMapPartitions[match.groups.systempartition.toLowerCase()];
      if ( Object.keys(resourcesConfig[system_] ?? {}).includes(partition_) ){
        return {
          systempartition: match.groups.systempartition,
          project: match.groups.project,
          account: match.groups.account,
          accounttype: match.groups.accounttype
        };
      }
    }
    return null; // Return null if no match is found
  }

  function _getUnicoreAccountType() {
    for (let entitlement of unicoreEntitlements) {
      const entitlementInfo = extractEntitlementResources(entitlement);

      if (entitlementInfo && entitlementInfo.account === unicorePreferredUsername) {
        return entitlementInfo.accounttype;
      }
    }
    return null;
  }

  const unicoreAccountType = _getUnicoreAccountType();

  function _getUnicoreSystemPartitions() {
    const systemPartitions = unicoreEntitlements
      .map(extractEntitlementResources)
      .filter(Boolean)
      .map(tmp => tmp.systempartition);

    if (unicoreAccountType === "normal") {
      return [...new Set(systemPartitions)];
    }

    if (unicoreAccountType === "secondary") {
      return [...new Set(
        systemPartitions.filter(systempartition => {
          return unicoreEntitlements
            .map(extractEntitlementResources) // Extract entitlement resources
            .filter(Boolean)
            .some(tmp => tmp.systempartition === systempartition && tmp.account === unicorePreferredUsername);
        })
      )];
    }

    return [];
  }

  const unicoreSystemPartitions = _getUnicoreSystemPartitions();

  function _getUnicoreSystems() {
    // Get all systems corresponding to the system partitions
    let systems = unicoreSystemPartitions
      .map(key => unicoreMapSystems[key.toLowerCase()]) // Map system partitions to their respective systems
      .filter(system => system); // Remove falsy values (null, undefined, etc.)

    // If the unicoreAccountType is "normal", return all systems (no filtering)
    if (unicoreAccountType === "normal") {
      return [...new Set(systems)]; // Remove duplicates using Set
    }

    // If the unicoreAccountType is "secondary", filter systems based on unicorePreferredUsername
    if (unicoreAccountType === "secondary") {
      return [...new Set(
        systems.filter(system => {
          // Filter systems where the system matches the unicorePreferredUsername in unicoreEntitlements
          return unicoreEntitlements
            .map(extractEntitlementResources) // Extract entitlement resources
            .filter(Boolean) // Remove falsy values (null, undefined, etc.)
            .some(tmp => tmp.systempartition && unicoreMapSystems[tmp.systempartition.toLowerCase()] === system && tmp.account === unicorePreferredUsername);
        })
      )]; // Remove duplicates using Set
    }

    // Return an empty array if unicoreAccountType is neither "normal" nor "secondary"
    return [];
  }

  const unicoreSystems = _getUnicoreSystems();


  function _getAllUnicoreAccountsBySystemPartition() {
    const accountsBySystemPartition = {};  // The output dictionary where key is systempartition and value is list of accounts

    // Initialize accounts list for each systempartition
    unicoreSystemPartitions.forEach(function(systempartition) {
      accountsBySystemPartition[systempartition] = new Set();  // Using Set to store unique accounts for each systempartition
    });

    // Iterate through all unicoreEntitlements and populate the accounts for the relevant unicoreSystemPartitions
    unicoreEntitlements.forEach(function(entitlement) {
      const entitlementInfo = extractEntitlementResources(entitlement);

      if (entitlementInfo && unicoreSystemPartitions.includes(entitlementInfo.systempartition)) {
        accountsBySystemPartition[entitlementInfo.systempartition].add(entitlementInfo.account);
      }
    });

    // Filter accounts based on unicoreAccountType
    Object.keys(accountsBySystemPartition).forEach(function(systempartition) {
      // If the unicoreAccountType is "secondary", only keep accounts that match unicorePreferredUsername
      if (unicoreAccountType === "secondary") {
        accountsBySystemPartition[systempartition] = [...accountsBySystemPartition[systempartition]]
          .filter(account => account === unicorePreferredUsername);
      } else {
        // For "normal" account type, return all accounts
        accountsBySystemPartition[systempartition] = [...accountsBySystemPartition[systempartition]];
      }
    });
    return accountsBySystemPartition;
  }

  const unicoreAccountsBySystemPartition = _getAllUnicoreAccountsBySystemPartition();

  function getUnicoreProjectsBySystemPartition() {
    const projectsBySystemPartition = {};  // Output dictionary where key is systempartition and value is list of projects

    // Initialize projects list for each systempartition
    unicoreSystemPartitions.forEach(function(systempartition) {
      projectsBySystemPartition[systempartition] = new Set();  // Using Set to store unique projects
    });

    // Iterate through all unicoreEntitlements and populate the projects for the relevant unicoreSystemPartitions
    unicoreEntitlements.forEach(function(entitlement) {
      const entitlementInfo = extractEntitlementResources(entitlement);

      // Check if entitlement has valid info and if it matches the system partitions list
      if (entitlementInfo && unicoreSystemPartitions.includes(entitlementInfo.systempartition)) {
        // Only add project if account matches the unicorePreferredUsername when unicoreAccountType is secondary
        if (unicoreAccountType === "normal" || entitlementInfo.account === unicorePreferredUsername) {
          projectsBySystemPartition[entitlementInfo.systempartition].add(entitlementInfo.project);
        }
      }
    });

    // Convert Set to Array for each systempartition in the output dictionary
    Object.keys(projectsBySystemPartition).forEach(function(systempartition) {
      projectsBySystemPartition[systempartition] = [...projectsBySystemPartition[systempartition]];
    });

    return projectsBySystemPartition;
  }

  Object.entries(serviceConfig)
    .forEach(([key, value]) => {
      const serviceId = value.serviceId ?? key;
      if ( !Object.keys(mappingDict).includes(serviceId) ){
        mappingDict[serviceId] = {
          "serviceKey": key,
          "system": {},
          "option": {}
        };
      }
      Object.entries(value.options).forEach(([optionKey, optionValue]) => {
        mappingDict[serviceId]["option"][optionKey] = optionValue.mapping ?? optionKey;
      });
      _getAllSystems().forEach(system => {
        const backendService = systemConfig[system].backendService;
        const systemType = backendServicesConfig[backendService]?.mapping ?? system;
        if (!Object.keys(mappingDict[serviceId]["system"]).includes(systemType)) {
          mappingDict[serviceId]["system"][system] = systemType;
        }
      });
    });

  function getUnicorePartitions() {
    let partitions = new Set();

    // Iterate over unicoreSystemPartitions and add the corresponding partition names to the set
    unicoreSystemPartitions.forEach((partition) => {
      const partitionName = unicoreMapPartitions[partition.toLowerCase()];
      if (partitionName) {
        partitions.add(partitionName);
      }
    });

    // Add default partitions to the set
    Object.keys(unicoreDefaultPartitions).forEach((partition) => {
      unicoreDefaultPartitions[partition].forEach((defaultPartition) => {
        partitions.add(defaultPartition);
      });
    });

    // If the unicoreAccountType is "normal", return all partitions (no filtering)
    if (unicoreAccountType === "normal") {
      return [...partitions]; // Convert Set to Array (removes duplicates)
    }

    // If the unicoreAccountType is "secondary", filter the partitions based on unicorePreferredUsername
    if (unicoreAccountType === "secondary") {
      return [...new Set(
        [...partitions].filter(partition => {
          // Check if the partition matches the preferred username from unicoreEntitlements
          return unicoreEntitlements
            .map(extractEntitlementResources) // Extract entitlement resources
            .filter(Boolean) // Remove falsy values (null, undefined, etc.)
            .some(tmp => tmp.systempartition && unicoreMapPartitions[tmp.systempartition.toLowerCase()] === partition && tmp.account === unicorePreferredUsername);
        })
      )]; // Remove duplicates using Set
    }

    // Return an empty array if unicoreAccountType is neither "normal" nor "secondary"
    return [];
  }

  function getUnicoreAccountsS(systems) {
    const accounts = new Set();  // A Set to ensure accounts are unique

    // Iterate over the unicoreEntitlements to collect accounts related to the system
    systems.forEach(system => {
      unicoreEntitlements.forEach(function(entitlement) {
        const entitlementInfo = extractEntitlementResources(entitlement);

        // Check if the entitlement is for the provided system
        if (entitlementInfo && unicoreMapSystems[entitlementInfo.systempartition.toLowerCase()] === system) {
          if (unicoreAccountType === "normal") {
            // If unicoreAccountType is "normal", add all accounts for the system
            accounts.add(entitlementInfo.account);
          } else if (unicoreAccountType === "secondary") {
            // If unicoreAccountType is "secondary", only add the account if it matches unicorePreferredUsername
            if (entitlementInfo.account === unicorePreferredUsername) {
              accounts.add(entitlementInfo.account);
            }
          }
        }
      });
    });

    // Return the accounts as an array, since we're using a Set to avoid duplicates
    return [...accounts];
  }

  function getUnicoreProjectsSA(systems, accounts) {
    const projects = [];  // Initialize an empty array to store the list of projects

    // Iterate through entitlements to find all projects for the system and account
    systems.forEach(system => {
      accounts.forEach(account => {
        unicoreEntitlements.forEach(function(entitlement) {
          const entitlementInfo = extractEntitlementResources(entitlement);

          // Check if entitlement matches the provided system
          if (entitlementInfo) {
            const mappedSystem = unicoreMapSystems[entitlementInfo.systempartition.toLowerCase()];
            if (mappedSystem === system) {
              if (unicoreAccountType === "normal") {
                // If unicoreAccountType is "normal", we check if the account matches
                if (entitlementInfo.account === account) {
                  projects.push(entitlementInfo.project);  // Add project to the list
                }
              } else if (unicoreAccountType === "secondary") {
                // If unicoreAccountType is "secondary", only consider the entitlement if the account matches the preferred username
                if (entitlementInfo.account === unicorePreferredUsername) {
                  if (entitlementInfo.account === account) {
                    projects.push(entitlementInfo.project);  // Add project to the list
                  }
                }
              }
            }
          }
        });
      });
    });
    return [...new Set(projects)];
  }

  function getUnicoreProjectsS(systems) {
    const projects = [];  // Initialize an empty array to store the list of projects

    // Iterate through entitlements to find all projects for the system and account
    systems.forEach(system => {
      unicoreEntitlements.forEach(function(entitlement) {
        const entitlementInfo = extractEntitlementResources(entitlement);

        // Check if entitlement matches the provided system
        if (entitlementInfo) {
          const mappedSystem = unicoreMapSystems[entitlementInfo.systempartition.toLowerCase()];
          if (mappedSystem === system) {
            projects.push(entitlementInfo.project);
          }
        }
      });
    });
    return [...new Set(projects)];
  }

  function getUnicorePartitionsSAP(systems, accounts=[], projects=[]) {
    // Initialize the result list of partitions
    let partitions = [];
    let interactivePartitions = [];
    let allPartitions = [];
    systems.forEach(system => {
      accounts.forEach(account => {
        projects.forEach(project => {
          // 1. Add interactive partitions for the given system (if any)

          // 2. Get the system partitions for the given system and account/project (with entitlement checking)
          const allPartitions_ = new Set(); // Using Set to ensure unique entries

          let interactiveAdded = false;

          // Iterate over the entitlements to get partitions for the specified system, account, and project
          unicoreEntitlements.forEach(function(entitlement) {
            const entitlementInfo = extractEntitlementResources(entitlement);
            if (entitlementInfo && unicoreMapSystems[entitlementInfo.systempartition.toLowerCase()] === system && (entitlementInfo.project === project || project === "_all_")) {
              // Apply unicoreAccountType logic
              if (unicoreAccountType === "normal" || account === "_all_") {
                if ( !interactiveAdded ){
                  interactiveAdded = true;
                  const interactivePartitions_ = systemConfig[system]?.interactivePartitions || [];
                  interactivePartitions = [...new Set([...interactivePartitions, ...interactivePartitions_])]; // Start with interactive partitions
                }
                // For normal accounts, match the exact account
                if (entitlementInfo.account === account || account === "_all_") {
                  allPartitions_.add(unicoreMapPartitions[entitlementInfo.systempartition.toLowerCase()]);
                }
              } else if (unicoreAccountType === "secondary") {
                // For secondary accounts, only match if the account is the preferred username
                if ( !interactiveAdded ){
                  interactiveAdded = true;
                  const interactivePartitions_ = systemConfig[system]?.interactivePartitions || [];
                  interactivePartitions = [...new Set([...interactivePartitions, ...interactivePartitions_])]; // Start with interactive partitions
                }
                if (entitlementInfo.account === unicorePreferredUsername && entitlementInfo.account === account) {
                  allPartitions_.add(unicoreMapPartitions[entitlementInfo.systempartition.toLowerCase()]);
                }
              }
            }
            // 3. Add the partitions from entitlements to the list (remove duplicates automatically due to Set)
            allPartitions = [...new Set([...allPartitions, ...allPartitions_])];
          });

          // 4. Add default partitions for the given system

          Object.keys(unicoreDefaultPartitions).forEach(function(systempartition) {
            let system_ = unicoreMapSystems[systempartition];
            if ( system_ === system ) {
              // Check if the systempartition matches
              if (unicoreDefaultPartitions[systempartition]) {
                // Add the corresponding partition from the unicoreMapPartitions object
                if (allPartitions.includes(unicoreMapPartitions[systempartition])) {
                  unicoreDefaultPartitions[systempartition].forEach(function(defaultPartition) {
                    allPartitions.push(unicoreMapPartitions[defaultPartition.toLowerCase()]);
                  });
                }
              }
            }
          });
        });
      });
    });

    // 5. Return the list of partitions (interactive first, then others, with defaults added)
    return [...new Set([...interactivePartitions, ...allPartitions])];
  }

  function getAllUnicoreReservations() {
    // Initialize an empty array to store reservation names
    let reservations = [];

    // Iterate over each system in the reservations object
    Object.keys(unicoreReservations).forEach(system => {
      // For each system, iterate over the reservations array
      unicoreReservations[system].forEach(reservation => {
        // Add the entire reservation object to the list (instead of just ReservationName)
        reservations.push(reservation);
      });
    });

    // Return the list of all reservations
    return reservations;
  }

  function getUnicoreReservationsS(systems) {
    // Check if the system exists in the reservations object
    let reservations = [];
    systems.forEach(system => {
      if (unicoreReservations[system]) {
        // Map the reservations for the system and return an array of ReservationNames
        reservations.push(unicoreReservations[system].filter(reservation => reservation).map(reservation => reservation));
      }
    });
    return reservations;
  }

  function getUnicoreReservationsSAPP(systems, accounts, projects, partitions) {
    // Check if the system exists in the reservations object
    let reservations = [];

    systems.forEach(system => {
      accounts.forEach(account => {
        projects.forEach(project => {
          partitions.forEach(partition => {
            if (!unicoreReservations[system]) {
              return;
            }

            // Check if the partition is interactive for the given system
            const isInteractivePartition = systemConfig[system] && systemConfig[system].interactivePartitions.includes(partition);

            // If the partition is interactive, do not return any reservations for it
            if (isInteractivePartition) {
              return;
            }

            // Filter the reservations for the given system based on the provided account, project, and partition
            reservations.push(
              ...unicoreReservations[system].filter(reservation => {
                const partitionMatches = (reservation.PartitionName === "" || reservation.PartitionName === partition || partition === "_all_");
                const usersMatch = (reservation.Users === "" || reservation.Users.split(",").includes(account) || account === "_all_");
                const accountsMatch = (reservation.Accounts === "" || reservation.Accounts === project || project === "_all_");
                return partitionMatches && usersMatch && accountsMatch;
              })
            );
          });
        });
      });
    });
    return [...new Set(reservations)];
  }


  function getUnicoreValues(serviceId, rowId, elementId) {
    const inputElement = getInputElement(serviceId, rowId, elementId);
    const labelElementCB = getLabelCBElement(serviceId, rowId, elementId);
      //if (inputElement.length == 0 || inputElement.attr("data-collect") === "false" ) {
      if (inputElement.length == 0 || inputElement.is("[disabled]") ) {
        // Input does not exist, or is disabled. Use the keyword _all_ instead.
        return ["_all_"];
      } else {
        return val(inputElement);
      }
    
  }

  function getAccountOptions(serviceId, rowId) {
    const systems = val(getInputElement(serviceId, rowId, "system"));
    const accounts = getUnicoreAccountsS(systems);
    if (accounts.includes(unicorePreferredUsername)) {
      accounts.sort(account => account === unicorePreferredUsername ? -1 : 1);
    }
    return accounts.map(item => [item, item]);
  }

  function getProjectOptions(serviceId, rowId) {
    const systems = val(getInputElement(serviceId, rowId, "system"));
    let projects = [];
    const accountInput = getInputElement(serviceId, rowId, "account");
    const accounts = val(accountInput);
    if ( accountInput.length > 0 && accounts.length > 0 && accounts[0] ){
      // Account Option exists, let's take it into account
      const accounts = val(accountInput);
      projects = getUnicoreProjectsSA(systems, accounts);
    } else {
      // Acount selection does not exists (e.g. in workshopManager)
      projects = getUnicoreProjectsS(systems);
    }
    return projects.map(item => [item, item]);
  }

  function getPartitionOptions(serviceId, rowId) {
    const systems = val(getInputElement(serviceId, rowId, "system"));
    const accounts = getUnicoreValues(serviceId, rowId, "account");
    const projects = getUnicoreValues(serviceId, rowId, "project");
    let partitions = getUnicorePartitionsSAP(systems, accounts, projects);
    
    return partitions.map(item => [item, item]);
  }

    function getPartitionAndInteractivePartition(serviceId, rowId) {
      const systems = val(getInputElement(serviceId, rowId, "system"));
      let partitions = getPartitionOptions(serviceId, rowId);
      let interactivePartitionsLength = 0;
      let presetValues = false;
      if ( pageType(null) == pageType("workshop")) {
        presetValues = getWorkshopOptions()?.hpc?.partition || false;
      }
      let interactivePartitionAdded = [];
      if ( presetValues ) {
        partitions = partitions.filter( ([item, _]) => presetValues.includes(item));
      }
      partitions.forEach(partition => {
        let partition_ = partition[0];
        systems.forEach(system => {
          if ( (systemConfig[system]?.interactivePartitions || []).includes(partition_) ) {
            if ( !interactivePartitionAdded.includes(partition_) ) {
              interactivePartitionsLength += 1;
              interactivePartitionAdded.push(partition_);
            }
          }
        });
      });
      return [partitions, interactivePartitionsLength];
    }

    function getReservationOptions(serviceId, rowId) {
      const systems = val(getInputElement(serviceId, rowId, "system"));
      const accounts = getUnicoreValues(serviceId, rowId, "account");
      const projects = getUnicoreValues(serviceId, rowId, "project");
      const partitions = getUnicoreValues(serviceId, rowId, "partition");

      return getUnicoreReservationsSAPP(systems, accounts, projects, partitions);
    }
    function _getAllSystems() {
      // Combine both lists and remove duplicates using a Set
      let allSystems = [...new Set([...unicoreSystems, ...kubeSystems])];


      if (pageType(null) == pageType("workshop")) {
        const allowedSystems = getSpawnerUserOptions()?.workshop?.system || false;
        if ( allowedSystems ) {
          allSystems = allSystems.filter(system => allowedSystems.includes(system));
        }
      }
      allSystems = allSystems.filter(system => !globalMaintenanceSystems.includes(system));
      return allSystems;
    }

    function getAvailableSystemOptions(serviceId, options) {
      let ret = [];
      options.forEach(option => {
        if (getServiceConfig(serviceId)?.options && Object.keys(getServiceConfig(serviceId)?.options).includes(option)) {
          const subSystems1 = getServiceConfig(serviceId).options[option].allowedLists.systems;
          ret.push(..._getAllSystems().filter(system => subSystems1.includes(system)));
        } else {
          // return all systems, if it's not reduced by the option
          ret.push(..._getAllSystems());
        }
      });
      
      let uniqueSystems = [...new Set(ret)];
      uniqueSystems.sort((a, b) => (systemConfig[a].weight || 0) - (systemConfig[b].weight || 0));
      uniqueSystems = uniqueSystems.filter(system => !globalMaintenanceSystems.includes(system) );
      return uniqueSystems.map(item => [item, item]);
    }

    function getMissingSystemOptions(serviceId, rowId, options) {
      let availableSystems = getAvailableSystemOptions(serviceId, options);
      let missingSystems = _getAllSystems().filter(system => !availableSystems.map(([key, value]) => key).includes(system));

      if (pageType(null) == pageType("workshop")) {
        const allowedSystems = getSpawnerUserOptions()?.workshop?.system || false;
        if ( allowedSystems ) {
          missingSystems = missingSystems.filter(system => allowedSystems.includes(system));
        }
      }
      return missingSystems.map(item => [item, item]);
    }


    function getSystemValues(serviceId, rowId, element) {
      let systems = val(getInputElement(serviceId, rowId, "system"));
      let values = [];
      if ( element === "system" ){
        values = systems;
      } else {
        let systemTypesChecked = [];
        systems.forEach(system => {
          const backendService = systemConfig[system]?.backendService;
          const systemType = backendServicesConfig[backendService]?.type;
          if ( !systemTypesChecked.includes(systemType) ) {
            systemTypesChecked.push(systemType);
            let value = $(`[id^='${serviceId}-${rowId}-'][id$='-${element}-input']`).val();
            if ( value ) {
              if (!Array.isArray(value)) {
                value = [value];
              }
              values.push(...value);
            }
          }
        });
      }
      return values;
    }


    function getSystemTypes(serviceId, rowId) {
      const systems = getSystemValues(serviceId, rowId, "system");
      let systemTypes = [];
      systems.forEach(system => {
        const systemType = mappingDict[serviceId]?.["system"]?.[system] ?? system;
        if ( !systemTypes.includes(systemType) ){
          systemTypes.push(systemType);
        }
      });
      return systemTypes;
    }













  // Storage Logic
  $(document).on("click", '.add-data-mount', function (event) {
    const $this = $(this);
    const serviceId = $this.data('service');
    const rowId = $this.data('row');
    const tabId = $this.data('tab');
    const newRowHtml = createStorageRow(serviceId, rowId, tabId);
    $(`#${serviceId}-${rowId}-${tabId}-table`).show();
    $(`#${serviceId}-${rowId}-${tabId}-table tbody`).append(newRowHtml);
  });


  $(document).on('click', '.del-data-mount', function (event) {
    event.stopPropagation();
    const $this = $(this);
    const summaryRow = $this.closest('tr');
    const collapseRow = summaryRow.next('.collapsible-tr');
    const table = summaryRow.closest('table');
    collapseRow.remove();
    summaryRow.remove();

    if (table.find('tbody tr').length === 0) {
      table.hide();
    }
  })

  $(document).on('input', '.data-mount-b2drop-user', function () {
    const $this = $(this);
    const userInput = $this.val().trim();
    const group = $this.data('group');

    if (group && userInput) {
      const $urlInput = $(`input[name="url"][data-group="${group}"]`);
      $urlInput.val(`https://b2drop.eudat.eu/remote.php/dav/files/${userInput}/`);
    }
  });

  $(document).on('click', '.data-mount-passwd-btn', function () {
    const $this = $(this);
    const input = $this.closest('.input-group').find('input[type="password"], input[type="text"]');

    if (input.attr('type') === 'password') {
      input.attr('type', 'text');
      $this.find('i').removeClass('fa-eye').addClass('fa-eye-slash');
    } else {
      input.attr('type', 'password');
      $this.find('i').removeClass('fa-eye-slash').addClass('fa-eye');
    }
  });

  $(document).on('change', '.data-mount-template-input', function () {
    const $this = $(this);
    const selectedText = $this.find('option:selected').text();
    const row = $this.closest('tr');
    const val = $this.val();

    const mountPathInput = row.find('input[name="path"]');
    mountPathInput.val(val);

    const container = $this.closest('tr').prev('.summary-tr');

    // Update the summary cell text via class
    container.find('.data-mount-summary-template').text(selectedText);

    row.find('[data-storage-template]').each(function () {
      const container = $(this);
      const isMatch = container.data('storage-template') === val;

      container.toggle(isMatch); // show if match, hide otherwise

      // Update data-collect on all inputs inside the container
      container.find('input[data-collect], select[data-collect]').each(function () {
        $(this).attr('data-collect', isMatch.toString());
      });
    });
  });

  $(document).on('click', '.data-mount-summary-tr', function () {
    const $this = $(this);
    const summaryRow = $this.closest('tr');
    const collapseRow = summaryRow.next('.collapsible-tr');
    const collapseDiv = collapseRow.find('.collapse'); // assumes you wrapped it in .collapse
    const accordionIcon = summaryRow.find('.accordion-icon');

    if (collapseDiv.length > 0) {
      const isShown = collapseDiv.hasClass('show');

      // Toggle icon class
      accordionIcon.toggleClass('collapsed', isShown);

      // Toggle collapse using Bootstrap API
      const bsCollapse = bootstrap.Collapse.getInstance(collapseDiv[0]) ||
        new bootstrap.Collapse(collapseDiv[0], { toggle: false });

      if (isShown) {
        bsCollapse.hide();
      } else {
        bsCollapse.show();
      }
    }
  });
  // Storage Logic End



  // Show / Hide elements
  function dependencyFilter(serviceId, rowId, elementId, objects) {
    return objects.filter(function () {
      // Elements that have "data-dependency-${elementId}" AND at least one other dependency
      const otherDependencies = [...this.attributes].some(attr =>
        attr.name.startsWith("data-dependency-") && !attr.name.startsWith(`data-dependency-${elementId}`)
      );

      if (!otherDependencies) {
        return true;
      } else {
        // Map each element to a list of its dependencies (excluding elementId)
        const dependenciesList = [...this.attributes]
          .map(attr => attr.name)
          .filter(name => name.startsWith("data-dependency-") && !name.startsWith(`data-dependency-${elementId}`))
          .map(name => name.replace("data-dependency-", ""));

        return dependenciesList.some(dependency => {
          const inputValue = $(`[id^='${serviceId}-${rowId}-'][id$='-${dependency}-input']`).val();

          const allowedValues = [...this.attributes]
            .filter(attr => attr.name.startsWith(`data-dependency-${dependency}-`))
            .map(attr => attr.name.replace(`data-dependency-${dependency}-`, ""));

          return allowedValues.includes(inputValue);
        });
      }
    });
  }

  $(document).on("change", `select[id$='-input']`, function (event) {
    const $this = $(this);
    const serviceId = $this.attr("data-service");
    const rowId = $this.attr("data-row");
    const dataRow = $(`tr.collapsible-tr[data-server-id="${serviceId}-${rowId}"]`);
    const elementId = $this.attr("data-element");


    logDebug && console.log(`${rowId} - ${elementId} changed ( ${$this.val()} )`);
    $this.trigger("change_select");
    dataRow.find(`[data-trigger-${elementId}][id^='${serviceId}-${rowId}-']`).trigger(`trigger_${elementId}`);

    const isDisabled = $this.prop("disabled");
    let newValues = $this.val();
    logDebug && console.time(`${elementId} logic block`)
    if (!isDisabled && !(!newValues || (Array.isArray(newValues) && newValues.length === 0))) {
      if (!Array.isArray(newValues)) {
        newValues = [newValues];
      }
      // const mappedValues = newValues.map(newValue => mappingDict[serviceId]?.[elementId]?.[newValue] ?? newValue);
      const mappedValues = [...new Set(newValues.map(newValue => mappingDict[serviceId]?.[elementId]?.[newValue] ?? newValue))];
      const excludes = `:not(${mappedValues.map(value => `[data-dependency-${elementId}-${value}]`).join(',')})`;
      let prefixSelector = "";
      let selector = "";

      // Show + set to Active (add collect)
      prefixSelector = `div[id^='${serviceId}-${rowId}-'][id$='-input-div'][data-show='true']`;
      selector = mappedValues.map(value => `${prefixSelector}[data-dependency-${elementId}-${value}]`).join(',');
      dependencyFilter(serviceId, rowId, elementId, dataRow.find(`${selector}`)).show();

      prefixSelector = `[id^='${serviceId}-${rowId}-'][id$='-input']:not([data-collect-static])`;
      selector = mappedValues.map(value => `${prefixSelector}[data-dependency-${elementId}-${value}]`).join(',');
      dependencyFilter(serviceId, rowId, elementId, dataRow.find(`${selector}`)).attr("data-collect", true);

      // trigger all new activated label cb, to ensure normally hidden inputs are shown
      prefixSelector = `[id^='${serviceId}-${rowId}-'][id$='-input-cb']`;
      selector = mappedValues.map(value => `${prefixSelector}[data-dependency-${elementId}-${value}]`).join(',');
      dependencyFilter(serviceId, rowId, elementId, dataRow.find(`${selector}`)).trigger("change");

      // show navbar buttons
      prefixSelector = `button[id^='${serviceId}-${rowId}-'][id$='-navbar-button'][data-show="true"]`;
      selector = mappedValues.map(value => `${prefixSelector}[data-dependency-${elementId}-${value}]`).join(',');
      dependencyFilter(serviceId, rowId, elementId, dataRow.find(`${selector}`)).trigger("show");
      dependencyFilter(serviceId, rowId, elementId, dataRow.find(`${selector}`)).trigger("change");

      // show buttons
      prefixSelector = `button[id^='${serviceId}-${rowId}-'][id$='-btn']`;
      selector = mappedValues.map(value => `${prefixSelector}[data-dependency-${elementId}-${value}]`).join(',');
      dependencyFilter(serviceId, rowId, elementId, dataRow.find(`${selector}`)).show();

      //  Show / Hide dependency values 
      // hide + ignore
      dataRow.find(`div[id^='${serviceId}-${rowId}-'][id$='input-div'][data-dependency-${elementId}]${excludes}`).hide();
      dataRow.find(`[id^='${serviceId}-${rowId}-'][id$='-input'][data-dependency-${elementId}]${excludes}`).attr("data-collect", false);

      // hide navbar buttons
      selector = `button[id^='${serviceId}-${rowId}-'][id$='-navbar-button'][data-dependency-${elementId}]${excludes}`;
      dataRow.find(`${selector}`).trigger("hide");

      // hide buttons
      selector = `button[id^='${serviceId}-${rowId}-'][id$='-btn'][data-dependency-${elementId}]${excludes}`;
      dataRow.find(`${selector}`).hide();
    } else {
      // hide + ignore all specific inputs
      dataRow.find(`div[id^='${serviceId}-${rowId}-'][id$='input-div'][data-dependency-${elementId}]`).hide();
      dataRow.find(`[id^='${serviceId}-${rowId}-'][id$='input'][data-dependency-${elementId}]`).attr("data-collect", false);
    }
    logDebug && console.timeEnd(`${elementId} logic block`)

  });
  // Show / Hide elements -- End



  // Buttons

  $(document).on("show", `button[id$='-navbar-button']`, function (event) {
    const $this = $(this);
    if (!$this.hasClass("show")) {
      $this.addClass("show");
      $this.attr("style", "");
      $this.find('[data-type="span-warning"]').addClass("invisible");
      $this.show();
    }
  });

  $(document).on("hide", `button[id$='-navbar-button']`, function (event) {
    const $this = $(this);
    $this.removeClass("show");
    $this.attr("style", "height: 0 !important; overflow: hidden !important; padding-top: 0 !important; padding-bottom: 0 !important; border: none !important; margin: 0 !important;");
    $this.find('[data-type="span-warning"]').addClass("invisible");
    $this.hide();
  });

  $(document).on("activate", `button[id$='-navbar-button']`, function (event) {
    const $this = $(this);
    const tabId = $this.attr("data-tab");
    const contentTab = $this.parent().parent().find(`div[id$='-${tabId}-contenttab-div']`)
    contentTab.addClass("show");
    contentTab.show();
    $this.find(`[id$='-tab-input-warning']`).addClass("invisible");
  });

  $(document).on("deactivate", `button[id$='-navbar-button']`, function (event) {
    const $this = $(this);
    const tabId = $this.attr("data-tab");
    const contentTab = $this.parent().parent().find(`div[id$='-${tabId}-contenttab-div']`)
    contentTab.removeClass("show");
    contentTab.hide();
  });

  $(document).on("click", `button[id$='-navbar-button']`, function (event) {
    $this = $(this);
    const tabId = $this.attr("data-tab");
    $this.parent().parent().find(`[id$='-navbar-button']:not([data-tab='${tabId}'])`).trigger("deactivate");
    $this.trigger("activate");
  });




  $(document).on("click", `[id$='-text-copybutton']`, function () {
    const $this = $(this);
    const serviceId = $this.attr("data-service");
    const rowId = $this.attr("data-row");
    const copyKey = $this.attr("data-copy-key");
    const valid = validateForm(serviceId, rowId);

    let tooltipInstance = bootstrap.Tooltip.getInstance($this);

    if (!valid) {
      showToast("URL not copied. Please check input.");
      $this.html(getSvg("failed"));
      setTimeout(function () {
        if (tooltipInstance) {
          tooltipInstance.hide();
        }
      }, 1000);
      setTimeout(function () {
        $this.html(getSvg("copy"));
      }, 3000);
      return;
    }
    const value = $(`[id^='${serviceId}-${rowId}-'][data-copy-key='${copyKey}']`).val();
    navigator.clipboard.writeText(value).then(() => {
      $this.html(getSvg("check"));
      setTimeout(function () {
        if (tooltipInstance) {
          tooltipInstance.hide();
        }
        $this.html(getSvg("copy"));
      }, 1000);
    }).catch(err => {
      console.error("Failed to copy:", err);
    });
  });

  $(document).on("click", `[id$='-modal-copy-btn']`, function () {
    const $this = $(this);
    const serviceId = $this.attr("data-service");
    const rowId = $this.attr("data-row");
    const workshopUrl = $(`#${serviceId}-${rowId}-modal .modal-body a`).last().attr('href');
    navigator.clipboard.writeText(workshopUrl).then(function () {
      $(`#${serviceId}-${rowId}-modal-copy-btn`).tooltip('dispose').attr('title', 'Copied');
      $(`#${serviceId}-${rowId}-modal-copy-btn`).tooltip('show');
    }, function (err) {
      console.error('Could not copy text: ', err);
    });
  });

  window.showModal = function (serviceId, rowId, url, header, text1, text2) {
    $(`#${serviceId}-${rowId}-modal .modal-body a`).text(`${text2}`);
    $(`#${serviceId}-${rowId}-modal .modal-body a`).attr('href', url);
    $(`#${serviceId}-${rowId}-modal .modal-title`).text(header);
    $(`#${serviceId}-${rowId}-modal .modal-body p`).html(`${text1}`);
    $(`#${serviceId}-${rowId}-modal`).modal('show');
  }

  $(document).on("click", `button[id$='-view-password']`, function (event) {
    const $this = $(this);
    const passInput = $this.parent().parent().find(`input`);
    const eye = $this.find(`i[id$='-password-eye']`);
    if (passInput.prop("type") === "password") {
      passInput.prop("type", "text");
      eye.removeClass("fa-eye");
      eye.addClass("fa-eye-slash");
    } else {
      passInput.prop("type", "password");
      eye.addClass("fa-eye");
      eye.removeClass("fa-eye-slash");
    }
  });

  $(document).on("click", `button[data-textgrower-btn-type='add'][id$='-input']`, function (event) {
    const $this = $(this);
    const serviceId = $this.attr("data-service");
    const rowId = $this.attr("data-row");
    const tabId = $this.attr("data-tab");
    const elementId = $this.attr("data-element");

    const parentContainer = $this.closest('.container');
    const countElements = parseInt(parentContainer.attr("data-count")) + 1;
    parentContainer.attr("data-count", countElements);
    const firstInputElement = $(`[id^='${serviceId}-${rowId}-${tabId}'][id$='-1-${elementId}-input']`);
    const dataType = firstInputElement.attr("data-type");
    const group = firstInputElement.attr("data-group") ?? "default";
    const name = firstInputElement.attr("name") ?? elementId;
    const type = firstInputElement.attr("type") ?? "text";
    let pattern = firstInputElement.attr("pattern");
    if ( !pattern ) {
      pattern = "";
    }
    let placeholder = firstInputElement.attr("placeholder");
    if ( !placeholder ) {
      placeholder = "";
    }

    const newInputGroup = `
      <div class="input-group" style="display: flex; align-items: center; margin-bottom: 10px;">
        <input id="${serviceId}-${rowId}-${tabId}-${countElements}-${elementId}-input" type="${type}"
          class="form-control"
          data-service="${serviceId}"
          data-row="${rowId}"
          data-tab="${tabId}"
          data-type="${dataType}"
          data-element="${elementId}"
          data-group="${group}"
          data-collect="true"
          data-collect-static
          name="${name}"
          type="${type}"
          pattern="${pattern}"
          placeholder="${placeholder}"
        />
        <button data-collect-static data-textgrower-btn-type="del" data-element="${elementId}" data-service="${serviceId}" data-row="${rowId}" data-tab="${tabId}" data-collect="false" type="button" id="${serviceId}-${rowId}-${tabId}-${countElements}-delbtn-${elementId}-input" style="margin-left: 8px;" class="btn btn-danger">${getSvg("delete")}</button>
        <button data-collect-static data-textgrower-btn-type="add" data-element="${elementId}" data-service="${serviceId}" data-row="${rowId}" data-tab="${tabId}" data-collect="false" type="button" id="${serviceId}-${rowId}-${tabId}-${countElements}-addbtn-${elementId}-input" style="margin-left: 8px;" class="btn btn-primary">${getSvg("plus")}</button>
      </div>
    `;
    parentContainer.append(newInputGroup);
  });

  $(document).on("click", `button[data-textgrower-btn-type='del'][id$='-input']`, function (event) {
    $(this).closest('.input-group').remove();
  });


  function createStorageRow(serviceId, rowId, tabId) {
    let currentCount;
    const key = `${serviceId}-${rowId}`;
    if (globalStorageCounter.hasOwnProperty(key)) {
      globalStorageCounter[key] += 1;
      currentCount = globalStorageCounter[key];
    } else {
      globalStorageCounter[key] = 1;
      currentCount = 1;
    }

    return `
      <tr id="${serviceId}-${rowId}-${tabId}-${currentCount}-summary-tr"
        class="summary-tr existing-spawner-tr data-mount-summary-tr">
        <td class="details-td" data-bs-target="#${serviceId}-${rowId}-${tabId}-${currentCount}-collapse">
          <div class="d-flex mx-auto accordion-icon mx-4"></div>
        </td>
        <td id="${serviceId}-${rowId}-${tabId}-${currentCount}-summary-template" class="data-mount-summary-template">B2Drop</td>
        <th class="text-center">
          <button
            type="button"
            id="${serviceId}-${rowId}-${tabId}-${currentCount}-delbtn-input"
            class="btn btn-danger del-data-mount"
          >
            ${getSvg("delete")}
          </button>
        </th>
      </tr>
      <tr class="collapsible-tr" id="${serviceId}-${rowId}-${tabId}-${currentCount}-collapse">
        <td colspan="100%" class="p-0">
          <div class="collapse show">
            <div class="d-flex align-item-starts m-3">
              <div class="row" style="width: 100%">
                <div class="col-12">
                  <div id="${serviceId}-${rowId}-${tabId}-${currentCount}-template-input-div" class="row mb-1 align-items-center">
                    <div class="col-4 col-form-label d-flex align-items-start justify-content-between"> 
                      <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-template-input" class="d-flex align-items-center w-100"> 
                        Template
                      </label>
                    </div>
                    <div class="col-8 d-flex align-items-center">
                        <select
                          name="template"
                          data-collect="true"
                          data-group="datamount-${currentCount}"
                          id="${serviceId}-${rowId}-${tabId}-${currentCount}-template-input"
                          class="form-select data-mount-template-input"
                        >
                          <option value="b2drop">B2Drop</option>
                          <option value="aws">AWS</option>
                          <option value="s3">S3 Compliant Storage Provider</option>
                          <option value="webdav">Webdav</option>
                        </select>
                    </div>
                  </div>
                  <div id="${serviceId}-${rowId}-${tabId}-${currentCount}-mountpath-input-div" class="row mb-1 align-items-center">
                    <div class="col-4"> 
                      <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-mountpath-input" class="d-flex align-items-center w-100"> 
                        Relative Mount Path
                      </label>
                    </div>
                    <div class="col-8">
                      <input type="text"
                        class="form-control"
                        data-collect="true"
                        data-group="datamount-${currentCount}"
                        name="path"
                        id="${serviceId}-${rowId}-${tabId}-${currentCount}-mountpath-input" value="b2drop"
                      />
                    </div>
                  </div>
                  <div id="${serviceId}-${rowId}-${tabId}-${currentCount}-readonly-input-div" class="row mb-1 align-items-center">
                    <div class="col-4 d-flex justify-content-between align-items-center">
                      <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-readonly-input" class="mb-0">
                        Read Only
                      </label>
                      <input
                        type="checkbox"
                        name="readonly"
                        data-collect="true"
                        data-group="datamount-${currentCount}"
                        class="form-check-input"
                        id="${serviceId}-${rowId}-${tabId}-${currentCount}-readonly-input"/>
                    </div>
                    <div class="col-8"></div>
                  </div>
                  <div data-storage-template="b2drop">
                    <div id="${serviceId}-${rowId}-${tabId}-${currentCount}-b2drop-remotepath-input-div" class="row mb-1 align-items-center">
                      <div class="col-4">
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-b2drop-remotepath-input" class="mb-0">
                          Path
                        </label>
                      </div>
                      <div class="col-8">
                        <input type="text"
                          class="form-control"
                          data-collect="true"
                          data-group="datamount-${currentCount}"
                          name="remotepath"
                          id="${serviceId}-${rowId}-${tabId}-${currentCount}-b2drop-remotepath-input" value="" placeholder=""
                        />
                      </div>
                    </div>
                    <div style="display: none" id="${serviceId}-${rowId}-${tabId}-${currentCount}-b2drop-type-input-div" class="row mb-1 align-items-center">
                      <div class="col-4">
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-b2drop-type-input" class="mb-0">
                          Type
                        </label>
                      </div>
                      <div class="col-8">
                        <input type="text"
                          class="form-control"
                          data-collect="true"
                          data-group="datamount-${currentCount}"
                          name="type"
                          disabled
                          id="${serviceId}-${rowId}-${tabId}-${currentCount}-b2drop-type-input" value="webdav" placeholder=""
                        />
                      </div>
                    </div>
                    <div style="display: none" id="${serviceId}-${rowId}-${tabId}-${currentCount}-url-input-div" class="row mb-1 align-items-center">
                      <div class="col-4">
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-url-input" class="mb-0">
                          URL
                        </label>
                      </div>
                      <div class="col-8">
                        <input type="text"
                          class="form-control"
                          data-collect="true"
                          data-group="datamount-${currentCount}"
                          name="url"
                          disabled
                          id="${serviceId}-${rowId}-${tabId}-${currentCount}-url-input" value="https://b2drop.eudat.eu/remote.php/webdav/" placeholder=""
                        />
                      </div>
                    </div>
                    <div style="display: none" id="${serviceId}-${rowId}-${tabId}-${currentCount}-vendor-input-div" class="row mb-1 align-items-center">
                      <div class="col-4">
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-vendor-input" class="mb-0">
                          Vendor
                        </label>
                      </div>
                      <div class="col-8">
                        <input type="text"
                          class="form-control"
                          data-collect="true"
                          data-group="datamount-${currentCount}"
                          name="vendor"
                          disabled
                          id="${serviceId}-${rowId}-${tabId}-${currentCount}-vendor-input" value="nextcloud" placeholder=""
                        />
                      </div>
                    </div>
                    <div id="${serviceId}-${rowId}-${tabId}-${currentCount}-user-input-div" class="row mb-1 align-items-center">
                      <div class="col-4">
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-user-input" class="mb-0">
                          User
                        </label>
                      </div>
                      <div class="col-8">
                        <input type="text"
                          class="form-control data-mount-b2drop-user"
                          data-collect="true"
                          data-group="datamount-${currentCount}"
                          name="user"
                          id="${serviceId}-${rowId}-${tabId}-${currentCount}-username-input" value="" placeholder=""
                        />
                      </div>
                    </div>
                    <div id="${serviceId}-${rowId}-${tabId}-${currentCount}-password-input-div" class="row mb-1 align-items-center">
                      <div class="col-4">
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-password-input" class="mb-0">
                          Password
                        </label>
                      </div>
                      <div class="col-8">
                        <div class="input-group">
                          <input
                            type="password"
                            class="form-control"
                            name="obscure_pass"
                            data-group="datamount-${currentCount}"
                            data-collect="true"
                            data-secret="true"
                            id="${serviceId}-${rowId}-${tabId}-${currentCount}-password-input"
                            placeholder=""
                            value=""
                          />
                          <button
                            class="btn btn-light data-mount-passwd-btn"
                            type="button"
                            id="${serviceId}-${rowId}-${tabId}-${currentCount}-password-view-password"
                          >
                            <i id="${serviceId}-${rowId}-${tabId}-${currentCount}-password-password-eye" class="fa fa-eye" aria-hidden="true"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div data-storage-template="aws" style="display: none">
                    <div id="${serviceId}-${rowId}-${tabId}-${currentCount}-aws-remotepath-input-div" class="row mb-1 align-items-center">
                      <div class="col-4">
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-aws-remotepath-input" class="mb-0">
                          Bucket Name
                        </label>
                      </div>
                      <div class="col-8">
                        <input type="text"
                          class="form-control"
                          name="remotepath"
                          data-collect="false"
                          data-group="datamount-${currentCount}"
                          id="${serviceId}-${rowId}-${tabId}-${currentCount}-aws-remotepath-input" value="" placeholder=""
                        />
                      </div>
                    </div>
                    <div style="display: none" id="${serviceId}-${rowId}-${tabId}-${currentCount}-aws-type-input-div" class="row mb-1 align-items-center">
                      <div class="col-4">
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-aws-type-input" class="mb-0">
                          Type
                        </label>
                      </div>
                      <div class="col-8">
                        <input type="text"
                          class="form-control"
                          data-collect="true"
                          data-group="datamount-${currentCount}"
                          name="type"
                          disabled
                          id="${serviceId}-${rowId}-${tabId}-${currentCount}-aws-type-input" value="s3" placeholder=""
                        />
                      </div>
                    </div>
                    <div style="display: none" id="${serviceId}-${rowId}-${tabId}-${currentCount}-awsprovider-div" class="row mb-1 align-items-center">
                      <div class="col-4">
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-awsprovider-input" class="mb-0">
                          Provider
                        </label>
                      </div>
                      <div class="col-8">
                        <input type="text"
                          class="form-control"
                          data-collect="true"
                          data-group="datamount-${currentCount}"
                          name="provider"
                          disabled
                          id="${serviceId}-${rowId}-${tabId}-${currentCount}-awsprovider-input" value="AWS" placeholder=""
                        />
                      </div>
                    </div>
                    <div id="${serviceId}-${rowId}-${tabId}-${currentCount}-aws-region-input-div" class="row mb-1 align-items-center">
                      <div class="col-4 col-form-label d-flex align-items-start justify-content-between"> 
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-aws-region-input" class="d-flex align-items-center w-100"> 
                          Region
                        </label>
                      </div>
                      <div class="col-8">
                        <select
                          name="region"
                          data-collect="false"
                          data-group="datamount-${currentCount}"
                          id="${serviceId}-${rowId}-${tabId}-${currentCount}-aws-region-input"
                          class="form-select"
                        >
                          <option value="eu-north-1">EU (Stockholm) (eu-north-1)</option>
                          <option value="eu-central-1">EU (Frankfurt) (eu-central-1)</option>
                          <option value="eu-west-1">EU (Ireland) (eu-west-1)</option>
                          <option value="eu-west-2">EU (London) (eu-west-2)</option>
                          <option value="ca-central-1">Canada (Central) (ca-central-1)</option>
                          <option value="us-east-1">US East (Northern Virginia) (us-east-1)</option>
                          <option value="us-east-2">US East (Ohio) (us-east-2)</option>
                          <option value="us-west-1">US West (Northern California) (us-west-1)</option>
                          <option value="us-west-2">US West (Oregon) (us-west-2)</option>
                          <option value="ap-southeast-1">Asia Pacific (Singapore) (ap-southeast-1)</option>
                          <option value="ap-southeast-2">Asia Pacific (Sydney) (ap-southeast-2)</option>
                          <option value="ap-northeast-1">Asia Pacific (Tokyo) (ap-northeast-1)</option>
                          <option value="ap-northeast-2">Asia Pacific (Seoul) (ap-northeast-2)</option>
                          <option value="ap-south-1">Asia Pacific (Mumbai) (ap-south-1)</option>
                          <option value="sa-east-1">South America (Sao Paulo) (sa-east-1)</option>
                        </select>
                      </div>
                    </div>
                    <div id="${serviceId}-${rowId}-${tabId}-${currentCount}-aws-user-input-div" class="row mb-1 align-items-center">
                      <div class="col-4">
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-aws-user-input" class="mb-0">
                          Username
                        </label>
                      </div>
                      <div class="col-8">
                        <input type="text"
                          class="form-control"
                          data-collect="false"
                          data-group="datamount-${currentCount}"
                          name="username"
                          data-name="access_key_id"
                          id="${serviceId}-${rowId}-${tabId}-${currentCount}-aws-username-input" value="" placeholder=""
                        />
                      </div>
                    </div>
                    <div id="${serviceId}-${rowId}-${tabId}-${currentCount}-aws-password-input-div" class="row mb-1 align-items-center">
                      <div class="col-4">
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-aws-password-input" class="mb-0">
                          Password
                        </label>
                      </div>
                      <div class="col-8">
                        <div class="input-group">
                          <input
                            type="password"
                            class="form-control"
                            data-collect="false"
                            data-secret="true"
                            data-group="datamount-${currentCount}"
                            name="password"
                            data-name="secret_access_key"
                            id="${serviceId}-${rowId}-${tabId}-${currentCount}-aws-password-input"
                            placeholder=""
                            value=""
                          />
                          <button
                            class="btn btn-light data-mount-passwd-btn"
                            type="button"
                            id="${serviceId}-${rowId}-${tabId}-${currentCount}-aws-password-view-password"
                            data-storage="true"
                            data-template="aws"
                          >
                            <i id="${serviceId}-${rowId}-${tabId}-${currentCount}-aws-password-password-eye" class="fa fa-eye" aria-hidden="true"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div data-storage-template="s3" style="display: none">
                    <div style="display: none" id="${serviceId}-${rowId}-${tabId}-${currentCount}-s3-type-input-div" class="row mb-1 align-items-center">
                      <div class="col-4">
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-s3-type-input" class="mb-0">
                          Type
                        </label>
                      </div>
                      <div class="col-8">
                        <input type="text"
                          class="form-control"
                          data-collect="true"
                          data-group="datamount-${currentCount}"
                          name="type"
                          disabled
                          id="${serviceId}-${rowId}-${tabId}-${currentCount}-s3-type-input" value="s3" placeholder=""
                        />
                      </div>
                    </div>
                    <div id="${serviceId}-${rowId}-${tabId}-${currentCount}-s3-provider-input-div" class="row mb-1 align-items-center">
                      <div class="col-4 col-form-label d-flex align-items-start justify-content-between"> 
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-s3-provider-input" class="d-flex align-items-center w-100"> 
                          Provider
                        </label>
                      </div>
                      <div class="col-8">
                        <select
                          name="provider"
                          data-name="provider"
                          data-collect="false"
                          data-group="datamount-${currentCount}"
                          id="${serviceId}-${rowId}-${tabId}-${currentCount}-s3-provider-input"
                          class="form-select"
                        >
                          <option value="AWS">Amazon Web Services (AWS) S3</option>
                          <option value="Alibaba">Alibaba Cloud Object Storage System (OSS) formerly Aliyun</option>
                          <option value="Ceph">Ceph Object Storage</option>
                          <option value="DigitalOcean">Digital Ocean Spaces</option>
                          <option value="Dreamhost">Dreamhost DreamObjects</option>
                          <option value="IBMCOS">IBM COS S3</option>
                          <option value="Minio">Minio Object Storage</option>
                          <option value="Netease">Netease Object Storage (NOS)</option>
                          <option value="Wasabi">Wasabi Object Storage</option>
                          <option value="Other">Any other S3 compatible provider</option>
                        </select>
                      </div>
                    </div>
                    <div id="${serviceId}-${rowId}-${tabId}-${currentCount}-s3-remotepath-input-div" class="row mb-1 align-items-center">
                      <div class="col-4">
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-s3-remotepath-input" class="mb-0">
                          Bucket Name
                        </label>
                      </div>
                      <div class="col-8">
                        <input type="text"
                          class="form-control"
                          name="remotepath"
                          data-collect="false"
                          data-group="datamount-${currentCount}"
                          data-name="remotepath"
                          id="${serviceId}-${rowId}-${tabId}-${currentCount}-s3-remotepath-input" value="bucketname" placeholder=""
                        />
                      </div>
                    </div>
                    <div id="${serviceId}-${rowId}-${tabId}-${currentCount}-s3-endpoint-input-div" class="row mb-1 align-items-center">
                      <div class="col-4">
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-s3-endpoint-input" class="mb-0">
                          Endpoint for S3 API
                        </label>
                      </div>
                      <div class="col-8">
                        <input type="text"
                          class="form-control"
                          name="endpoint"
                          data-collect="false"
                          data-group="datamount-${currentCount}"
                          data-name="endpoint"
                          id="${serviceId}-${rowId}-${tabId}-${currentCount}-s3-endpoint-input" value="" placeholder=""
                        />
                      </div>
                    </div>
                    <div id="${serviceId}-${rowId}-${tabId}-${currentCount}-s3-username-input-div" class="row mb-1 align-items-center">
                      <div class="col-4">
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-s3-username-input" class="mb-0">
                          Username
                        </label>
                      </div>
                      <div class="col-8">
                        <input type="text"
                          class="form-control"
                          name="username"
                          data-collect="false"
                          data-group="datamount-${currentCount}"
                          data-name="access_key_id"
                          id="${serviceId}-${rowId}-${tabId}-${currentCount}-s3-username-input" value="" placeholder=""
                        />
                      </div>
                    </div>
                    <div id="${serviceId}-${rowId}-${tabId}-${currentCount}-s3-password-input-div" class="row mb-1 align-items-center">
                      <div class="col-4">
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-s3-password-input" class="mb-0">
                          Password
                        </label>
                      </div>
                      <div class="col-8">
                        <div class="input-group">
                          <input
                            type="password"
                            class="form-control"
                            name="password"
                            data-collect="false"
                            data-secret="true"
                            data-group="datamount-${currentCount}"
                            data-name="secret_access_key"
                            id="${serviceId}-${rowId}-${tabId}-${currentCount}-s3-password-input"
                            placeholder=""
                            value=""
                          />
                          <button
                            class="btn btn-light data-mount-passwd-btn"
                            type="button"
                            id="${serviceId}-${rowId}-${tabId}-${currentCount}-s3-password-view-password"
                            data-storage="true"
                            data-template="s3"
                          >
                            <i id="${serviceId}-${rowId}-${tabId}-${currentCount}-s3-password-password-eye" class="fa fa-eye" aria-hidden="true"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div id="${serviceId}-${rowId}-${tabId}-${currentCount}-s3-region-input-div" class="row mb-1 align-items-center">
                      <div class="col-4">
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-s3-region-input" class="mb-0">
                          Region
                        </label>
                      </div>
                      <div class="col-8">
                        <input type="text"
                          class="form-control"
                          name="region"
                          data-collect="false"
                          data-group="datamount-${currentCount}"
                          data-name="region"
                          id="${serviceId}-${rowId}-${tabId}-${currentCount}-s3-region-input" value="" placeholder=""
                        />
                      </div>
                    </div>
                  </div>
                  <div data-storage-template="webdav" style="display: none">
                    <div id="${serviceId}-${rowId}-${tabId}-${currentCount}-webdav-remotepath-input-div" class="row mb-1 align-items-center">
                      <div class="col-4">
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-webdav-remotepath-input" class="mb-0">
                          Path
                        </label>
                      </div>
                      <div class="col-8">
                        <input type="text"
                          class="form-control"
                          name="remotepath"
                          data-collect="false"
                          data-group="datamount-${currentCount}"
                          data-name="remotepath"
                          id="${serviceId}-${rowId}-${tabId}-${currentCount}-webdav-remotepath-input" value="/" placeholder=""
                        />
                      </div>
                    </div>
                    <div style="display: none" id="${serviceId}-${rowId}-${tabId}-${currentCount}-webdav-type-input-div" class="row mb-1 align-items-center">
                      <div class="col-4">
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-webdav-type-input" class="mb-0">
                          Type
                        </label>
                      </div>
                      <div class="col-8">
                        <input type="text"
                          class="form-control"
                          data-collect="true"
                          data-group="datamount-${currentCount}"
                          name="type"
                          disabled
                          id="${serviceId}-${rowId}-${tabId}-${currentCount}-webdav-type-input" value="webdav" placeholder=""
                        />
                      </div>
                    </div>
                    <div id="${serviceId}-${rowId}-${tabId}-${currentCount}-webdav-url-input-div" class="row mb-1 align-items-center">
                      <div class="col-4">
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-webdav-url-input" class="mb-0">
                          URL
                        </label>
                      </div>
                      <div class="col-8">
                        <input type="text"
                          class="form-control"
                          name="url"
                          data-collect="false"
                          data-group="datamount-${currentCount}"
                          data-name="url"
                          id="${serviceId}-${rowId}-${tabId}-${currentCount}-webdav-url-input" value="https://b2drop.eudat.eu/remote.php/webdav/" placeholder=""
                        />
                      </div>
                    </div>
                    <div id="${serviceId}-${rowId}-${tabId}-${currentCount}-webdav-vendor-input-div" class="row mb-1 align-items-center">
                      <div class="col-4 col-form-label d-flex align-items-start justify-content-between"> 
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-webdav-vendor-input" class="d-flex align-items-center w-100"> 
                          Vendor
                        </label>
                      </div>
                      <div class="col-8">
                        <select
                          name="element_id"
                          data-collect="false"
                          data-group="datamount-${currentCount}"
                          id="${serviceId}-${rowId}-${tabId}-${currentCount}-webdav-vendor-input"
                          class="form-select"
                        >
                          <option value="nextcloud">Nextcloud</option>
                          <option value="owncloud">Owncloud</option>
                          <option value="sharepoint">Sharepoint</option>
                          <option value="other">Other site/service or software</option>
                        </select>
                      </div>
                    </div>
                    <div id="${serviceId}-${rowId}-${tabId}-${currentCount}-webdav-user-input-div" class="row mb-1 align-items-center">
                      <div class="col-4">
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-webdav-user-input" class="mb-0">
                          User
                        </label>
                      </div>
                      <div class="col-8">
                        <input type="text"
                          class="form-control"
                          name="username"
                          data-collect="false"
                          data-group="datamount-${currentCount}"
                          data-name="user"
                          id="${serviceId}-${rowId}-${tabId}-${currentCount}-webdav-user-input" value="" placeholder=""
                        />
                      </div>
                    </div>
                    <div id="${serviceId}-${rowId}-${tabId}-${currentCount}-webdav-password-input-div" class="row mb-1 align-items-center">
                      <div class="col-4">
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-webdav-password-input" class="mb-0">
                          Password
                        </label>
                      </div>
                      <div class="col-8">
                        <div class="input-group">
                          <input
                            type="password"
                            class="form-control"
                            name="password"
                            data-collect="false"
                            data-secret="true"
                            data-group="datamount-${currentCount}"
                            data-name="obscure_pass"
                            id="${serviceId}-${rowId}-${tabId}-${currentCount}-webdav-password-input"
                            placeholder=""
                            value=""
                          />
                          <button
                            class="btn btn-light data-mount-passwd-btn"
                            type="button"
                            id="${serviceId}-${rowId}-${tabId}-${currentCount}-webdav-password-view-password"
                            data-storage="true"
                            data-template="webdav"
                          >
                            <i id="${serviceId}-${rowId}-${tabId}-${currentCount}-webdav-password-password-eye" class="fa fa-eye" aria-hidden="true"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div id="${serviceId}-${rowId}-${tabId}-${currentCount}-webdav-bearer-input-div" class="row mb-1 align-items-center">
                      <div class="col-4">
                        <label for="${serviceId}-${rowId}-${tabId}-${currentCount}-webdav-bearer-input" class="mb-0">
                          Bearer Token (optional)
                        </label>
                      </div>
                      <div class="col-8">
                        <input type="text"
                          class="form-control"
                          name="bearer"
                          data-collect="false"
                          data-group="datamount-${currentCount}"
                          data-name="bearer_token"
                          id="${serviceId}-${rowId}-${tabId}-${currentCount}-webdav-bearer-input" value="" placeholder=""
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    `;
  }


  // Buttons End


  $(document).on("sse", "[data-sse-flavors]", function (event, data) {
    const $this = $(this);
    const serviceId = $this.attr("data-service");
    const rowId = $this.attr("data-row");
    for ( const [system, systemFlavors] of Object.entries(data) ) {
      kubeOutpostFlavors[system] = systemFlavors;
    }
    const currentSystem = $this.parent().find(`[id$='-system-input']`);
    if ( currentSystem.length && currentSystem.attr("data-collect") == "true" ) {
      if ( Object.keys(data).includes(currentSystem.val()) ){
        setFlavorInfo(serviceId, rowId, currentSystem.val(), kubeOutpostFlavors[currentSystem.val()]);
      }
    }
  });

  $(document).on("sse", "[data-sse-credits]", function (event, datalist) {
    const $this = $(this);
    if ( $this.attr("data-header-element") === "true" ) {
      const service = $this.attr("data-service");
      const row = $this.attr("data-row");
      const system = $(`[data-service="${service}"][data-row="${row}"][id$='-system-input']`).val();

      for (const data of datalist) {
        const creditsUserOptions = data?.user_options || {};
        if ( system && "system" in creditsUserOptions ) {
          if ( system === creditsUserOptions["system"] ) {
            var creditsProject = "";
            if ( data.project ) {
              creditsProject = ` ( ${data.project.name}: ${data.project.balance} / ${data.project.cap} per day )`;
            }
            const creditsText = `Credits: ${data.balance} / ${data.cap} per day ${creditsProject}`;
            $this.text(`${system} ( ${creditsText} )`);
          }
        }
      }
    } else {
      for (const data of datalist) {
        const creditsUserOptions = data?.user_options || {};
        const selectCreditsKey = $this.attr("data-sse-credits-key") || false;
        if (selectCreditsKey && (selectCreditsKey in creditsUserOptions)) {
          $this.find("option").each(function() {
            if ( $(this).val() === creditsUserOptions[selectCreditsKey] ) {
              var creditsProject = "";
              if ( data.project ) {
                creditsProject = `( ${data.project.name}: ${data.project.balance} / ${data.project.cap} per day )`;
              }
              const creditsText = `Credits: ${data.balance} / ${data.cap} per day ${creditsProject}`;
              $(this).text(`${$(this).val()} ( ${creditsText} )`);
            }
          });
        } else if (!selectCreditsKey && Object.keys(creditsUserOptions).length === 0 ) {
            var creditsProject = "";
            if ( data.project ) {
              creditsProject = ` ( ${data.project.name}: ${data.project.balance} / ${data.project.cap} )`;
            }
            const creditsText = `Global Credits: ${data.balance} / ${data.cap} ${creditsProject}`;
            $(this).text(`${creditsText}`);
        }
      }
    }
  });

  $(document).on("click", "input[id$='-select-all-input']", function () {
    const $this = $(this);
    const parentDiv = $this.parent().parent().parent();
    if ( $this.prop("checked") ) {
      parentDiv.find(`input[id$='-input']:not([id$='-select-none-input']`).prop("checked", true);
      parentDiv.find(`[id$='-select-none-input']`).prop("checked", false);
    }
  })

  $(document).on("click", "input[id$='-select-none-input']", function () {
    const $this = $(this);
    const parentDiv = $this.parent().parent().parent();
    if ( $this.prop("checked") ) {
      parentDiv.find(`input[id$='-input']:not([id$='-select-none-input']`).prop("checked", false);
    }
  })

  $(document).on("click", ".summary-tr", function (event) {
    if (![event.target, event.target.parentElement, event.target.parentElement?.parentElement]
      .some(el => el?.tagName === "BUTTON")) {
      const $this = $(this);
      const id = $this.data("server-id");
      let accordionIcon = $(this).find(".accordion-icon");
      let collapse = $(`.collapse[id^=${id}]`);
      if ( collapse.length > 0 ) {
        let shown = collapse.hasClass("show");
        if (shown) accordionIcon.addClass("collapsed");
        else accordionIcon.removeClass("collapsed");
        new bootstrap.Collapse(collapse);
      }
    }
  });


  function getServiceConfig(serviceId) {
    const key = mappingDict[serviceId]["serviceKey"];
    const userGroups = getAuthState()?.groups || {};
    const all = serviceConfig[key];
    const options = {};
    for ( const [key, value] of Object.entries(all.options) ) {
      if ( value.allowedLists.groups.some( item => userGroups.includes(item) ) ) {
        options[key] = value;
      }
    }
    const sortedOptions = Object.entries(options).sort((a, b) => b[1].weight - a[1].weight)
    const sortedOptionsObj = {};
    for (const [key, value] of sortedOptions) {
      sortedOptionsObj[key] = value;
    }
    all["options"] = sortedOptionsObj;
    return all;
  }


  function val(obj) {
    let ret = "";
    if ( obj.is("input[type='checkbox']") ) {
      ret = obj.prop('checked');
    } else if ( obj.is("select") ) {
      ret = obj.val();
      if ( !Array.isArray(ret) ){
        ret = [ret];
      }
    } else {
      ret = obj.val();
    }
    return ret;
  }


  function getInputElement(serviceId, rowId, elementId) {
    return $(`[id^='${serviceId}-${rowId}-'][id$='-${elementId}-input']`);
  }

  function getLabelCBElement(serviceId, rowId, elementId) {
    return $(`input[id^='${serviceId}-${rowId}-'][id$='-${elementId}-input-cb']`);
  }

  function getInputDiv(serviceId, rowId, elementId) {
    return $(`div[id^='${serviceId}-${rowId}-'][id$='-${elementId}-input-div']`);
  }

  function getLabel(inputElement) {
    return $(`label[for='${inputElement.prop("id")}']`);
  }

  function getInvalidFeedback(inputDiv) {
    return inputDiv.find(".invalid-feedback");
  }

  function getOptionTypes(serviceId, rowId) {
    const options = val(getInputElement(serviceId, rowId, "option"));
    let ret = [];
    options.forEach(option => {
      ret.push(mappingDict[serviceId]?.["option"]?.[option] ?? option);
    });
    return ret;
  }

  function isEmptyObject(obj) {
    return obj && typeof obj === 'object' && Object.keys(obj).length === 0;
  }

  function fillSelect(elementId, select, values_, groups = {}, inactive_values = [], inactive_text = "N/A") {
    let values = values_;
    const key = select.attr("name");
    const serviceId = select.attr("data-service");
    const rowId = select.attr("data-row");
    let defaultValue = false;

    const workshopValues = getWorkshopOptions();
    const isWorkshop = !isEmptyObject(workshopValues);
    if (isWorkshop) {
      const dataGroup = select.attr("data-group");
      let allowedValues;
      if ( ["none", "default"].includes(dataGroup) ) {
        allowedValues = workshopValues?.[key] ?? false;
      } else {
        allowedValues = workshopValues?.[dataGroup]?.[key] ?? false;
      }
      defaultValue = workshopValues?.defaultvalues?.[key] ?? false;
      if ( allowedValues ) {
        allowedValues = Array.isArray(allowedValues) ? allowedValues : [allowedValues];
        values = values.filter( ([val,_]) => allowedValues.includes(val));
      }
    }
    const labelElement = $(`label[for='${select.attr("id")}']`);
    const checkBox = labelElement.find("input[type='checkbox']");
    let preValue = select.val();
    select.html("");
    let valueIndex = 0;

    for (const groupLabel in groups) {
      if (groups.hasOwnProperty(groupLabel)) {
        const groupSize = groups[groupLabel];
        select.append(`<optgroup label="${groupLabel}">`);
        for (let i = 0; i < groupSize; i++) {
            if (valueIndex < values.length) {
                select.append(`<option value="${values[valueIndex][0]}">${values[valueIndex][1]}</option>`);
                valueIndex++;
            }
        }
        select.append(`</optgroup>`);
      }
    }

    while (valueIndex < values.length) {
      select.append(`<option value="${values[valueIndex][0]}">${values[valueIndex][1]}</option>`);
      valueIndex++;
    }

    // Add a horizontal line if there are inactive options
    if (inactive_values.length > 0) {
        select.append('<hr>');
    }

    // Add inactive options at the end of the dropdown
    inactive_values.forEach(([key, value]) => {
      select.append(`<option value="${key}" disabled>${value} (${inactive_text})</option>`);
    });

    if ( defaultValue && select.find(`option[value="${defaultValue}"]:not(:disabled)`).length) {
      select.val(defaultValue);
    } else if ( preValue && select.find(`option[value="${preValue}"]:not(:disabled)`).length) {
      select.val(preValue);
    } else {
      if ( select.prop("multiple") ) {
        select.val(null);
      } else {
        if (values.length > 0){
          select.val(values[0][0]);
        } else if ( !defaultValue ) {
          console.error(`Could not fill object ${elementId}. Check configuration.`);
          if (isWorkshop) {
            workshopNotUsable(select);
          }
        }
      }
    }
  }

  function workshopNotUsable(element, description="") {
    const workshopValues = getWorkshopOptions();
    const isWorkshop = !isEmptyObject(workshopValues);
    if (isWorkshop) {
      const helpDiv = $('#workshopnotusable');
      if ( helpDiv.children().length === 0 ) {
        const serviceId = element.attr("data-service");
        const rowId = element.attr("data-row");
        const currentOptions = JSON.stringify(collectSelectedOptions(serviceId, rowId));
        const elementName = element.attr("data-element");
        const defaultValues = workshopValues?.defaultvalues ?? {};
        const workshopId = workshopValues?.workshopid ?? "noworkshopid";
        const allowedSystems = workshopValues?.system || false;
        
        if ( !description ) {
          if ( Object.keys(defaultValues).includes(elementName) ) {
            description = `${elementName} could not be set to default value "${defaultValues[elementName]}".`;
          } else {
            description = `${elementName} could not be set correctly.`
          }
        }

        const workshopSystems = workshopValues?.system || [];
        let workshopProject = workshopValues?.project || [];
        if ( !Array.isArray(workshopProject) ){
          workshopProject = [workshopProject];
        }
        let workshopPartition = workshopValues?.partition || [];
        if ( !Array.isArray(workshopPartition) ){
          workshopPartition = [workshopPartition];
        }

        var partitionLinkText = "";
        var partitionLinkText2 = "";
        var projectInviteText = "";
        if ( workshopProject.length === 0 ) {
          projectInviteText = `
            <li style="color: #333;">Enter the Project id, that was handed out during the workshop invivation. If in doubt, ask the workshop instructor for the project id.</li>
          `
          partitionLinkText = `
            <li style="color: #333;">Click on the project of this workshop.</li>
            <li style="color: #333;">Click on "Request access for resources".</li>
            <img src="/hub/static/images/workshop/partition_01.png" alt="Login Procedure" style="width: 100%; max-width: 400px; margin-top: 10px; border: 1px solid #ddd; border-radius: 5px;">
          `
        } else {
          workshopProject.forEach(project => {
            projectInviteText += `
              <li style="color: #333;">Enter "${project}" into Project id, add some additional information and clickon "Join project".</li>
            `
          })
          if ( workshopProject.length === 1 ) {
            partitionLinkText = `
              <li style="color: #333;">Visit <a href="https://judoor.fz-juelich.de/projects/${workshopProject[0]}/request" target="_blank">JuDoor</a> and sign in with the credentials you've used to log into here.</li>
              
            `
          } else {
            partitionLinkText = `
              <li style="color: #333;">Visit <a href="https://judoor.fz-juelich.de/" target="_blank">JuDoor</a> and sign in with the credentials you've used to log into here.</li>
              <li style="color: #333;">Click on the projects of this workshop ( ${workshopProject} ). Repeat the "request access for resources" for each project.</li>
              <li style="color: #333;">Click on "Request access for resources".</li>
              <img src="/hub/static/images/workshop/partition_01.png" alt="Login Procedure" style="width: 100%; max-width: 400px; margin-top: 10px; border: 1px solid #ddd; border-radius: 5px;">
            `
          }
        }

        if ( workshopPartition.length === 0 ) {
          partitionLinkText2 = `
            <li style="color: #333;">Select all partitions.</li>
          `
        } else {
          partitionLinkText2 = `
            <li style="color: #333;">Select these partitions: ${workshopPartition}.</li>
          `
        }
        var missingSystems = _getAllSystems().filter(key => workshopSystems.includes(key));
        var stepLogin = "";
        var stepSystem = "";
        var stepProject = "";
        var stepPartition = "";
          // User doesn't have a access to a single system in the workshop
          // Maybe we can check this in the feature via auth_state entitlements
          stepLogin = `
            <details style="margin-bottom: 15px;">
              <summary style="font-weight: bold; margin-left: 10px; font-size: 16px; color: #0056b3; cursor: pointer;">
                  - Use the correct AAI during the Login process (click here to expand)
              </summary>
              <div style="margin-left: 20px; margin-top: 10px;">
                <p style="color: #333;">When using HPC resources, you have to use the JSC Account during the login process.</p>
                <ul>
                  <li style="color: #333;">Click on <a href="${window.origin}/hub/logout" target="_blank">Logout</a></li>
                  <li style="color: #333;">Click on <a href="${window.origin}/hub/login?next=%2Fhub%2Fworkshops%2F${workshopId}" target="_blank">Login</a> (make sure to come back to this page ("/workshops/${workshopId}") after logging in).</li>
                  <ul>
                    <li style="color: #333;">Click on "Sign In"</li>
                    <li style="color: #333;">Click on "Show other sign in options"</li>
                      <img src="/hub/static/images/workshop/login_01.png" alt="Login Procedure" style="width: 100%; max-width: 400px; margin-top: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    <li style="color: #333;">Click on "Sign in with JSC Account"</li>
                    <li style="color: #333;">Enter your JSC Account credentials and click on Login. Don't have an account yet? Click on register and follow the process. For more information look into the <a href="https://www.fz-juelich.de/en/ias/jsc/services/user-support/how-to-get-access-to-systems/judoor" target="_blank"> JuDoor documentation</a>.</li>
                  </ul>
                </ul>
              </div>
            </details>
          `
          stepProject = `
            <details style="margin-bottom: 15px;">
              <summary style="font-weight: bold; margin-left: 10px; font-size: 16px; color: #0056b3; cursor: pointer;">
                  - Join Projects (click here to expand)
              </summary>
              <div style="margin-left: 20px; margin-top: 10px;">
                <p style="color: #333;">When using HPC resources, you have to join a project, before you're allowed to use resources.</p>
                <ul>
                  <li style="color: #333;">Visit <a href="https://judoor.fz-juelich.de" target="_blank">JuDoor</a> and sign in with the credentials you've used to log into here.</li>
                  <li style="color: #333;">Click on "Join a project"</li>
                  <img src="/hub/static/images/workshop/project_01.png" alt="Join Project" style="width: 100%; max-width: 400px; margin-top: 10px; border: 1px solid #ddd; border-radius: 5px;">
                  ${projectInviteText}
                  <li style="color: #333;">You will receive an email. Follow the steps in this mail.</li>
                  <li style="color: #333;">For more information about joining projects look into the <a href="https://www.fz-juelich.de/en/ias/jsc/services/user-support/how-to-get-access-to-systems/judoor" target="_blank">JuDoor documentation</a></li>
                </ul>                
              </div>
            </details>
          `
        
        stepSystem = `
            <details style="margin-bottom: 15px; ">
              <summary style="font-weight: bold; margin-left: 10px; font-size: 16px; color: #0056b3; cursor: pointer;">
                  - Accept System Usage Policy (click here to expand)
              </summary>
              <div style="margin-left: 20px; margin-top: 10px;">
                <p style="color: #333;">When using HPC resources, you have to accept the usage policy of a system, before you're allowed to use resources.</p>
                <ul>
                  <li style="color: #333;">Visit <a href="https://judoor.fz-juelich.de" target="_blank">JuDoor</a> and sign in with the credentials you've used to log into here.</li>
                  <li style="color: #333;">You have to "sign the usage agreement" for the systems you want to use.</li>                  
                  <li style="color: #333;">It may take up to 30 minutes for your account to be fully updated and ready on the system after completing the steps.</li>
                  <li style="color: #333;">For more information look into the <a href="https://www.fz-juelich.de/en/ias/jsc/services/user-support/how-to-get-access-to-systems/judoor" target="_blank">JuDoor documentation</a></li>
                </ul>                
              </div>
            </details>
          `
        stepPartition = `
            <details style="margin-bottom: 15px; ">
              <summary style="font-weight: bold; margin-left: 10px; font-size: 16px; color: #0056b3; cursor: pointer;">
                  - Request access for resources (click here to expand)
              </summary>
              <div style="margin-left: 20px; margin-top: 10px;">
                <p style="color: #333;">Access to HPC resources must be requested before use.</p>
                <ul>
                  <li style="color: #333;">Visit <a href="https://judoor.fz-juelich.de" target="_blank">JuDoor</a> and sign in with the credentials you've used to log into here.</li>
                  ${partitionLinkText}
                  ${partitionLinkText2}
                  <li style="color: #333;">Click on "Inform PIs and PAs about your request.</li>
                  <li style="color: #333;">The PI or PA has to accept your request.</li>
                  <li style="color: #333;">It may take up to 30 minutes for your account to be fully updated and ready on the system after completing the steps.</li>
                  <li style="color: #333;">For more information look into the <a href="https://www.fz-juelich.de/en/ias/jsc/services/user-support/how-to-get-access-to-systems/judoor" target="_blank">JuDoor documentation</a></li>
                </ul>                
              </div>
            </details>
          `
        
        
        var genericHtml = `
          <div style="width: 80%; margin: auto; margin-top: 20px; margin-bottom: 20px; padding: 20px; border: 1px solid #ccc; border-radius: 10px; background-color: #f9f9f9;">
            <h2 style="text-align: center; color: #333;">Workshop "${workshopValues.workshopid}" not available for you.</h2>
            <h4 style="text-align: center; color: #333;">Reason: ${description}</h4>
            <p style="text-align: center; color: #666; font-weight: bold;">Your account is not yet ready to access this workshop. Please complete the steps below to proceed. Contact your workshop instructor or support, if this does not help</p>
            
            <div style="margin-top: 20px;">
                ${stepLogin}
                ${stepProject}
                ${stepSystem}
                ${stepPartition}
            </div>
            <p style="text-align: center; color: darkorange;">It may take up to 60 minutes for the systems to fully process account updates. Any start attempts during this time might fail.</p>
        </div>
        `
        helpDiv.append(genericHtml);
        $(`#global-content-div`).hide();
      }
    }
  }


  function dictHasKey(obj, key) {
    // Check if the key exists at the current level
    if (Object.hasOwn(obj, key)) {
      return true;
    }

    // Traverse through nested objects or arrays
    for (const k in obj) {
      if (typeof obj[k] === "object" && obj[k] !== null) {
        if (dictHasKey(obj[k], key)) {
          return true;
        }
      }
    }

    // If the key is not found
    return false;
  }


  function validateInput(inputElement) {
    const labelElement = $(`label[for='${inputElement.attr("id")}']`);
    const checkBox = labelElement.find("input[type='checkbox']");
    if ( checkBox.length > 0 && !checkBox.prop("checked") ) {
      return true;
    } else if( !inputElement[0].checkValidity() ) {
      inputElement.addClass('is-invalid');
      inputElement.siblings('.invalid-feedback').show();
      return false;
    } else {
      inputElement.removeClass('is-invalid');
      inputElement.siblings('.invalid-feedback').hide();
      return true;
    }
  }


  function validateSelect(selectElement) {
    const labelElement = $(`label[for='${selectElement.attr("id")}']`);
    const checkBox = labelElement.find("input[type='checkbox']");
    if ( checkBox.length > 0 && !checkBox.prop("checked") ) {
      return true;
    } else if (selectElement.val() === ""       
      || selectElement.val() === undefined)
    {
      selectElement.addClass('is-invalid');
      selectElement.siblings('.invalid-feedback').show();
      return false;
    } else {
      selectElement.removeClass('is-invalid');
      selectElement.siblings('.invalid-feedback').hide();
      return true;
    }
  }

  function validateForm(serviceId, rowId) {
    const form = $(`form[id='${serviceId}-${rowId}-form']`);
    let ret = true;
    form.find(`[id$='-input']:not(:disabled):not([data-collect="false"]):not([type="button"])`).each(function () {
      let $this = $(this);
      let key = $this.attr("data-element");
      let valid = true;
      if ( notAllowedKeys.includes(key) ){
        console.log(`${key} is not allowed. Choose a different name in configuration`);
        valid = false;
      } else {
        valid = $this.is("input") ? validateInput($this) : $this.is("select") ? validateSelect($this) : false;
      }
      if ( !valid ) {
        console.error("The following element is invalid: ");
        console.log($this);
        // If the user is looking at a different tab, we should highlight the button in the navbar
        const buttonDiv = $(`#${serviceId}-${rowId}-tab-button-div`);
        const activeTab = buttonDiv.find('.active').attr('name');
        const inputTab = $this.attr('data-tab');
        if ( inputTab !== activeTab ){
          buttonDiv.find(`button[data-tab='${inputTab}']`).click();
        }
        ret = false;
      }
    });
    if ( ret ) {
      form.find(`[id$='-input'].is-invalid`).removeClass('is-invalid');
      form.find(`[id$='-input'].invalid-feedback`).hide();
    }
    return ret;
  }


let sseTimeout = null;
const SSE_TIMEOUT_MS = 40_000;

function resetSSEWatchdog() {
  if (sseTimeout) {
    clearTimeout(sseTimeout);
  }
  sseTimeout = setTimeout(() => {
    console.warn("No SSE updates for 40s — reloading page...");
    location.reload();
  }, SSE_TIMEOUT_MS);
}

$(document).on("sse", `[data-sse-progress][id$='-summary-tr']`, function (event, data) {
  if (event.target !== this) {
    return; // Ignore events bubbling up from child elements
  }
  const $this = $(this);
  const serviceId = $this.attr("data-service");
  const rowId = $this.attr("data-row");
  if ( Object.keys(data).includes(rowId) ){
    const ready = data[rowId]?.ready ?? false;
    const failed = data[rowId]?.failed ?? false;
    const progress = data[rowId]?.progress ?? 10;
    const spawner = getSpawner(rowId);
    const pending = spawner.pending;

    let status = "starting";
    if ( ready ) status = "connecting";
    else if ( failed ) status = "stopped";
    else if ( progress == 99 ) status = "cancelling";
    else if ( progress == 0 ) status = "";
    progressBarUpdate(serviceId, rowId, status, progress);

    if ( (pageType() == pageType("start") || pageType() == pageType("spawn") ) && progress >= 85 && progress < 99 ) {
      resetSSEWatchdog();
    }

    if ( ready ) {
      if ( pageType(null) == pageType("start") || pageType(null) == pageType("spawn") ) {
          updateHeaderButtons(serviceId, rowId, "waiting");
          const url = data[rowId]?.url ?? "{{ url }}";
          checkAndOpenUrl(serviceId, rowId, url);
      } else {
          updateHeaderButtons(serviceId, rowId, "running");
          progressBarUpdate(serviceId, rowId, "running", 100);
          $(`button[id^='${serviceId}-${rowId}-'][id$='-btn']`).prop("disabled", false);
      }
    } else if ( failed ) {
      if (sseTimeout) {
        clearTimeout(sseTimeout);
      }
      updateHeaderButtons(serviceId, rowId, "stopped");
      $(`button[id^='${serviceId}-${rowId}-'][id$='-btn']`).prop("disabled", false);
    } else if ( progress == 99 ) {
      if (sseTimeout) {
        clearTimeout(sseTimeout);
      }
      updateHeaderButtons(serviceId, rowId, "cancelling");
      $(`button[id^='${serviceId}-${rowId}-'][id$='-btn']`).prop("disabled", true);
    } else {
      updateHeaderButtons(serviceId, rowId, "starting");
      $(`button[id^='${serviceId}-${rowId}-'][id$='-btn']`).prop("disabled", true);
    }
    appendToLog(serviceId, rowId, data[rowId]);
    
  }
});

$(document).on("sse", `[data-sse-reservations]`, function (event, data) {
  if (event.target !== this) {
    return; // Ignore events bubbling up from child elements
  }
  setReservations(data);
  $(`[id$='-reservation-input']`).trigger("change");
});


$(document).on("sse", `[data-sse-servers][id$='-summary-tr']`, function (event, data) {
  if (event.target !== this) {
    return; // Ignore events bubbling up from child elements
  }
  const $this = $(this);
  const serviceId = $this.attr("data-service");
  const rowId = $this.attr("data-row");
  const stopped = data?.stopped ?? [];
  const stopping = data?.stopping ?? [];
  if ( stopped.includes(rowId) ){
    progressBarUpdate(serviceId, rowId, "", 0);
    updateHeaderButtons(serviceId, rowId, "stopped");
  }
  if ( stopping.includes(rowId) ){
    progressBarUpdate(serviceId, rowId, "stopping", 100);
    updateHeaderButtons(serviceId, rowId, "stopping");
  }
});

  function homeFillElement(serviceId, rowId, user_options, inputElement) {
    const key = inputElement.attr("data-element");
    const dataGroup = inputElement.attr("data-group");
    const dataType = inputElement.attr("data-type");
    const dataRow = $(`tr[data-server-id="${serviceId}-${rowId}"]`);
    const prevValue = inputElement.val();
    let availableDescription = false;

    let newValue = "";
    let isInUserOptions = false;
    if ( dataType == "multiplecheckbox" ) {
      const dataParent = inputElement.attr("data-parent");
      const elementList = user_options?.[dataGroup]?.[dataParent] ?? [];
      if ( elementList.includes(key) ) {
        newValue = true;
      } else {
        newValue = false;
      }
    } else if ( ["none", "default"].includes(dataGroup) ) {
      newValue = user_options?.[key] ?? "";
    } else {
      newValue = user_options?.[dataGroup]?.[key] ?? "";
    }
    if ( newValue ) {
      isInUserOptions = true;
      if ( dataType == "select" ) {
        if (inputElement.find(`option[value="${newValue}"]`).length > 0) {
          inputElement.val(newValue);
          dataRow.find(`[id^='${serviceId}-${rowId}-'][id$='-input']`).trigger(`trigger_${key}`);
        } else {
          if ( inputElement.attr("data-element") === "system" && globalMaintenanceSystems.includes(newValue) ) {
            availableDescription = `${key} ${newValue} is currently in maintenace. See footer for more information.`;
          } else {
            availableDescription = `${key} ${newValue} currently not available`;
          }
          console.log(`${key} ${newValue} currently not available`);
        }
      } else if (dataType == "number" ) {
        const min = inputElement.attr("min");
        const max = inputElement.attr("max");
        if (newValue && parseInt(newValue) >= parseInt(min) && parseInt(newValue) <= parseInt(max)) {
          inputElement.val(parseInt(newValue));
          dataRow.find(`[id^='${serviceId}-${rowId}-'][id$='-input']`).trigger(`trigger_${key}`);
        } else {
          availableDescription = `${key} ${newValue} is not in allowed range [${min}, ${max}].`;
          console.log(`${key} ${newValue} currently not available`);
        }
      } else if (dataType == "multiplecheckbox" ) {
        inputElement.prop("checked", true);
      } else if (dataType == "checkbox" ) {
        inputElement.prop("checked", true);
        dataRow.find(`[id^='${serviceId}-${rowId}-'][id$='-input']`).trigger(`trigger_${key}`);
      } else {
        inputElement.val(newValue);
        dataRow.find(`[id^='${serviceId}-${rowId}-'][id$='-input']`).trigger(`trigger_${key}`);
      }
    } else if (inputElement.is("input[type='checkbox']") ) {
      isInUserOptions = true;
      inputElement.prop("checked", false);
      dataRow.find(`[id^='${serviceId}-${rowId}-'][id$='-input']`).trigger(`trigger_${key}`);
    }
    if ( isInUserOptions && !availableDescription ) {
      const labelElement = getLabelCBElement(serviceId, rowId, key);
      if ( labelElement.length > 0 ) {
        labelElement.prop("checked", true);
        labelElement.trigger("change");
      }
      if ( ["text", "number"].includes(dataType) ) {
        inputElement.trigger("input");
      } else {
        inputElement.trigger("change");
      }
    }
    return availableDescription;
  }

  function startFillExistingRow(serviceId, rowId, user_options, fillingOrder) {
    homeFillExistingRow(serviceId, rowId, user_options, fillingOrder);
    $(`[id^='${serviceId}-${rowId}-'][id$='-input']`).prop("disabled", true);
    const spawner = getSpawner(rowId);
    for ( const event of spawner.events ) {
      appendToLog(serviceId, rowId, event);
    }
    let option = $(`#${serviceId}-${rowId}-summary-tr`).attr('data-option');
    $(`div[id$='-collapse']:not([id^='${serviceId}-${rowId}-collapse'])`).removeClass("show");
    $(`div[id^='${serviceId}-${rowId}-collapse']`).addClass("show");
    let x = document.getElementById(`${serviceId}-${rowId}-summary-tr`);
    if ( x ) x.scrollIntoView();
    if ( spawner.ready ) {
      window.location.href = `/user/${window.jhdata.user}/${rowId}`;
    } else if ( !spawner.active ) {
      $(`[id^='${serviceId}-${rowId}-'][id$='-start-btn-header']`).trigger("click");
    } else {
      if ( spawner.pending === "stop" ) {
        updateHeaderButtons(serviceId, rowId, "stopping");
        progressBarUpdate(serviceId, rowId, "stopping", 100);
      } else {
        homeHeaderUpdate(serviceId, rowId);
        if ( serviceId === "jupyterlab" && option === "repo2docker" ) {
          updateHeaderButtons(serviceId, rowId, "building");
          progressBarUpdate(serviceId, rowId, "building", 2);
        } else {
          updateHeaderButtons(serviceId, rowId, "starting");
          progressBarUpdate(serviceId, rowId, "starting", 10);
        }
      }
    }
    $(`[id^='${serviceId}-${rowId}-'][id$='-logs-navbar-button']`).trigger("click");
  }

  function homeFillExistingRow(serviceId, rowId, user_options, fillingOrder) {
    let availableDescription = false;
    const dataRow = $(`tr[data-server-id="${serviceId}-${rowId}"]`);
    // It's important to fill the user options in the right order
    fillingOrder.forEach(key => {
      if ( !availableDescription ) {
        const inputElement = dataRow.find(`[id^='${serviceId}-${rowId}-'][id$='-${key}-input']`);
        if ( inputElement.length > 0) {
          availableDescription = homeFillElement(serviceId, rowId, user_options, inputElement);
        }
      }
    });
    const excludes = `:not(${fillingOrder.map(value => `[data-element='${value}']`).join(',')})`
    const unorderedElements = dataRow.find(`[id^='${serviceId}-${rowId}-'][id$='-input']${excludes}`);
    unorderedElements.each(function () {
      if ( !availableDescription ) {
        const inputElement = $(this);
        if ( inputElement.length > 0 ){
          availableDescription = homeFillElement(serviceId, rowId, user_options, inputElement);
        }
      }
    });
    if ( availableDescription ) {
      $(`tr.collapsible-tr[data-server-id='${serviceId}-${rowId}']`).remove();
      $(`#${serviceId}-${rowId}-summary-tr`).attr("data-spawner-na", "true");
      updateHeaderButtons(serviceId, rowId, "na");
      let description = `
        <div id="${serviceId}-${rowId}-config-td-nadescription-div" class="col text-lg-center col-12 col-lg-12">
          <span id="${serviceId}-${rowId}-config-td-nadescription">${availableDescription}</span>
        </div>
      `;
      const headerDescription = $(`#${serviceId}-${rowId}-config-td-div`);
      headerDescription.addClass("justify-content-center");
      $(`#${serviceId}-${rowId}-config-td-div`).html(description);
    }

    // Fill Storage Tab
    let datarows = [];
    let datarowcount = 1;
    const storageTabId = "storage";

    for (const [key, value] of Object.entries(user_options)) {
      if (key.startsWith("datamount-")) {
        datarows.push(value);
      }
    }

    // Loop through datarows
    for (const row of datarows) {
      const newRowHtml = createStorageRow(serviceId, rowId, storageTabId);
      $(`#${serviceId}-${rowId}-${storageTabId}-table tbody`).append(newRowHtml);
      $(`#${serviceId}-${rowId}-${storageTabId}-table`).show();

      const collapseId = `${serviceId}-${rowId}-${storageTabId}-${datarowcount}-collapse`;
      const $collapseRow = $(`#${collapseId}`);

      // Set template, path, readonly fields
      const templateInput = $collapseRow.find('[name="template"]');
      templateInput.val(row.template || '');
      templateInput.trigger("change");
      
      $collapseRow.find('[name="path"]').val(row.path || '');
      $collapseRow.find('[name="readonly"]').prop("checked", row.readonly === true);

      // Set attributes inside the template-specific container
      const $templateContainer = $collapseRow.find(`div[data-storage-template="${row.template}"]`);

      for (const [key, value] of Object.entries(row)) {
        if (["template", "path", "readonly"].includes(key)) continue;

        // Find element with an attribute named after the key

        const $targetElement = $templateContainer.find(`[name="${key}"], [data-name="${key}"]`);
        if ($targetElement.length > 0) {
          $targetElement.val(value);
        }
      }

      datarowcount++;
    }

    const shareId = user_options?.share_id ?? false;
    const r2dId = user_options?.r2d_id ?? false;
    if ( shareId || r2dId ) {
      $(`[id^='${serviceId}-${rowId}-'][id$='-input']`).prop("disabled", true);
      $(`[id^='${serviceId}-${rowId}-'][id$='-input-cb']`).prop("disabled", true);
      $(`button[id^='${serviceId}-${rowId}-'][id$='-view-password']`).prop("disabled", true);
      $(`[id^='${serviceId}-${rowId}-'][id$='-btn']:not([id$='-delete-btn']):not([id$='-copy-btn']):not([id$='-rtc-btn'])`).remove();
    }

    const spawner = getSpawner(rowId);
    for ( const event of spawner.events ) {
      appendToLog(serviceId, rowId, event);
    }
    const optionElement = getInputElement(serviceId, rowId, "option");
    const option = optionElement.length > 0 && optionElement[0].value;
    if ( !spawner.ready && spawner.active ) {
      if ( spawner.pending === "stop" ) {
        updateHeaderButtons(serviceId, rowId, "stopping");
        progressBarUpdate(serviceId, rowId, "stopping", 100);
      } else {
        homeHeaderUpdate(serviceId, rowId);
        if ( serviceId === "jupyterlab" && option === "repo2docker" ) {
          updateHeaderButtons(serviceId, rowId, "building");
          progressBarUpdate(serviceId, rowId, "building", 2);
        } else {
          updateHeaderButtons(serviceId, rowId, "starting");
          progressBarUpdate(serviceId, rowId, "starting", 10);
        }
      }
    }
  }


  function workshopManagerFillElement(serviceId, rowId, user_options, inputElement) {
    const key = inputElement.attr("data-element");
    const dataGroup = inputElement.attr("data-group");
    const dataType = inputElement.attr("data-type");

    let newValue = "";
    if ( dataType == "multiplecheckbox" ) {
      const dataParent = inputElement.attr("data-parent");
      const elementList = user_options?.[dataGroup]?.[dataParent] ?? [];
      if ( elementList.includes(key) ) {
        newValue = true;
      } else {
        newValue = false;
      }
    } else if ( ["none", "default"].includes(dataGroup) ) {
      newValue = user_options?.[key] ?? "";
    } else if ( dataGroup == "defaultvalues" ) {
      const dataParent = inputElement.attr("data-parent");
      newValue = user_options?.[dataGroup]?.[dataParent] ?? "";
    } else {
      newValue = user_options?.[dataGroup]?.[key] ?? "";
    }

    if ( newValue ) {
      if ( dataType == "select" ) {
        inputElement.val(newValue);
        inputElement.trigger("change");
      } else if (dataType == "checkbox" ) {
        inputElement.prop("checked", true);
        inputElement.trigger("change");
      } else {
        inputElement.val(newValue);
        inputElement.trigger("change");
      }
      const labelElement = $(`[id^='${serviceId}-${rowId}-'][id$='-${key}-input-cb']`);
      if ( labelElement && labelElement.length ) {
        labelElement.prop("disabled", false);
        labelElement.prop("checked", true);
        labelElement.trigger("change");
      }
      inputElement.trigger("change");
    } else if (inputElement.is("input[type='checkbox']") ) {
      inputElement.prop("checked", false);
      inputElement.trigger("change");
    }
  }

  function workshopManagerFillExistingRow(serviceId, rowId, user_options, fillingOrder) {
    fillingOrder.forEach(key => {  
      const inputElement = $(`[id^='${serviceId}-${rowId}-'][id$='-${key}-input']`);
      workshopManagerFillElement(serviceId, rowId, user_options, inputElement);
    })

    const excludes = `:not(${fillingOrder.map(value => `[data-element='${value}']`).join(',')})`
    const unorderedElements = $(`[id^='${serviceId}-${rowId}-'][id$='-input']${excludes}`);

    unorderedElements.each(function () {
      const inputElement = $(this);
      workshopManagerFillElement(serviceId, rowId, user_options, inputElement);
    });

    if ( !isWorkshopInstructor() ) {
      console.log("No Instructor");
      const form = $(`form[id='${serviceId}-${rowId}-form']`);
      // double check to hide / disable the instructor elements.
      form.find(`input[data-instructor]`).prop("disabled", true);
      form.find(`div[data-instructor="show"][id$="-input-div"]`).hide();
    }
  }

  function workshopFillElement(serviceId, rowId, user_options, inputElement) {      
    const key = inputElement.attr("data-element");
    const dataGroup = inputElement.attr("data-group");
    const dataType = inputElement.attr("data-type");
    let newValue = "";
    let isInUserOptions = false;
    let availableDescription = "";
    if ( dataType == "multiplecheckbox" ) {
      const dataParent = inputElement.attr("data-parent");
      const elementList = user_options?.[dataGroup]?.[dataParent] ?? [];
      if ( elementList.includes(key) ) {
        newValue = true;
      } else {
        newValue = false;
      }
    } else if ( ["none", "default"].includes(dataGroup) ) {
      newValue = user_options?.[key] ?? "";
    } else {
      newValue = user_options?.[dataGroup]?.[key] ?? "";
    }

    if ( Array.isArray(newValue) ) {
      newValue = user_options?.default_values?.key ?? newValue[0];
    }

    if ( newValue ) {
      isInUserOptions = true;        
      if ( dataType == "select" ) {
        if (inputElement.find(`option[value="${newValue}"]`).length > 0) {
          inputElement.val(newValue);
          $(`[id^='${serviceId}-${rowId}-'][id$='-input']`).trigger(`trigger_${key}`);
        } else {
          if ( inputElement.attr("data-element") === "system" && globalMaintenanceSystems.includes(newValue) ) {
            availableDescription = `${key} ${newValue} is currently in maintenace. See footer for more information.`;
          } else {
            availableDescription = `${key} ${newValue} not available for the current options.`;
          }
          console.log(`${key} ${newValue} currently not available`);
        }
      } else if ( dataType == "number" ) {
        const minAttr = inputElement.attr("min");
        const maxAttr = inputElement.attr("max");
        const min = minAttr !== undefined ? Number(minAttr) : undefined;
        const max = maxAttr !== undefined ? Number(maxAttr) : undefined;
        const numericValue = Number(newValue);
        if (
            !isNaN(numericValue) &&
            (min === undefined || newValue >= min) &&
            (max === undefined || newValue <= max)
        ) {
          inputElement.val(newValue);
          $(`[id^='${serviceId}-${rowId}-'][id$='-input']`).trigger(`trigger_${key}`);
        } else {
          availableDescription = `${key} ${newValue} is not in allowed range [${min}, ${max}].`;
          console.log(`${key} ${newValue} currently not available`);
          console.log(availableDescription);
        }
      } else if (dataType == "multiplecheckbox" ) {
        inputElement.prop("checked", true);
      } else if (dataType == "checkbox" ) {
        inputElement.prop("checked", true);
        $(`[id^='${serviceId}-${rowId}-'][id$='-input']`).trigger(`trigger_${key}`);
      } else {
        inputElement.val(newValue);
        $(`[id^='${serviceId}-${rowId}-'][id$='-input']`).trigger(`trigger_${key}`);
      }      
    } else if (inputElement.is("input[type='checkbox']") ) {
      isInUserOptions = true;
      inputElement.prop("checked", false);
      $(`[id^='${serviceId}-${rowId}-'][id$='-input']`).trigger(`trigger_${key}`);
    }
    if ( isInUserOptions && !availableDescription ) {
      const labelElement = $(`[id^='${serviceId}-${rowId}-'][id$='-${key}-input-cb']`);
      if ( labelElement && labelElement.length ) {
        labelElement.prop("disabled", true);
        labelElement.prop("checked", true);
        labelElement.trigger("change");
      }

      if ( ["text", "number"].includes(dataType) ) {
        inputElement.prop("disabled", true);
        inputElement.attr("data-alwaysdisabled", "true");
        inputElement.trigger("input");
      } else {
        inputElement.trigger("change");
      }
    }
    return availableDescription;
  }


  function workshopFillExistingRow(serviceId, rowId, user_options, fillingOrder) {
    const workshopOptions = getWorkshopOptions();
    const defaultValues = workshopOptions?.defaultvalues || {};
    const excludes = `:not(${fillingOrder.map(value => `[data-element='${value}']`).join(',')})`
    const unorderedElements = $(`[id^='${serviceId}-${rowId}-'][id$='-input']${excludes}`);
    let availableDescription = "";

    fillingOrder.forEach(key => {
      if ( !availableDescription ) {
        const inputElement = $(`[id^='${serviceId}-${rowId}-'][id$='-${key}-input']`);
        availableDescription = workshopFillElement(serviceId, rowId, workshopOptions, inputElement);
        const elementName = inputElement.attr("data-element");
        const dataType = inputElement.attr("data-type");
        if ( Object.keys(defaultValues).includes(elementName) ) {
          if ( ["text", "number"].includes(dataType) ) {
            inputElement.val(defaultValues[elementName]);
            inputElement.trigger("input");
          } else if ( ["select"].includes(dataType) ) {
            if (inputElement.find(`option[value="${defaultValues[elementName]}"]`).length > 0) {
              inputElement.val(defaultValues[elementName]);
              inputElement.trigger("change");
            }
          } else {
            inputElement.trigger("change");
          }
          $(`[id^='${serviceId}-${rowId}-'][id$='-input']`).trigger(`trigger_${elementName}`);
        }
      }
    });
    unorderedElements.each(function () {
      if ( !availableDescription ) {
        const inputElement = $(this);
        availableDescription = workshopFillElement(serviceId, rowId, workshopOptions, inputElement);
        const elementName = inputElement.attr("data-element");
        const dataType = inputElement.attr("data-type");
        if ( Object.keys(defaultValues).includes(elementName) ) {
          inputElement.val(defaultValues[elementName]);
          if ( ["text", "number"].includes(dataType) ) {
            inputElement.trigger("input");
          } else {
            inputElement.trigger("change");
          }
          $(`[id^='${serviceId}-${rowId}-'][id$='-input']`).trigger(`trigger_${elementName}`);
        }
      }
    });

    const spawner = getSpawner(rowId);
    const optionElement = getInputElement(serviceId, rowId, "option");
    const option = optionElement.length > 0 && optionElement[0].value;
    for ( const event of spawner.events ) {
      appendToLog(serviceId, rowId, event);
    }
    if ( !spawner.ready && spawner.active ) {
      if ( spawner.pending === "stop" ) {
        updateHeaderButtons(serviceId, rowId, "stopping");
        progressBarUpdate(serviceId, rowId, "stopping", 100);
      } else {
        homeHeaderUpdate(serviceId, rowId);
        if ( serviceId === "jupyterlab" && option === "repo2docker" ) {
          updateHeaderButtons(serviceId, rowId, "building");
          progressBarUpdate(serviceId, rowId, "building", 2);
        } else {
          updateHeaderButtons(serviceId, rowId, "starting");
          progressBarUpdate(serviceId, rowId, "starting", 10);
        }
      }
    }
  }



  function collectWorkshopOptions(serviceId, rowId) {
    const form = $(`form[id='${serviceId}-${rowId}-form']`);
    const options = {};
    form.find(`input[data-group="none"][id$='-input'], input[data-group="none"][id$='-cb-input']`).each(function () {
      const $this = $(this);
      let value = "";
      if ( !$this.prop("disabled") || $this.attr('data-group') === "none" ) {
        if ( $this.is("input[type='checkbox']") ){
          value = $this.prop('checked');
        } else {
          value = $this.val();
        }
        options[$this.attr('name')] = value;
      }
    });
    return options;
  }



  function collectSelectedOptions(serviceId, rowId, allCheckboxes=false) {
    const form = $(`form[id='${serviceId}-${rowId}-form']`);
    let ret = {};
    let secret_keys = [];
    // collect all inputs in default group
    form.find(`[id^='${serviceId}-${rowId}-'][id$='-input'][data-collect="true"]:not([data-group="none"])`).each(function () {
      let $this = $(this).first();
      let dataGroupValue = $this.attr('data-group');
      let value = "";
      let addValue = true;
      let id = $this.prop("id");
      let labelInput = $(`#${id}-cb`);
      let parent = $this.attr("data-parent");
      let name = parent || $this.attr("data-name") || $this.attr("name");
      let secret = $this.attr("data-secret");
      if ( secret == "true" ) {
        secret_keys.push(name);
      }
      if ( addValue ) {
        if ( labelInput.length > 0 && !labelInput.prop('checked') ) {
          addValue = false;
        } else {
          if ( $this.is("input[type='checkbox']") ){
            value = $this.prop('checked');
            if ( allCheckboxes && !parent ) {
              addValue = true;
            } else if ( parent && value ) {
              addValue = true;
            } else if ( value ) {
              addValue = true;
            } else {
              addValue = false;
            }
          } else {
            value = $this.val();
          }
        }
      }

      if ( addValue ) {
        if ( dataGroupValue === "default" ) {
          if ( parent ) {
            if ( !Object.keys(ret).includes(name) ) {
              ret[name] = [];
            }
            ret[name].push($this.attr("name"))
          } else {
            ret[name] = value;
          }            
        } else if ( dataGroupValue === "defaultvalues" ) {
          if (!Object.keys(ret).includes(dataGroupValue)) {
            ret[dataGroupValue] = {}
          }
          ret[dataGroupValue][name] = value;
        } else if ( dataGroupValue != "none" ) {
          if (!Object.keys(ret).includes(dataGroupValue)) {
            ret[dataGroupValue] = {}
          }
          if ( parent ) {
            if ( !Object.keys(ret[dataGroupValue]).includes(name) ) {
              ret[dataGroupValue][name] = [];
            }
            ret[dataGroupValue][name].push($this.attr("name"))
          } else {
            ret[dataGroupValue][name] = value;
          }
        }
      }
    });
    let profile = "";
    if ( Object.keys(ret).includes("option") ) profile = ret.option;
    else profile = serviceId;
    ret["profile"] = profile;
    ret["service"] = serviceId;

    if ( !Object.keys(ret).includes("name") || !ret?.name ) {
      ret["name"] = `Unnamed ${serviceId}`;
    }
    const workshopOptions = getWorkshopOptions();
    if ( !isEmptyObject(workshopOptions) ) {
      ret["workshop_id"] = workshopOptions?.workshopid;
    } else if ( !Object.keys(ret).includes("workshop_id")) {
      ret["workshop_id"] = globalUserOptions?.[serviceId]?.[rowId]?.["workshop_id"] ?? false;
    }
    if ( pageType(null) == pageType("workshopmanager") ) {
      ret["description"] = form.find(`[id$='-description-input']`).val();
      ret["expertmode"] = form.find(`[id$='-description-input']`).prop("checked");
    }
    const shareId = globalUserOptions?.[serviceId]?.[rowId]?.["share_id"] ?? false;
    if ( shareId ) {
      ret["share_id"] = shareId;
    }
    const r2dId = globalUserOptions?.[serviceId]?.[rowId]?.["r2d_id"] ?? false;
    if ( r2dId ) {
      ret["r2d_id"] = r2dId;
      ret["option"] = "repo2docker"
    }
    ret["secret_keys"] = secret_keys;

    // Do not collect reservation = None
    if ( ret.resources && ret.resources.reservation === "None") {
      delete ret.resources.reservation;
      
      // If "resources" is now empty, remove it as well
      if (Object.keys(ret.resources).length === 0) {
        delete ret.resources;
      }
    }

    console.log("Collected Options in frontend:");
    console.log(ret);
    return ret;
  }


  function isWorkshopInstructor() {
    const authState = getAuthState();
    const groups = authState?.groups ?? [];
    return groups.includes("geant:dfn.de:fz-juelich.de:jsc:jupyter:workshop_instructors");
  }

  function wmTriggerWorkshopid(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
      const $this = $(`input[id^="${serviceId}-${rowId}-"][id$="-${elementId}-input"]`);
      if ( !isFirstRow(rowId) ){
        $this.val(rowId);        
      } else {
        if ( isWorkshopInstructor() ) {
          $this.prop("disabled", false);
          $this.prop("placeholder", elementOptions?.["input"]?.["options"]?.["placeholderInstructor"] || "W");
        }
      }
  }

  function homeTriggerOption(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    let values = getServiceConfig(serviceId).options;
    const workshopValues = getWorkshopOptions();
    const isWorkshop = !isEmptyObject(workshopValues);
    if (isWorkshop) {
      let allowedSystems = workshopValues?.system || false;
      if ( allowedSystems ) {
        if ( !Array.isArray(allowedSystems) ){
          allowedSystems = [allowedSystems];
        }
        let allowedOptions = {};
        for ( const [key, valueInformation] of Object.entries(values) ) {
          allowedSystems.forEach(system => {
            const systemsPerOption = getServiceConfig(serviceId)?.options?.[key]?.allowedLists?.systems ?? [];
            if ( systemsPerOption.includes(system) && !allowedOptions.hasOwnProperty(key) ) {
              allowedOptions[key] = valueInformation;
            }
          });
        }
        values = allowedOptions;
      }
    } else {
      let allowedSystems = _getAllSystems();
      if ( !Array.isArray(allowedSystems) ){
        allowedSystems = [allowedSystems];
      }
      let allowedOptions = {};
      for ( const [key, valueInformation] of Object.entries(values) ) {
        allowedSystems.forEach(system => {
          const systemsPerOption = getServiceConfig(serviceId)?.options?.[key]?.allowedLists?.systems ?? [];
          if ( systemsPerOption.includes(system) && !allowedOptions.hasOwnProperty(key) ) {
            allowedOptions[key] = valueInformation;
          }
        });
      }
      values = allowedOptions;
    }

    const optionInput = $(`#${serviceId}-${rowId}-${tabId}-option-input`);
    let _values = Object.entries(values).map(([key, value]) => [key, value.name]);
    if ( _values.length == 0 ){
      _values = [["none", "No Option available. Please contact support"]];
    }
    fillSelect("init", optionInput, _values, {}, [], "N/A");
  }

  function wmTriggerOption(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    homeTriggerOption(trigger, serviceId, rowId, tabId, elementId, elementOptions);
  }

  function wTriggerOption(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    homeTriggerOption(trigger, serviceId, rowId, tabId, elementId, elementOptions);
  }

  function shortenRepoUrl(repotype, repourl) {
    const wwwPrefix = ["www.", ""];
    const protocols = ["https://", "http://", ""];
    let domain = "";
    let url = repourl;
    if ( repotype == "gh" ) {
      domain = "github.com";
    } else if ( repotype == "gist" ) {
      domain = "gist.github.com";
    } else if ( repotype == "gitlab" ) {
      domain = "gitlab.com";
    } else if ( repotype == "zenodo" ) {
      domain = "doi.org";
    }
    let suffix = "";
    if ( domain ) {
      protocols.forEach(protocol => {
        wwwPrefix.forEach(www => {
          suffix = `${protocol}${www}${domain}/`;
          if ( url.startsWith(suffix) ) url = url.slice(suffix.length);
        })
      });
    }
    return url;
  }



  function getRepo2DockerDirectLink(serviceId, rowId) {
    const repotype = $(`[id^='${serviceId}-${rowId}-'][id$='-repotype-input']`).val();

    let urlpath = `/v2/${repotype}`
    let repourl = $(`[id^='${serviceId}-${rowId}-'][id$='-repourl-input']`).val();

    if ( ["git", "gl", "hydroshare", "ckan"].includes(repotype) ) {
      repourl = encodeURIComponent(repourl);
    }
    repourl = shortenRepoUrl(repotype, repourl);
    urlpath = `${urlpath}/${repourl}/`;

    let reporefElement = $(`[id^='${serviceId}-${rowId}-'][id$='-reporef-input']`);

    if ( ["git", "gl", "gh", "gist"].includes(repotype) ) {
      reporef = reporefElement.val() || "HEAD";
      urlpath = `${urlpath}${reporef}`;
    }

    let queryArgs = [];
    
    const repopathElement = $(`[id^='${serviceId}-${rowId}-'][id$='-repopath-input']`);
    if ( repopathElement.attr("data-collect") == "true" ) {
      const repopathtype = $(`[id^='${serviceId}-${rowId}-'][id$='-repopathtype-input']`).val();
      if ( repopathtype == "file" ) {
        let labpath = $(`[id^='${serviceId}-${rowId}-'][id$='-repopath-input']`).val();
        labpath = encodeURIComponent(labpath);
        queryArgs.push(`labpath=${labpath}`);
      } else if ( repopathtype == "url" ) {
        let urlpath = $(`[id^='${serviceId}-${rowId}-'][id$='-repopath-input']`).val();
        urlpath = encodeURIComponent(urlpath);
        queryArgs.push(`urlpath=${urlpath}`);
      }
    }

    const system = $(`[id^='${serviceId}-${rowId}-'][id$='-system-input']`).val();
    queryArgs.push(`system=${system}`);

    const flavorElement = $(`[id^='${serviceId}-${rowId}-'][id$='-flavor-input']`);
    if ( flavorElement.attr("data-collect") == "true" ) {
      queryArgs.push(`flavor=${flavorElement.val()}`);
    }

    const localstoragepathElement = $(`[id^='${serviceId}-${rowId}-'][id$='-localstoragepath-input']`);
    if ( localstoragepathElement.attr("data-collect") == "true" ) {
      let localstoragepath = encodeURIComponent(localstoragepathElement.val());
      queryArgs.push(`localstoragepath=${localstoragepath}`);
    }

    let queryString = queryArgs.join("&");
    urlpath = window.origin + `${urlpath}?${queryString}`;
    urlpath = urlpath.replace(/([^:]\/)\/+/g, "$1");
    return urlpath;
  }


  function homeTriggerUpdateDirectLinks(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    const directUrl = getRepo2DockerDirectLink(serviceId, rowId);
    const inputElement = $(`[id^='${serviceId}-${rowId}-'][id$='-${elementId}-input']`);
    inputElement.val(directUrl);
  }

  function repoUrlChanged(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    const repoType = $(`[id^='${serviceId}-${rowId}-'][id$='-repotype-input']`);
    const repoUrl = $(`[id^='${serviceId}-${rowId}-'][id$='-${tabId}-${elementId}-input']`);
    value = shortenRepoUrl(repoType.val(), repoUrl.val());
    if ( value ) {
      repoUrl.val(value);
    }
  }

  function wTriggerUpdateRepoUrlForType(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    homeTriggerUpdateRepoUrlForType(trigger, serviceId, rowId, tabId, elementId, elementOptions);
  }

  function wmTriggerUpdateRepoUrlForType(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    homeTriggerUpdateRepoUrlForType(trigger, serviceId, rowId, tabId, elementId, elementOptions);
  }


  function homeTriggerUpdateRepoUrlForType(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    const repoUrlElement = $(`[id^='${serviceId}-${rowId}-'][id$='-${elementId}-input']`);
    const repoUrlLabelElement = getLabel(repoUrlElement);
    const repoType = $(`[id^='${serviceId}-${rowId}-'][id$='-repotype-input']`).val();

    let label = "";
    let placeholder = "";
    let regex = "";
    if ( repoType === "gh" ) {
      label = "GitHub repository name or URL";
      placeholder = "example: yuvipanda/requirements or https://github.com/yuvipanda/requirements";
      regex = "^(https?:\\/\\/github\\.com\\/)?([^\\/]+\\/[^\\/]+)\\/?$";
    } else if ( repoType === "gist" ) {
      label = "Gist ID (username/gistId) or URL";
      placeholder = "example: kreuzert/1ce821fe9ba45a636a504a32a87bb49c or https://gist.github.com/kreuzert/1ce821fe9ba45a636a504a32a87bb49c";
      regex = "^(https?:\\/\\/gist\\.github\\.com\\/)?([^\\/]+)\\/?$";
    } else if ( repoType === "git" ) {
      label = "Arbitrary git repository URL";
      placeholder = "example: http://git.example.com/repo";
    } else if (repoType === "gl") {
      label = "GitLab repository name or URL";
      placeholder = "example: https://gitlab.com/mosaik/examples/mosaik-tutorials-on-binder or mosaik/examples/mosaik-tutorials-on-binder";
      regex = "^(https?:\\/\\/gitlab\\.com\\/)?([^\\/]+\\/[^\\/]+)\\/?$";
    } else if ( repoType === "zenodo" ) {
      label = "Zenodo DOI";
      placeholder = "example: 10.5281/zenodo.3242074";
    } else if ( repoType === "figshare" ) {
      label = "FigShare DOI";
      placeholder = "example: 10.6084/m9.figshare.9782777.v1";
    } else if ( repoType === "hydroshare" ) {
      label = "Hydroshare resource id";
      placeholder = "example: 8f7c2f0341ef4180b0dbe97f59130756";
    } else if ( repoType === "dataverse" ) {
      label = "Dataverse DOI";
      placeholder = "example: 10.7910/DVN/TJCLKP";
    } else if ( repoType === "ckan" ) {
      label = "CKAN dataset URL";
      placeholder = "https://demo.ckan.org/dataset/smaple-dataset-1";
    }

    repoUrlLabelElement.contents().filter(function () {
      return this.nodeType === Node.TEXT_NODE;
    }).first().replaceWith(label);

    repoUrlElement.prop("placeholder", placeholder);
    if (regex) {
      repoUrlElement.attr("pattern", regex);
    } else {
      repoUrlElement.removeAttr("pattern");
    }
  }


  function homeTriggerSystem(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    const optionInput = $(`#${serviceId}-${rowId}-${tabId}-option-input`);
    const systemInput = $(`#${serviceId}-${rowId}-${tabId}-system-input`);

    const options = val(optionInput);

    if ( optionInput.prop("disabled") ){
      // If option is disabled -> make all systems available
      fillSelect(elementId, systemInput, _getAllSystems().map(item => [item, item]));
    } else {
      // Update available systems
      let inactiveText = "N/A"
      let displayNames = [];
      options.forEach(option => {
        if (getServiceConfig(serviceId)?.options && Object.keys(getServiceConfig(serviceId)?.options).includes(option) ) {
          displayNames.push(getServiceConfig(serviceId).options[option].name);
        }
      })
      let displayName = displayNames.join(", ");
      inactiveText = `N/A for ${displayName}`

      fillSelect(elementId, systemInput, getAvailableSystemOptions(serviceId, options), {}, getMissingSystemOptions(serviceId, rowId, options), inactiveText);
    }
  }

  function wmTriggerSystem(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    homeTriggerSystem(trigger, serviceId, rowId, tabId, elementId, elementOptions);
  }

  function wTriggerSystem(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    homeTriggerSystem(trigger, serviceId, rowId, tabId, elementId, elementOptions);
  }


  function homeTriggerProject(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    const values = getProjectOptions(serviceId, rowId);
    const inputElement = getInputElement(serviceId, rowId, "project");
    fillSelect(elementId, inputElement, values);
  }

  function wmTriggerProject(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    homeTriggerProject(trigger, serviceId, rowId, tabId, elementId, elementOptions);
  }

  function wTriggerProject(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    const workshopValues = getWorkshopOptions();
    const isWorkshop = !isEmptyObject(workshopValues);
    if (isWorkshop) {
      let values = getProjectOptions(serviceId, rowId);
      const presetValues = workshopValues?.hpc?.project || false;
      if ( presetValues ) {
        values = values.filter( ([item, _]) => presetValues.includes(item));
      }
      const inputElement = getInputElement(serviceId, rowId, "project");
      fillSelect(elementId, inputElement, values);
    }
  }

  function homeTriggerPartition(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    const [partitions, interactivePartitionsLength] = getPartitionAndInteractivePartition(serviceId, rowId);
    const inputElement = getInputElement(serviceId, rowId, "partition");
    fillSelect(elementId, inputElement, partitions, {"Login Nodes": interactivePartitionsLength, "Compute Nodes": -1});
  }
  function wmTriggerPartition(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    homeTriggerPartition(trigger, serviceId, rowId, tabId, elementId, elementOptions);
  }
  function wTriggerPartition(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    homeTriggerPartition(trigger, serviceId, rowId, tabId, elementId, elementOptions);
  }

  function toggleCollectCB(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    const labelChecked = val(getLabelCBElement(serviceId, rowId, elementId));
    const inputDiv = getInputDiv(serviceId, rowId, elementId);
    const inputElement = getInputElement(serviceId, rowId, elementId);
    if ( !inputElement.is(":visible") ) {
      inputElement.attr("data-collect", false);
    } else {
      if ( labelChecked ) {
        inputElement.attr("data-collect", true);
      } else {
        inputElement.attr("data-collect", false);
      }
    }
  }

  function enableStartButton(serviceId, rowId) {
    const summaryStartButton = $(`#${serviceId}-${rowId}-start-btn-header`);
    const startButton = $(`#${serviceId}-${rowId}-startgreen-btn`);
    if ( summaryStartButton.length > 0 ) {
      summaryStartButton.prop("disabled", false);
    }
    if ( startButton.length > 0 ) {
      startButton.prop("disabled", false);
    }
  }

  function disableStartButton(serviceId, rowId) {
    const summaryStartButton = $(`#${serviceId}-${rowId}-start-btn-header`);
    const startButton = $(`#${serviceId}-${rowId}-startgreen-btn`);
    if ( summaryStartButton.length > 0 ) {
      summaryStartButton.prop("disabled", true);
    }
    if ( startButton.length > 0 ) {
      startButton.prop("disabled", true);
    }
  }

  // When reservation selected is inactive, we disable the start button
  // If we switch the option or system, we will never trigger "reservationChanged",
  // that's why we observe data-collect of Reservation
  function homeTriggerReservationObserveCollect(element, newValue) {
    if ( newValue === "false" ) {
      const serviceId = element.attr("data-service");
      const rowId = element.attr("data-row");
      enableStartButton(serviceId, rowId);
    }
  }


  function wTriggerReservationObserveCollect(element, newValue) {
    homeTriggerReservationObserveCollect(element, newValue)
  }

  function homeTriggerReservation(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    const systemInput = getInputElement(serviceId, rowId, "system");
    const elementDiv = getInputDiv(serviceId, rowId, elementId);
    const reservationInput = getInputElement(serviceId, rowId, elementId);
    
    let reservations = getReservationOptions(serviceId, rowId);
    
    const workshopValues = getWorkshopOptions();
    const isWorkshop = !isEmptyObject(workshopValues);
    if (isWorkshop) {
      let allowedReservations = workshopValues?.reservation ?? false;
      if ( allowedReservations ) {
        if ( !Array.isArray(allowedReservations) ){
          allowedReservations = [allowedReservations];
        }
        let forcedreservations = [];
        const currentSystem = val(getInputElement(serviceId, rowId, "system"));
        if ( currentSystem.length === 1 && currentSystem[0] && unicoreReservations.hasOwnProperty(currentSystem[0]) ) {
          allowedReservations.forEach(singleWorkshopReservation => {
            let singleWorkshopToAdd = unicoreReservations[currentSystem[0]].filter(item => item.ReservationName == singleWorkshopReservation);
            if ( singleWorkshopToAdd.length === 1 ) {
              forcedreservations.push(singleWorkshopToAdd[0]);
            }
          });
        }
        reservations = forcedreservations;
        reservationInput.attr("data-collect", true);
      }
    }
    if ( !systemInput.prop("disabled") ) {
      
      activeReservationNames = reservations
        .filter(item => item.State === "ACTIVE")
        .map(item => [item.ReservationName, item.ReservationName]);
      inactiveReservationNames = reservations
        .filter(item => item.State === "INACTIVE")
        .map(item => [item.ReservationName, item.ReservationName]);

      let groups = {}
      const reservationsWorkshop = workshopValues?.resources?.reservation || ["None"];
      let allReservationsSorted = [];
      if (isWorkshop && !reservationsWorkshop.includes("None")) {
        allReservationsSorted = [
          ...activeReservationNames,
          ...inactiveReservationNames
        ];
        groups["No reservation"] = 0;
      } else {
        allReservationsSorted = [
          ["None", "None"],
          ...activeReservationNames,
          ...inactiveReservationNames
        ];
        groups["No reservation"] = 1;
      }
      
      if ( activeReservationNames.length > 0 ) {
        groups["Active"] = activeReservationNames.length;
      }
      if ( inactiveReservationNames.length > 0 ) {
        groups["Inactive"] = inactiveReservationNames.length;
      }          
      fillSelect(elementId, reservationInput, allReservationsSorted, groups);
      const reservation = reservationInput.val();
      inactiveReservationNames.filter( item => item[0] === reservation ).length > 0 ? disableStartButton(serviceId, rowId) : enableStartButton(serviceId, rowId);
    } else {
      $(`div[id^='${serviceId}-${rowId}-'][id$='-reservationinfo-input-div']`).hide();        
    }
  }



  function wmTriggerReservation(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    homeTriggerReservation(trigger, serviceId, rowId, tabId, elementId, elementOptions);
  }

  function wTriggerReservation(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    homeTriggerReservation(trigger, serviceId, rowId, tabId, elementId, elementOptions);
  }


  function wmTriggerDefaultValue(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    const dependentElement = elementOptions?.input?.options?.parent || "";
    if ( !dependentElement ) {
      console.log(`Custom Config not configured correctly for ${elementId}. Add "parent" to elementOptions.`);
    }

    const selectedParentValues = $(`select[id^='${serviceId}-${rowId}-'][id$='-${dependentElement}-input']`).val();
    const parentLabelCB = $(`input[id^='${serviceId}-${rowId}-'][id$='-${dependentElement}-input-cb']`);
    const inputParentElement = $(`select[id^='${serviceId}-${rowId}-'][id$='-${dependentElement}-input']`);

    const inputElement = $(`select[id^='${serviceId}-${rowId}-'][id$='-${elementId}-input']`);
    const labelCB = $(`input[id^='${serviceId}-${rowId}-'][id$='-${elementId}-input-cb']`);
    const inputDiv = $(`div[id^='${serviceId}-${rowId}-'][id$='-${elementId}-input-div']`);

    if ( parentLabelCB.prop("checked") && inputParentElement.attr("data-collect") && selectedParentValues.length > 1 ) {
      fillSelect(elementId, inputElement, selectedParentValues.map(item => [item, item]));
      inputDiv.show();
      if ( labelCB.prop("checked") && inputParentElement.attr("data-collect") === "true") {
        inputElement.attr("data-collect", true);
      } else {
        inputElement.attr("data-collect", false);
      }
    } else {
      inputDiv.hide();
      inputElement.attr("data-collect", false);
    }
  }


  function homeTriggerReservationInfo(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    const reservation_values = val(getInputElement(serviceId, rowId, "reservation"));
    let reservation = "None";
    if ( reservation_values.length > 0 ){
      reservation = reservation_values[0];
    }
    const reservationInfoDiv = $(`[id^='${serviceId}-${rowId}-'][id$='-reservationinfo-input-div']`);
    if ( !reservation || reservation === "None" ) {
      reservationInfoDiv.hide();
    } else {
      const currentSystem = val(getInputElement(serviceId, rowId, "system"));
      if ( currentSystem.length === 1 && currentSystem[0] && unicoreReservations.hasOwnProperty(currentSystem[0])) {
        const reservations = unicoreReservations[currentSystem[0]].filter(item => item.ReservationName == reservation);
        for (const reservationInfo of reservations) {
          if (reservationInfo.ReservationName == reservation) {
            reservationInfoDiv.find(`span[id$="-start"]`).html(`${reservationInfo.StartTime} (Europe/Berlin)`);
            reservationInfoDiv.find(`span[id$="-end"]`).html(`${reservationInfo.EndTime} (Europe/Berlin)`);
            reservationInfoDiv.find(`span[id$="-state"]`).html(reservationInfo.State);
            reservationInfoDiv.find(`pre[id$="-details"]`).html(JSON.stringify(reservationInfo, null, 2));
            if ( reservationInfo.State == "INACTIVE" ) {
              reservationInfoDiv.find(`span[id$="-state"]`).css("color", "red");
            } else {
              reservationInfoDiv.find(`span[id$="-state"]`).css("color", "green");
            }
          }
        }
        reservationInfoDiv.show();
      } else {
        reservationInfoDiv.hide();
      }
    }
  }


  function wTriggerReservationInfo(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    homeTriggerReservationInfo(trigger, serviceId, rowId, tabId, elementId, elementOptions);
  }

  function homeTriggerResources(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    const systems = getUnicoreValues(serviceId, rowId, "system");
    const partitions = getUnicoreValues(serviceId, rowId, "partition");
    let _partitions = [];

    const labelOptions = elementOptions.label ?? {};

    const inputDiv = getInputDiv(serviceId, rowId, elementId);
    const inputElement = getInputElement(serviceId, rowId, elementId);      
    const labelElement = getLabel(inputElement);
    const labelElementCBValue = val(getLabelCBElement(serviceId, rowId, elementId));
    const invalidFeedback = getInvalidFeedback(inputDiv);

    let minmaxavail = false;
    let min = -1;
    let max = -1;
    let label = (labelOptions.value === undefined || labelOptions.value === null) ? "No Label" : labelOptions.value;
    let show = false;
    let defaultValue = 1;
    let collectInformation = true;

    if ( collectInformation ){
      systems.forEach(system => {
        if (partitions.length === 1 && partitions[0] === "_all_") {
          _partitions = Object.keys(resourcesConfig[system] ?? {});
        } else {
          _partitions = partitions;
        }
        _partitions.forEach(partition => {
          const elementOptions = resourcesConfig[system]?.[partition]?.[elementId] ?? {};
          if (Object.keys(elementOptions).length !== 0 ) {
            show = true;
            const minmax = elementOptions.minmax || false;
            defaultValue = (elementOptions["default"] === undefined || elementOptions["default"] === null) ? defaultValue : elementOptions["default"];                
            if ( minmax ) {
              if ( !minmaxavail ) {
                minmaxavail = true;
                min = minmax[0];
                max = minmax[1];
              } else {
                if ( minmax[0] < min ){
                  min = minmax[0];
                }
                if ( minmax[1] > max ){
                  max = minmax[1];
                }
              }
            }
          }
        });
      });
    }
    if ( show ) {
      if ( !collectInformation ) {
        label = `${label} [${defaultValue}]`;
        invalidFeedback.html(`Value ${defaultValue} was chosen by workshop instructor.`)
        inputElement.attr("min", min);
        inputElement.attr("max", max);
      } else if ( minmaxavail ){
        label = `${label} [${min}, ${max}]`;
        invalidFeedback.html(`Please choose a number between ${min} and ${max}.`);
        inputElement.attr("min", min);
        inputElement.attr("max", max);
      } else {
        invalidFeedback.html("Please choose a valid number.");
        inputElement.removeAttr("min");
        inputElement.removeAttr("max");
      }
      if ( inputElement.attr("data-alwaysdisabled") != "true" ) {
        inputElement.attr("value", defaultValue);
      }

      labelElement.contents().filter(function () {
        return this.nodeType === Node.TEXT_NODE;
      }).first().replaceWith(label);

      // Checkbox logic
      const checkBoxElement = labelElement.find("input[type='checkbox']");
      if ( checkBoxElement.length !== 0 ) {
        const checkBoxDefault = labelOptions?.options?.default ?? false;
        checkBoxElement.prop("checked", checkBoxDefault);
        inputElement.prop("disabled", !checkBoxDefault);
      } else {
        if ( inputElement.attr("data-alwaysdisabled") != "true" ) {
          inputElement.prop("disabled", false);
        }
      }
      inputDiv.show();
      if ( labelElementCBValue !== undefined ) {
        inputElement.attr("data-collect", labelElementCBValue);
      } else {
        inputElement.attr("data-collect", true);
      }
    } else {
      inputDiv.hide();
      inputElement.attr("data-collect", false);
    }
  }

  function wmTriggerResources(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    homeTriggerResources(trigger, serviceId, rowId, tabId, elementId, elementOptions);
  }
  function wTriggerResources(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    homeTriggerResources(trigger, serviceId, rowId, tabId, elementId, elementOptions);
  }

  function homeTriggerFlavor(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    const systems = val(getInputElement(serviceId, rowId, "system"));

    if ( systems.some(item => kubeFlavorSystems.includes(item)) ) {
      let availableFlavors = getAvailableKubeFlavorsS(systems);
      let unavailableFlavors = getUnavailableKubeFlavorsS(systems);
      if ( availableFlavors.length == 0 ) {
        availableFlavors = [["_undefined", "Couldn't receive flavors. Please re-login to use this system"]];
      }

      const selectInput = getInputElement(serviceId, rowId, "flavor");
      fillSelect(elementId, selectInput, availableFlavors, {}, unavailableFlavors, "maximum reached");
    }
  }

  function wmTriggerFlavor(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    homeTriggerFlavor(trigger, serviceId, rowId, tabId, elementId, elementOptions);
  }

  function wTriggerFlavor(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    homeTriggerFlavor(trigger, serviceId, rowId, tabId, elementId, elementOptions);
  }

  function setFlavorInfo(serviceId, rowId, system, flavors={}) {
    const inputDiv = $(`div[id^='${serviceId}-${rowId}-'][id$='-flavorinfo-input-div']`);
    inputDiv.empty();
    if ( system ) {
      let allFlavors = flavors;
      if ( allFlavors != undefined ) {
        allFlavors = kubeOutpostFlavors[system];
      }
      if ( allFlavors ){
        for (const [_, description] of Object.entries(allFlavors)
          .filter(([key, value]) => value.max != 0)
          .sort(([, a], [, b]) => {
            const weightA = a["weight"] || 99;
            const weightB = b["weight"] || 99;
            return weightA > weightB ? -1 : 1;
          })) {
          var current = description.current || 0;
          var maxAllowed = description.max;
          // Flavor not valid, so skip
          if (maxAllowed == 0 || current < 0 || maxAllowed == null || current == null) continue;

          var bgColor = "bg-primary";
          // Infinite allowed
          if (maxAllowed == -1) {
            var progressTooltip = `${current} used`;
            var maxAllowedLabel = '∞';
            if (current == 0) {
              var currentWidth = 0;
              var maxAllowedWidth = 100;
            }
            else {
              var currentWidth = 20;
              var maxAllowedWidth = 80;
            }
          }
          else {
            var progressTooltip = `${current} out of ${maxAllowed} used`;
            var maxAllowedLabel = maxAllowed - current;
            var currentWidth = current / maxAllowed * 100;
            var maxAllowedWidth = maxAllowedLabel / maxAllowed * 100;

            if (maxAllowedLabel < 0) {
              maxAllowedLabel = 0;
              maxAllowedWidth = 0;
              bgColor = "bg-danger";
            }
          }

          var diagramHtml = `
            <div class="row align-items-center g-0 mt-4">
              <div class="col-4">
                <span>${description.display_name}</span>
                <a class="lh-1 ms-3" style="padding-top: 1px;" 
                  data-bs-toggle="tooltip" data-bs-placement="right" title="${description.description}">
                  ${getSvg("info")}
                </a>
              </div>
              <div class="progress col ms-2 fw-bold" style="height: 20px;"
                data-bs-toggle="tooltip" data-bs-placement="top" title="${progressTooltip}">
                <div class="progress-bar ${bgColor}" role="progressbar" style="width: ${currentWidth}%">${current}</div>
                <div class="progress-bar bg-success" role="progressbar" style="width: ${maxAllowedWidth}%">${maxAllowedLabel}</div>
              </div>
            </div>
          `
          inputDiv.append(diagramHtml);
        }
      }
    }
  }

  function homeTriggerFlavorInfo(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    const systems = val(getInputElement(serviceId, rowId, "system"));

    if ( systems.some(item => kubeFlavorSystems.includes(item)) && systems.length == 1 ){
      setFlavorInfo(serviceId, rowId, systems[0]);
      // $(`[id^='${serviceId}-${rowId}-'][id$='-flavorinfo-info-div']`).show();
    }
  }

  function wTriggerFlavorInfo(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    homeTriggerFlavorInfo(trigger, serviceId, rowId, tabId, elementId, elementOptions);
  }

  function wmTriggerModules(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    const optiontypes = getOptionTypes(serviceId, rowId);
    if ( optiontypes.includes("lmod") ) {
      const values = getModuleValues(serviceId, rowId, elementId, elementOptions.input.options.setName);
      const elementSelect = $(`select[id^='${serviceId}-${rowId}-'][id$='-${elementId}-input']`);
      fillSelect(elementId, elementSelect, values);
      const activeValues = values.filter(item => item[2]).map(item => item[0]);
      elementSelect.val(activeValues).trigger("change");
    }
  }


  function homeTriggerRepoPathType(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    const repoPathChecked = val(getLabelCBElement(serviceId, rowId, "repopath"));

    const repoPathTypeDiv = getInputDiv(serviceId, rowId, "repopathtype");
    const repoPathTypeInput = getInputElement(serviceId, rowId, "repopathtype");
    if ( !repoPathChecked ) {
      repoPathTypeDiv.hide();
    } else {
      repoPathTypeDiv.show();
    }
  }

  function wmTriggerRepoPathType(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    const repoPathChecked = val(getLabelCBElement(serviceId, rowId, "repopath"));

    const repoPathTypeDiv = getInputDiv(serviceId, rowId, "repopathtype");
    const repoPathTypeInput = getInputElement(serviceId, rowId, "repopathtype");
    const repoPathTypeLabel = getLabelCBElement(serviceId, rowId, "repopathtype");
    if ( !repoPathChecked ) {
      repoPathTypeInput.prop("disabled", true);
      repoPathTypeLabel.prop("checked", false);
      repoPathTypeLabel.prop("disabled", true);
      repoPathTypeDiv.hide();
    } else {
      repoPathTypeDiv.show();
      repoPathTypeLabel.prop("disabled", false);
      const repoPathTypeChecked = repoPathTypeLabel.prop("checked");
      repoPathTypeInput.prop("disabled", !repoPathTypeChecked);
    }
  }

  function homeTriggerRTCChanged(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    const rtcCheckboxElement = getInputElement(serviceId, rowId, elementId);
    const rtcBtn = $(`#${serviceId}-${rowId}-rtc-btn`);
    if ( rtcCheckboxElement.attr('data-collect') === "true" ) {
      const checked = rtcCheckboxElement.length > 0 && rtcCheckboxElement[0].checked
      if ( checked ) {
        rtcBtn.removeClass('d-none');
      } else {
        rtcBtn.addClass('d-none');
      }
    }
  }


  function homeTriggerSystemChanged(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    const inputElement = getInputElement(serviceId, rowId, elementId);
    const optionElement = getInputElement(serviceId, rowId, "option");
    const shareBtn = $(`#${serviceId}-${rowId}-share-btn`);
    const rtcBtn = $(`#${serviceId}-${rowId}-rtc-btn`);
    const system = inputElement.length > 0 && inputElement[0].value;
    const option = optionElement.length > 0 && optionElement[0].value;
    const share_system_list = elementOptions?.input?.share_system_list || [];
    const rtc_system_list = elementOptions?.input?.rtc_system_list || [];
    const rtc_option_list = elementOptions?.input?.rtc_option_list || [];
    if ( rtc_system_list.includes(system) && rowId != "__new__" && rtc_option_list.includes(option) ) {
      rtcBtn.removeClass('d-none');
    } else {
      const rtcCheckboxElement = getInputElement(serviceId, rowId, "rtc");
      const checked = rtcCheckboxElement.length > 0 && rtcCheckboxElement[0].checked && rtcCheckboxElement[0].attr('data-collect') === "true";
      if ( checked ) {
        rtcBtn.removeClass('d-none');
      } else {
        rtcBtn.addClass('d-none');
      }
    }
    if ( share_system_list.includes(system) ) {
      shareBtn.removeClass('d-none');
    } else {
      shareBtn.addClass('d-none');
    }
  }

  function homeTriggerRepoTypeChanged(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    // not needed right now 
  }

  function wmTriggerExpertMode(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    const optionInput = $(`[id^="${serviceId}-${rowId}-"][id$="-option-input"]`);
    const systemInput = $(`[id^="${serviceId}-${rowId}-"][id$="-system-input"]`);

    if ( val(getInputElement(serviceId, rowId, elementId)) ){
      // if checked: set systems + options to multiple
      [optionInput, systemInput].forEach(input => {
        input.prop("size", 4);
        input.prop("multiple", true);
        input.trigger("change");
        const key = input.attr("data-element");
        $(`[id^="${serviceId}-${rowId}-"][id$="-input"]`).trigger(`trigger_${key}`);
      })
    } else {
      [optionInput, systemInput].forEach(input => {
        input.prop("size", 1);
        input.prop("multiple", false);
        input.trigger("change");
        const key = input.attr("data-element");
        $(`[id^="${serviceId}-${rowId}-"][id$="-input"]`).trigger(`trigger_${key}`);
      })
    }
  }

  function showToast(message, type = "danger") {
    const toast = $(`
      <div class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" style="opacity: 0.9 !important" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
              ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `);
    $("#toastContainer").append(toast);
    const bsToast = new bootstrap.Toast(toast[0]);
    bsToast.show();
  }

  function getAPIOptions() {
    return {
      dataType: null,
      tryCount: 5,
      error: function (jqXHR, textStatus, errorThrown) {
        if (jqXHR.status == 503) {
            this.tryCount--;
            if (this.tryCount >= 0) {
              $.ajax(this);
              return;
            }
            showToast("Request to Server failed. Try refreshing website");
            console.error("API Request failed:", textStatus, errorThrown);
            return;
          }
          if (jqXHR.status == 403) {
            showToast("Request to Server failed. Try refreshing website");
            return;
          }
          showToast("Request to Server failed. Try refreshing website");
          console.error("API Request failed:", textStatus, errorThrown);
        }
    }
  }


  function getWorkshopManagerAPIUrl(serviceId, rowId, utils, base_url) {
    if ( isFirstRow(rowId) ) {
      const workshopId = $(`input[id^='${serviceId}-${rowId}-'][id$='-workshopid-input']`).val();
      if ( workshopId ) {
        return utils.url_path_join("workshops", workshopId);
      } else {
        return "workshops";
      }
    } else {
      return utils.url_path_join("workshops", rowId);
    }
  }


  function homeHeaderUpdate(serviceId, rowId) {
    var elementsCount = 2;
    const optionElement = $(`[id^='${serviceId}-${rowId}-'][id$='-option-input']`);
    const option = optionElement.val();
    var optionText = option;
    optionElement.find("option").each(function() {
      if ( $(this).val() === option ) {
        optionText = $(this).text();
      }
    });

    const systemElement = $(`[id^='${serviceId}-${rowId}-'][id$='-system-input']`);
    const system = systemElement.val();
    var systemText = system;
    systemElement.find("option").each(function() {
      if ( $(this).val() === system ) {
        systemText = $(this).text();
      }
    });
    const project = $(`[id^='${serviceId}-${rowId}-'][id$='-project-input']`);
    const partition = $(`[id^='${serviceId}-${rowId}-'][id$='-partition-input']`);

    $(`#${serviceId}-${rowId}-config-td-option`).html(`${optionText}`);
    $(`#${serviceId}-${rowId}-config-td-system`).html(`${systemText}`);

    const nameThElement = $(`#${serviceId}-${rowId}-summary-tr th.name-td`);
    const name = $(`[id^='${serviceId}-${rowId}-'][id$='-name-input']`).val();
    nameThElement.html(name);

    const optionDiv = $(`#${serviceId}-${rowId}-config-td-option-div`);
    const systemDiv = $(`#${serviceId}-${rowId}-config-td-system-div`);
    const projectDiv = $(`#${serviceId}-${rowId}-config-td-project-div`);
    const partitionDiv = $(`#${serviceId}-${rowId}-config-td-partition-div`);

    if ( project.attr("data-collect") === "true" ) {
      projectDiv.show();
      elementsCount += 1;
      $(`#${serviceId}-${rowId}-config-td-project`).html(`${project.val()}`);
    } else {
      projectDiv.hide();
    }

    if ( partition.attr("data-collect") === "true" ) {
      partitionDiv.show();
      elementsCount += 1;
      $(`#${serviceId}-${rowId}-config-td-partition`).html(`${partition.val()}`);
    } else {
      partitionDiv.hide();
    }
    
    const repotypeShort = $(`[id^='${serviceId}-${rowId}-'][id$='-repotype-input']`);
    const repoTypeMapping = {
      "gh": "GitHub",
      "git": "Git repository",
      "gl": "GitLab",
      "gist": "GitHub Gist",
      "zenodo": "Zenodo DOI",
      "figshare": "FigShare DOI",
      "hydroshare": "Hydroshare resource",
      "dataverse": "Dataverse DOI",
      "ckan": "CKAN dataset"
    }
    const repotype = repoTypeMapping?.[repotypeShort.val()] || repotypeShort.val();
    const repotypeDiv = $(`#${serviceId}-${rowId}-config-td-repotype-div`);

    const repourl = $(`[id^='${serviceId}-${rowId}-'][id$='-repourl-input']`);
    const repourlDiv = $(`#${serviceId}-${rowId}-config-td-repourl-div`);

    if ( repotypeShort.attr("data-collect") === "true" ) {
      repotypeDiv.show();
      elementsCount += 1;
      $(`#${serviceId}-${rowId}-config-td-repotype`).html(`${repotype}`);
    } else {
      repotypeDiv.hide();
    }

    if ( repourl.attr("data-collect") === "true" ) {
      repourlDiv.show();
      elementsCount += 1;
      const repourlVal = repourl.val().split("/").filter(Boolean).pop();
      $(`#${serviceId}-${rowId}-config-td-repourl`).html(`${repourlVal}`);
    } else {
      repourlDiv.hide();
    }

    if ( elementsCount == 2 ) {
        optionDiv.removeClass("col-lg-3");
        systemDiv.removeClass("col-lg-3");
        optionDiv.addClass("col-lg-6");
        systemDiv.addClass("col-lg-6");
    } else {
        optionDiv.removeClass("col-lg-6");
        systemDiv.removeClass("col-lg-6");
        optionDiv.addClass("col-lg-3");
        systemDiv.addClass("col-lg-3");
    }
  }

  function homeTriggerButtonSave(serviceId, rowId, buttonId, button_options, user, api, base_url, utils, show_modal=false) {
    const options = getAPIOptions();
    const form = $(`form[id^='${serviceId}-${rowId}-form']`);
    const valid = validateForm(serviceId, rowId);
    if ( !valid ) {
      console.log(`Invalid Form for ${serviceId}-${rowId}`);
      return;
    }
    let userOptions = collectSelectedOptions(serviceId, rowId, allCheckboxes=true);

    options["data"] = JSON.stringify({
      ...userOptions,
    });

    options["success"] = function () {
      if ( !Object.keys(globalUserOptions).includes(serviceId) ){
        globalUserOptions[serviceId] = {};
      }
      globalUserOptions[serviceId][rowId] = userOptions;
      homeHeaderUpdate(serviceId, rowId);
    }
    api.update_named_server(user, rowId, options);
  }

  function homeTriggerButtonReset(serviceId, rowId, buttonId, button_options, user, api, base_url, utils) {
    const uO = globalUserOptions?.[serviceId]?.[rowId];
    const fO = globalFillingOrder?.[serviceId];
    homeFillExistingRow(serviceId, rowId, uO, fO);
    homeHeaderUpdate(serviceId, rowId);
  }



  function wTriggerButtonReset(serviceId, rowId, buttonId, button_options, user, api, base_url, utils) {
    const uO = globalUserOptions?.[serviceId]?.[rowId];
    const fillingOrder = button_options?.options?.fillingOrder || [];
    workshopFillExistingRow(serviceId, rowId, uO, fillingOrder);
    homeHeaderUpdate(serviceId, rowId);
  }

  function wmNewSave(serviceId, rowId, buttonId, button_options, user, api, base_url, utils, show_modal=false) {
    const options = getAPIOptions();
    const form = $(`form[id^='${serviceId}-${rowId}-form']`);
    const valid = validateForm(serviceId, rowId);
    if ( !valid ) {
      console.log(`Invalid Form for ${serviceId}-${rowId}`);
      return;
    }
    let userOptions = collectSelectedOptions(serviceId, rowId, allCheckboxes=true);
    let workshopData = collectWorkshopOptions(serviceId, rowId);

    options["data"] = JSON.stringify({
      ...userOptions,
      ...workshopData
    });
    options["success"] = function (resp) {
      if ( show_modal ) {
        let url = new URL(utils.url_path_join(window.origin, "workshops", resp).replace("//", "/"));
        $('#rowid-reload').val(resp);
        showModal(serviceId, rowId, url, "Share Workshop", "Share your workshop via URL", url);
      }
    };
    options["type"] = "POST";

    api.api_request(
      getWorkshopManagerAPIUrl(serviceId, rowId, utils, base_url),
      options
    );
  }



  function wmSummaryButtonNew(serviceId, rowId, buttonId, button_options, user, api, base_url, utils) {
    wmNewSave(serviceId, rowId, buttonId, button_options, user, api, base_url, utils, true);
  }

  function wmTriggerButtonReset(serviceId, rowId, buttonId, button_options, user, api, base_url, utils) {
    const options = getAPIOptions();
    options["type"] = "GET";
    const fillingOrder = button_options?.options?.fillingOrder || [];
    options["success"] = function (resp) {
      workshopManagerFillExistingRow(serviceId, rowId, resp.user_options, fillingOrder);
    }
    api.api_request(
      getWorkshopManagerAPIUrl(serviceId, rowId, utils, base_url),
      options
    );
  }

  function homeTriggerButtonRTC(serviceId, rowId, buttonId, button_options, user, api, base_url, utils) {
    const options = getAPIOptions();
    options["success"] = function (resp) {
      const url = new URL(utils.url_path_join(window.origin, resp.accept_url).replace("//", "/"));
      const description = 'Access URL to your Server.<br><span style="color: red">Users with this link have full access to your JupyterLab!</span><br>Click copy and send this invitation to your colleagues.<br>See the RTC <a target="_blank" href="https://jupyterlab-realtime-collaboration.readthedocs.io">documentation</a> for more details.<br>Stopping your server will revoke all RTC shares.'
      showModal(serviceId, rowId, url, `Real-Time Collaboration`, description, `RTC Invitation Link ( expires at ${resp.expires_at} )`);
    }
    api.rtc_named_server_create(user, rowId, options);
  }

  function homeTriggerButtonShare(serviceId, rowId, buttonId, button_options, user, api, base_url, utils) {
    // Send POST Request to the Backend, if successful -> show modal
    // let url = new URL(utils.url_path_join(window.origin, "share", resp).replace("//", "/"));
    // let url = new URL(utils.url_path_join(window.origin, "share", "user_options").replace("//", "/"));

    const name = $(`[id^='${serviceId}-${rowId}-'][id$='-name-input']`).val();
    const options = getAPIOptions();
    const userOptions = collectSelectedOptions(serviceId, rowId);
    if ( Object.keys(userOptions).includes("share_id") ) {
      delete userOptions["share_id"];
    }
    options["data"] = JSON.stringify(userOptions);
    options["type"] = "POST";
    options["success"] = function (resp) {
      let shareUrl = new URL(utils.url_path_join(window.origin, "share", resp).replace("//", "/"));
      showModal(serviceId, rowId, shareUrl, `Share Configuration ${name}`, "Share your configuration via URL", shareUrl);
    };
    const url = utils.url_path_join("share", "user_options");
    api.api_request(
      url,
      options
    );
  }

  function wmTriggerButtonShare(serviceId, rowId, buttonId, button_options, user, api, base_url, utils) {
    let url = new URL(utils.url_path_join(window.origin, "workshops", rowId).replace("//", "/"));
    showModal(serviceId, rowId, url, "Share Workshop", "Share your workshop via URL", url);
  }

  function wmTriggerButtonDelete(serviceId, rowId, buttonId, button_options, user, api, base_url, utils) {
    const options = getAPIOptions();
    options["type"] = "DELETE";
    options["success"] = function () {
      $(`tr[data-server-id=${serviceId}-${rowId}]`).each(function () {
        $(this).remove();
      });
    };
    api.api_request(
      getWorkshopManagerAPIUrl(serviceId, rowId, utils, base_url),
      options
    );
  }

  function updateHeaderButtons(serviceId, rowId, status) {
    // status: ["running", "starting", "na", "stopping", "cancelling", "stopped", "waiting"]
    const summaryTr = $(`#${serviceId}-${rowId}-summary-tr`);
    if ( summaryTr.attr("data-spawner-na") == "true" ) {
      status = "na";
    }
    let toShow = [];
    let toDisable = [];
    if ( status == "running" ) {
      toShow = ["open", "stop"];
    } else if ( status == "waiting" ) {
      toShow = ["open", "stop"];
      toDisable = ["open"];
    } else if ( status == "starting" ) {
      toShow = ["cancel"];
    } else if ( status == "na" ) {
      toShow = ["na", "del"];
      toDisable = ["na"];
    } else if ( status == "stopping" ) {
      toShow = ["cancel"];
      toDisable = ["cancel"];
    } else if ( status == "cancelling" ) {
      toShow = ["cancel"];
      toDisable = ["cancel"];
    } else if ( status == "stopped" ) {
      toShow = ["start"];
      toDisable = [];
    } else if ( status == "building" ) {
      toShow = ["start"];
      toDisable = ["start"];
    } else if ( status == "disable" ) {
      toDisable = ["open", "stop", "cancel", "start", "del"];
    }
    const baseSelector = `button[id^="${serviceId}-${rowId}"][id$="-btn-header"]`;

    if ( summaryTr.attr("data-spawner-type") == "workshop" && pageType() == pageType("home") ) {
      toShow.push("manage");
      toShow.push("del");
    }
    
    // Enable buttons
    const toDisableExcludeSelector = toDisable
      .map(item => `:not([id$="-${item}-btn-header"])`)
      .join("");
    $(`${baseSelector}${toDisableExcludeSelector}`).prop("disabled", false);

    // Disable buttons
    toDisable.forEach(item => {
      $(`button[id^="${serviceId}-${rowId}"][id$="-${item}-btn-header"]`).prop("disabled", true);
    });

    if ( status != "disable" ) {
      // Hide buttons
      const toShowExcludeSelector = toShow
        .map(item => `:not([id$="-${item}-btn-header"])`)
        .join("");
      $(`${baseSelector}${toShowExcludeSelector}:not([data-show-always="true"])`).hide();

      // Show buttons
      toShow.forEach(item => {
        $(`button[id^="${serviceId}-${rowId}"][id$="-${item}-btn-header"]`).show();
      });
    }
  }

  function getCurrentTimestamp() {
      const now = new Date();

      const berlinTime = new Date(
          now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' })
      );

      const year = berlinTime.getFullYear();
      const month = String(berlinTime.getMonth() + 1).padStart(2, '0');
      const day = String(berlinTime.getDate()).padStart(2, '0');
      const hours = String(berlinTime.getHours()).padStart(2, '0');
      const minutes = String(berlinTime.getMinutes()).padStart(2, '0');
      const seconds = String(berlinTime.getSeconds()).padStart(2, '0');
      const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  function getStopEvent(buttonId) {
    const event = {
      "progress": 100,
      "failed": true,
      "ready": false,
      "html_message": `<details><summary>${getCurrentTimestamp()}: Start cancelled by user.</summary>${buttonId} button was triggered.</details>`
    }
    return event;
  }


  function homeSummaryButtonManage(serviceId, rowId, buttonId, button_options, user, api, base_url, utils) {
    const workshopId = globalUserOptions[serviceId][rowId].workshop_id;
    let url = new URL(utils.url_path_join(window.origin, "workshops", workshopId).replace("//", "/"));
    window.open(url, "_blank");
  }

  function homeSummaryButtonStop(serviceId, rowId, buttonId, button_options, user, api, base_url, utils) {
    const options = getAPIOptions();
    updateHeaderButtons(serviceId, rowId, "stopping");
    progressBarUpdate(serviceId, rowId, "stopping", 100);
    api.stop_named_server(user, rowId, options);
  }

  function homeSummaryButtonCancel(serviceId, rowId, buttonId, button_options, user, api, base_url, utils) {
    const options = getAPIOptions();
    updateHeaderButtons(serviceId, rowId, "cancelling");
    progressBarUpdate(serviceId, rowId, "cancelling", 99);
    api.cancel_named_server(user, rowId, options);
  }

  async function checkAndOpenUrl(serviceId, rowId, url, api=false, retries = 50, delay = 500) {
    // wait for 3 successful responses
    let failed = false;
    let successCounter = 0;
    let _url = api ? `${url}/api` : url;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(_url, {
          method: 'GET',
          mode: 'no-cors',
          redirect: 'follow',
          credentials: 'include',
        });
        if (response.ok || response.status == 405) {
          successCounter += 1;
          if ( successCounter > 8 ) {
            if ( pageType(null) == pageType("start") || pageType(null) == pageType("spawn") ) {
              await new Promise(resolve => setTimeout(resolve, 10*delay));
              window.location.href = _url;
            }
            updateHeaderButtons(serviceId, rowId, "running");
            progressBarUpdate(serviceId, rowId, "running", 100);
            $(`button[id^='${serviceId}-${rowId}-'][id$='-btn']`).prop("disabled", false);
            return;
          }
        } else if ( response.status == 424 ) {
          failed = true;
          $(`button[id^='${serviceId}-${rowId}-'][id$='-btn']`).prop("disabled", false);
          return;
        }
      } catch (error) {
        console.error(`Attempt ${attempt}: Network error or invalid URL -`, error);
      }
      $(`button[id^='${serviceId}-${rowId}-'][id$='-btn']`).prop("disabled", false);

      if (attempt < retries) {
        // Wait for the specified delay before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      } else if ( !failed ) {
        updateHeaderButtons(serviceId, rowId, "running");
        progressBarUpdate(serviceId, rowId, "running", 100);
        showToast(`Cannot connect to started Server. Try to open manually. If this does not work try restarting the Server.`);
        console.error("Maximum retries reached. Unable to access the website.");
      }
    }
  }



  function homeSummaryButtonOpen(serviceId, rowId, buttonId, button_options, user, api, base_url, utils) {
    let url = new URL(utils.url_path_join(window.origin, "user", user, rowId).replace("//", "/") + '/');
    window.open(url, "_blank");
  }

  function wmTriggerButtonSave(serviceId, rowId, buttonId, button_options, user, api, base_url, utils) {
    wmNewSave(serviceId, rowId, buttonId, button_options, user, api, base_url, utils, false);
  }

  function toggleExternalCB(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    const labelChecked = val(getLabelCBElement(serviceId, rowId, trigger));
    const inputDiv = getInputDiv(serviceId, rowId, elementId);
    const inputElement = getInputElement(serviceId, rowId, elementId);
    if ( labelChecked ) {
      inputDiv.show();
      const inputLabel = getLabelCBElement(serviceId, rowId, elementId);
      if ( inputLabel.length > 0 ) {
        if ( val(inputLabel) ) {
          inputElement.attr("data-collect", true);
        } 
      } else {
        inputElement.attr("data-collect", true);
      }
    } else {
      inputDiv.hide();
      inputElement.attr("data-collect", false);
    }
  }

  function homeTriggerAccount(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    const values = getAccountOptions(serviceId, rowId);
    const inputElement = getInputElement(serviceId, rowId, "account");
    fillSelect(elementId, inputElement, values);
    // inputElement.trigger("change");
  }

  function wTriggerAccount(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    homeTriggerAccount(trigger, serviceId, rowId, tabId, elementId, elementOptions);
  }

  function getModuleValues(serviceId, rowId, name, setName) {
    const options = val(getInputElement(serviceId, rowId, "option"));
    let values = [];

    let systems = $(`select[id^='${serviceId}-${rowId}-'][id$='-system-input']`).val();
    systems = Array.isArray(systems) ? systems : [systems];
    
    let keys = new Set();
    systems.forEach(system => {
      options.forEach(option => {
        if (getServiceConfig(serviceId)?.options?.[option]?.[setName]) {
          const nameSet = getServiceConfig(serviceId)?.options[option]?.[setName];
          Object.entries(userModulesConfig[name])
            .filter(([key, value]) => 
              (value.sets && value.sets.includes(nameSet)) &&
              (!value.allowed_systems || value.allowed_systems.includes(system))
            ).forEach( ([key, value]) => {
              if ( !keys.has(key) ) {
                keys.add(key);
                values.push([
                  key,
                  value.displayName,
                  typeof value.default === 'object' && value.default !== null ? value.default.default : value.default,
                  value.href,
                  value.weight ?? 10
                ]);
              }
            });
        }
      });
    });
    return values.sort((a, b) => b[4] - a[4]);
  }

  function homeTriggerModules(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    $(`input[id^='${serviceId}-${rowId}-${tabId}-'][id$='-select-all-input']`).prop("checked", false);
    $(`input[id^='${serviceId}-${rowId}-${tabId}-'][id$='-select-none-input']`).prop("checked", false);

    const containerDiv = $(`div[id^='${serviceId}-${rowId}-'][id$='${elementId}-checkboxes-div']`);
    const inputDiv = $(`div[id^='${serviceId}-${rowId}-'][id$='${elementId}-input-div']`);
    const values = getModuleValues(serviceId, rowId, elementId, elementOptions.options.setName);
    
    let workshopPreset = false;
    let workshopPresetChecked = [];
    const group = elementOptions.options.group || tabId;
    const name = elementOptions.options.name || elementId;
    if ( pageType(null) == pageType("workshop") ) {
      const workshopValues = getWorkshopOptions();
      if ( Object.keys(workshopValues).includes(group) && Object.keys(workshopValues[group]).includes(name) ){
        workshopPreset = true;
        const modules = workshopValues[group][name];
        if ( modules.length > 0 ) {
          workshopPresetChecked = modules;
        }
      }
    }
    // Ensure the container exists
    if (containerDiv.length > 0 && values.length > 0) {
      const idPrefix = containerDiv.attr('id').replace(/-checkboxes-div$/, "");
      containerDiv.html('');
      values.forEach(function (item) {
        let isChecked = '';
        let isDisabled = '';
        if ( workshopPreset ) {
          if ( workshopPresetChecked.includes(item[0]) ){
            isChecked = 'checked';
          }
          isDisabled = 'disabled="true"';
        } else {
          isChecked = item[2] ? 'checked' : '';
        }
        let dependencies = '';
        if ( elementOptions.dependency ){
          for (const [specificKey, specificValues] of Object.entries(elementOptions.dependency)) {
            dependencies += ` data-dependency-${specificKey}="true"`;
            specificValues.forEach(specificValue => {
              dependencies += ` data-dependency-${specificKey}-${specificValue}="true"`;
            });
          }
        }
        
        // Create the new div block
        const newDiv = $(`
          <div id="${idPrefix}-${item[0]}-input-div" class="form-check col-sm-6 col-md-4 col-lg-3">
            <input type="checkbox" name="${item[0]}" data-collect="true" ${dependencies}                
              data-checked="${isChecked}" data-parent="${elementId}" data-group="${group}" data-element="${item[0]}" data-type="multiplecheckbox" data-row="${rowId}" data-tab="${tabId}" class="form-check-input" id="${idPrefix}-${item[0]}-input" value="${item[0]}" ${isChecked} ${isDisabled}/>
            <label class="form-check-label" for="${idPrefix}-${item[0]}-input">
              <span class="align-middle">${item[1]}</span>
              <a href="${item[3]}" target="_blank" class="module-info text-muted ms-3">
                <span>${getSvg("info")}</span>
                <div class="module-info-link-div d-inline-block">
                  <span class="module-info-link" id="nbdev-info-link"> ${getSvg("link")}</span>
                </div>
              </a>
            </label>
          </div>
        `);
        // Append the new div to the container
        containerDiv.append(newDiv);
        // Add toggle function to each checkbox
        $(document).on("click", `#${idPrefix}-${item[0]}-input`, function (event) {
          $(`input[id^='${serviceId}-${rowId}-'][id$='-select-all-input']`).prop("checked", false);
          $(`input[id^='${serviceId}-${rowId}-'][id$='-select-none-input']`).prop("checked", false);
        });
      });
    }
    inputDiv.show();
  }

  function wTriggerModules(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    homeTriggerModules(trigger, serviceId, rowId, tabId, elementId, elementOptions);
  }

  function homeTriggerNavbarResources(trigger, serviceId, rowId) {
    const systems = getUnicoreValues(serviceId, rowId, "system");
    const partitions = getUnicoreValues(serviceId, rowId, "partition");
    let showResources = false;      
    systems.forEach( (system) => {
      if ( !showResources ) {
        partitions.forEach( (partition) => {
          if ( !showResources && (Object.keys(resourcesConfig[system])).includes(partition) ) {
            if ( !(systemConfig[system]?.interactivePartitions || []).includes(partition) ) {
              showResources = true;
            }
          }
        });
      }
    });
    if ( showResources ) {
      $(`button[id^="${serviceId}-${rowId}-${trigger}-navbar-button"]`).trigger("show");
    } else {
      $(`button[id^="${serviceId}-${rowId}-${trigger}-navbar-button"]`).trigger("hide");
    }
  }
  function wTriggerNavbarResources(trigger, serviceId, rowId) {
    homeTriggerNavbarResources(trigger, serviceId, rowId);
  }

  function wTriggerName(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    if ( pageType(null) == pageType("workshop") ) {
      const inputName = getInputElement(serviceId, rowId, elementId);
      const user_options = getWorkshopOptions();
      const displayName = user_options.name || "Workshop";
      inputName.val(displayName);
    }
  }

  function fillLogContainer(serviceId, rowId, events) {
    clearLogs(serviceId, rowId);
    events.forEach(event => {
      appendToLog(serviceId, rowId, event);
    })
  }

  function clearLogs(serviceId, rowId) {
    const logInputElement = $(`[id^='${serviceId}-${rowId}-logs'][id$='-logcontainer-input']`);
    logInputElement.html("");
  }

  function defaultLogs(serviceId, rowId) {
    const logInputElement = $(`[id^='${serviceId}-${rowId}-logs'][id$='-logcontainer-input']`);
    logInputElement.html("Logs collected during the Start process will be shown here. (This does not work? Try refreshing the website)");
  }

  function appendToLog(serviceId, rowId, event) {    
    const logInputElement = $(`[id^='${serviceId}-${rowId}-logs'][id$='-logcontainer-input']`);
    const childCount = logInputElement.children().length || 0;
    let htmlMsg = "";
    if (event.html_message !== undefined) {
      htmlMsg = event.html_message
    } else if (event.message !== undefined) {
      htmlMsg = event.message;
    }
    if ( !htmlMsg && event.failed ) {
      htmlMsg = "Server stopped";
    }
    if ( htmlMsg ) {
      try { 
        htmlMsg = htmlMsg.replace(/&nbsp;/g, ' ');
      } catch (e) { 
        console.log("Could not append Log Message");
        console.log(e);
        return;
      }
      let exists = false;
      logInputElement.children().each(function (i, e) {
        let logMsg = $(e).html();
        if (htmlMsg == logMsg) exists = true;
      })
      if (!exists)
        logInputElement.append($(`<div id="${serviceId}-${rowId}-logs-logcontainer-element${childCount}" class="log-div">`).html(htmlMsg));
        let element = $(`#${serviceId}-${rowId}-logs-logcontainer-element${childCount}`);
        
        if ( event.progress === 100 && element.find("details") ) {
          element.find("details").attr("open", true);
        }
    }
    if (pageType(null) == pageType("start") || pageType(null) == pageType("spawn") ) {
      if ( event.failed ) {
        if (logInputElement.find('[data-config-hint]').length === 0) {
          let infoMsg = '<details data-config-hint style="border-left: 4px solid darkorange; padding-left: 10px; margin-top: 1em;"><summary style="color: darkorange; font-weight: bold; cursor: pointer;">This is the starting page. Need to change your setup?</summary><p>To update your configuration or add a new one, please visit the <a href="/hub/home">configuration page</a>.</p></details>';
          logInputElement.append($(`<div id="${serviceId}-${rowId}-logs-logcontainer-element${childCount}" class="log-div">`).html(infoMsg));
        }
      }
    }
  }

  function progressBarUpdate(serviceId, rowId, status, progress) {
    const progressBarParentElement = $(`#${serviceId}-${rowId}-progress-bar-parent`);
    const progressBarElement = $(`#${serviceId}-${rowId}-progress-bar`);
    const progressTextElement = $(`#${serviceId}-${rowId}-progress-text`);
    const progressTextInfoElement = $(`#${serviceId}-${rowId}-progress-info-text`);
    let background = "";
    let text = "";
    let color = "black";
    if ( progress >= 50 ) {
      color = "white";
    }
    if ( status == "connecting" ) {
      text = "connecting";
      background = "bg-success";
    } else if ( status == "running" ) {
      text = "running";
      background = "bg-success";
    } else if ( status == "stopped" ) {
      text = "stopped";
      background = "bg-danger";
    } else if ( status == "cancelling" ) {
      text = "cancelling";
      background = "bg-danger";
    } else if ( status == "stopping" ) {
      text = "stopping";
      background = "bg-danger";
    } else if ( status == "starting" ) {
      text = "starting";
    } else if ( status == "building" ) {
      text = "building";
    } else if ( progress == 0 ){
      text = "";
    }

    if ( status === "" && progress != 100 ) {
      progressBarParentElement.css('display', 'none');
    } else {
      progressBarParentElement.css('display', 'block');
    }

    progressBarElement.width(progress).removeClass("bg-success bg-danger bg-primary").addClass(background).html("");
    progressTextElement.css('color', color);
    if ( progress == 100 || progress == 0 ) {
      progressTextElement.html("");
    } else {
      progressTextElement.html(`${progress}%`);
    }
    progressTextInfoElement.html(text);
  }
  function wTriggerRepoPathType(trigger, serviceId, rowId, tabId, elementId, elementOptions) {
    homeTriggerRepoPathType(trigger, serviceId, rowId, tabId, elementId, elementOptions);
  }


  function _uuidv4hex() {
    return ([1e7, 1e3, 4e3, 8e3, 1e11].join('')).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
  }
  function _uuidWithLetterStart() {
    let uuid = _uuidv4hex();
    let char = Math.random().toString(36).match(/[a-zA-Z]/)[0];
    return char + uuid.substring(1);
  }

  function homeTriggerButtonStartGreen(serviceId, rowId, buttonId, button_options, user, api, base_url, utils) {
    const newId = _uuidWithLetterStart();
    const options = getAPIOptions();

    const form = $(`form[id^='${serviceId}-${rowId}-form']`);
    const valid = validateForm(serviceId, rowId);
    if ( !valid ) {
      console.log(`Invalid Form for ${serviceId}-${rowId}`);
      return;
    }

    let userOptions = collectSelectedOptions(serviceId, rowId);

    options["data"] = JSON.stringify(userOptions);
    var newTab = window.open("about:blank");
    options["success"] = function (data, textStatus, jqXHR) {
      try {
        newTab.location.href = utils.url_path_join(base_url, "start", user, newId);
      } catch (e) {
        window.location.href = utils.url_path_join(base_url, "start", user, newId);
      }
      const url = new URL(window.location.href);
      localStorage.setItem("service", serviceId);
      localStorage.setItem("row", newId);
      localStorage.setItem("clicklogs", "true"); 
      window.location.href = url.toString();
    }
    options["error"] = function (jqXHR, textStatus, errorThrown) {
      try {
        newTab.close();
      } catch (e) {
        console.error("Could not close new tab");
      }
      if (jqXHR.status == 503) {
        this.tryCount--;
        if (this.tryCount >= 0) {
          $.ajax(this);
          return;
        }
        showToast("Request to Server failed. Try refreshing website");
        console.error("API Request failed:", textStatus, errorThrown);
        return;
      }
      if (jqXHR.status == 403) {                
        return;
      }
      showToast("Request to Server failed. Try refreshing website");
      console.error("API Request failed:", textStatus, errorThrown);
    }
    api.update_named_server(user, newId, options);
  }


  function urlPathJoin(...parts) {
    return parts
      .map((part, index) => {
        // Remove leading slash unless it's the first part (protocol/host)
        if (index > 0) part = part.replace(/^\/+/, "");
        // Remove trailing slash
        part = part.replace(/\/+$/, "");
        return part;
      })
      .join("/");
  }

      // Build repo2docker image and send start request afterwards
  function startRepo2Docker(serviceId, rowId, userOptions, user, api, callStart=true) {
    $(`button[id^='${serviceId}-${rowId}-'][id$='-btn']`).prop("disabled", true);
    homeHeaderUpdate(serviceId, rowId);
    updateHeaderButtons(serviceId, rowId, "building");
    progressBarUpdate(serviceId, rowId, "building", 2);

    let toView = document.getElementById(`${serviceId}-${rowId}-summary-tr`);
    if ( toView ) toView.scrollIntoView();

    // show summary-tr
    const summaryTr = $(`tr[id^='${serviceId}-${rowId}-summary-tr']`);
    const accordionIcon = summaryTr.find(".accordion-icon");
    const collapse = $(`.collapse[id^='${serviceId}-${rowId}-collapse']`);
    if ( collapse.length > 0 ) {
      const shown = collapse.hasClass("show");
      if ( (! shown) && collapse ) {
        accordionIcon.removeClass("collapsed");
        new bootstrap.Collapse(collapse);
      }
    }
    const navbarLogsButton = $(`[id^='${serviceId}-${rowId}-'][id$='-logs-navbar-button']`);
    if ( navbarLogsButton ) {
      navbarLogsButton.trigger("click");
    }
    
    const term = new Terminal({
      cursorBlink: true,
      rows: 20,
      cols: 80,
      theme: {
          background: '#000000',
          foreground: '#FFFFFF',
      }
    });
    const terminalDiv = $(`[id^='${serviceId}-${rowId}-'][id$='-terminal-container-div']`);
    const terminalElement = $(`[id^='${serviceId}-${rowId}-'][id$='-terminal-container']`);
    term.open(terminalElement[0]);
    term.write("\x1b[2K\r");
    terminalDiv.fadeIn();
    const type = userOptions.repo2docker.repotype;
    let repourl = userOptions.repo2docker.repourl;

    // build api url to call the build process
    if ( ["git", "gl", "hydroshare", "ckan"].includes(type) ) {
      repourl = encodeURIComponent(repourl);
    }
    let url = "";
    if ( Object.keys(userOptions.repo2docker).includes("reporef") ) {
      const reporef = userOptions.repo2docker?.reporef || "HEAD";        
      // url = new URL(utils.url_path_join("https://mybinder.org", "build", type, repourl, reporef).replace("//", "/"));
      url = new URL(urlPathJoin(window.origin, "services", "binder", "build", type, repourl, reporef).replace("//", "/"));
      url.searchParams.append("build_only", "true");
    } else {
      // url = new URL(utils.url_path_join("https://mybinder.org", "build", type, repourl, "/").replace("//", "/"));
      url = new URL(urlPathJoin(window.origin, "services", "binder", "build", type, repourl, "/").replace("//", "/"));
      url.searchParams.append("build_only", "true");
    }
    r2dEvtSource = new EventSource(url);
    let r2dStatus = 0;
    
    setTimeout(function() {
      if ( r2dStatus < 2 ) {
        term.write("Build failed" + "\r");
        console.log("Build failed")
        updateHeaderButtons(serviceId, rowId, "stopped");
        progressBarUpdate(serviceId, rowId, "stopped", 100);
        r2dEvtSource.close();
      }
    }, 30000);

    r2dEvtSource.onmessage = (event) => {
      try {
          const jsonData = JSON.parse(event.data);
          var message = jsonData.message;
          if ( jsonData.phase == "waiting" ) {
            if ( r2dStatus == 0 ) {
              updateHeaderButtons(serviceId, rowId, "building");
              progressBarUpdate(serviceId, rowId, "building", 2);
              r2dStatus = 1;
            }
          } else if ( jsonData.phase == "fetching" ) {
            if ( r2dStatus < 2 ) {
              updateHeaderButtons(serviceId, rowId, "building");
              progressBarUpdate(serviceId, rowId, "building", 3);
              r2dStatus = 2;
            }
          } else if ( jsonData.phase == "building" ) {
            if ( r2dStatus < 3 ) {
              updateHeaderButtons(serviceId, rowId, "building");
              progressBarUpdate(serviceId, rowId, "building", 5);
              r2dStatus = 3;
            }
          } else if ( jsonData.phase == "pushing" ) {
            if ( r2dStatus < 4 ) {
              updateHeaderButtons(serviceId, rowId, "building");
              progressBarUpdate(serviceId, rowId, "building", 8);
              r2dStatus = 4;
            }
          } else if ( ["ready", "built", "launching"].includes(jsonData.phase) ) {
            r2dStatus = 5;
            if ( callStart ) {
              const options = getAPIOptions();
              userOptions["repo2docker"]["image"] = jsonData.imageName;
              options["data"] = JSON.stringify(userOptions);
              options["success"] = function (data, textStatus, jqXHR) {
                updateHeaderButtons(serviceId, rowId, "starting");
                if ( !Object.keys(globalUserOptions).includes(serviceId) ){
                  globalUserOptions[serviceId] = {};
                }
                globalUserOptions[serviceId][rowId] = userOptions;
                clearLogs(serviceId, rowId);

                setTimeout(function() {
                  const logInputElement = $(`[id^='${serviceId}-${rowId}-logs'][id$='-logcontainer-input']`);
                  if ( logInputElement.html() == "" ) {
                    console.log("Logs not fetched. Reload website");
                    const url = new URL(window.location.href);
                    localStorage.setItem("service", serviceId);
                    localStorage.setItem("row", rowId);
                    localStorage.setItem("clicklogs", "true");
                    window.location.href = url.toString();
                  }
                }, 1000);
              }
              api.start_named_server(user, rowId, options);
            }
                  
            const toView = document.getElementById(`${serviceId}-${rowId}-summary-tr`)
            if ( toView ) toView.scrollIntoView();

            // show summary-tr
            const summaryTr = $(`tr[id^='${serviceId}-${rowId}-summary-tr']`);
            const accordionIcon = summaryTr.find(".accordion-icon");
            const collapse = $(`.collapse[id^='${serviceId}-${rowId}-collapse']`);
            if ( collapse.length > 0 ) {
              const shown = collapse.hasClass("show");
              if ( ! shown ) {
                accordionIcon.removeClass("collapsed");
                new bootstrap.Collapse(collapse);
              }
            }
            const navbarLogsButton = $(`[id^='${serviceId}-${rowId}-'][id$='-logs-navbar-button']`);
            if ( navbarLogsButton ) {
              navbarLogsButton.trigger("click");
            }
            r2dEvtSource.close();
          } else if ( jsonData.phase == "failed" ) {
            r2dStatus = 6;
            term.write("Build failed" + "\r");
            $(`button[id^='${serviceId}-${rowId}-'][id$='-btn']`).prop("disabled", false);
            updateHeaderButtons(serviceId, rowId, "stopped");
            progressBarUpdate(serviceId, rowId, "stopped", 100);
            r2dEvtSource.close();
          }
          if ( message ) {
            term.write(jsonData.message + "\r");
          } else if ( message != "\n" ) {
            term.write("\n\r");
          }

      } catch (error) {
          term.write("Build failed" + "\r");
          console.log(error);
          $(`button[id^='${serviceId}-${rowId}-'][id$='-btn']`).prop("disabled", false);
          updateHeaderButtons(serviceId, rowId, "stopped");
          progressBarUpdate(serviceId, rowId, "stopped", 100);
          r2dEvtSource.close();
          r2dEvtSource = null;
      }
    }

    r2dEvtSource.onerror = (e) => {
      console.log(e);
      r2dEvtSource.close();
      r2dEvtSource = null;
    }

  }


  function wSummaryButtonStart(serviceId, rowId, buttonId, button_options, user, api, base_url, utils) {
    let start = true;
    if ( pageType(null) == pageType("workshop" )) {
      const workshopOptions = getWorkshopOptions();
      const keywordsToSkip = ["profile", "service", "secret_keys", "workshopid", "description", "expertmode"];
      function recursiveCheck(serviceId, rowId, userOptions) {
        for ( const [key, value] of Object.entries(userOptions) ) {
          if ( !keywordsToSkip.includes(key) ) {
            if ( value.constructor == Object ) {
              recursiveCheck(serviceId, rowId, value);
            } else {
              const currentVal = $(`[id^='${serviceId}-${rowId}-'][id$='-${key}-input']`).val();
              if (typeof currentVal !== 'undefined') {
                let allowedValues = Array.isArray(value) ? value : [value];
                if ( allowedValues && allowedValues.length > 0 && !allowedValues.includes(currentVal) ) {
                  showToast(`${key} ${currentVal} not allowed. Allowed values: ${allowedValues}`);
                  console.log(`${key} ${currentVal} not allowed. Allowed values: ${allowedValues}`);
                  start = false;
                }
              }
            }
          }
        }
      }
      recursiveCheck(serviceId, rowId, workshopOptions);
    }
    if ( start ) homeSummaryButtonStart(serviceId, rowId, buttonId, button_options, user, api, base_url, utils);
  }

      function homeSummaryButtonStart_start(serviceId, rowId, buttonId, button_options, user, api, base_url, utils) {
        // const form = $(`form[id^='${serviceId}-${rowId}-form']`);
        const valid = validateForm(serviceId, rowId);
        if ( !valid ) {
          console.log(`Invalid Form for ${serviceId}-${rowId}`);
          return;
        }

        let userOptions = collectSelectedOptions(serviceId, rowId);
        clearLogs(serviceId, rowId);
        defaultLogs(serviceId, rowId);
        updateHeaderButtons(serviceId, rowId, "stopped");
        progressBarUpdate(serviceId, rowId, "", 0);
        
        const terminalElement = $(`[id^='${serviceId}-${rowId}-'][id$='-terminal-container']`);
        terminalElement.html("");
        
        // if it's a repo2DockerBuild, we handle the starting procedure in the startRepo2Docker function
        if ( ! (userOptions.service == "jupyterlab" && userOptions.option == "repo2docker") ) {
          const options = getAPIOptions();
          options["data"] = JSON.stringify(userOptions);
          options["success"] = function (data, textStatus, jqXHR) {
            $(`button[id^='${serviceId}-${rowId}-'][id$='-btn']`).prop("disabled", true);
            updateHeaderButtons(serviceId, rowId, "starting");
            if ( !Object.keys(globalUserOptions).includes(serviceId) ){
              globalUserOptions[serviceId] = {};
            }
            globalUserOptions[serviceId][rowId] = userOptions;
            homeHeaderUpdate(serviceId, rowId);
            clearLogs(serviceId, rowId);

            setTimeout(function() {
              const logInputElement = $(`[id^='${serviceId}-${rowId}-logs'][id$='-logcontainer-input']`);
              if ( logInputElement.html() == "" ) {
                console.log("Logs not fetched. Reload website");
                const url = new URL(window.location.href);
                localStorage.setItem("service", serviceId);
                localStorage.setItem("row", rowId);
                localStorage.setItem("clicklogs", "true");
                window.location.href = url.toString();
              }
            }, 10000);
          }
          api.start_named_server(user, rowId, options);
                
          const toView = document.getElementById(`${serviceId}-${rowId}-summary-tr`)
          if ( toView ) toView.scrollIntoView();

          // show summary-tr
          const summaryTr = $(`tr[id^='${serviceId}-${rowId}-summary-tr']`);
          const accordionIcon = summaryTr.find(".accordion-icon");
          const collapse = $(`.collapse[id^='${serviceId}-${rowId}-collapse']`);
          const shown = collapse.hasClass("show");
          if ( ! shown ) {
            accordionIcon.removeClass("collapsed");
            new bootstrap.Collapse(collapse);
          }
          const navbarLogsButton = $(`[id^='${serviceId}-${rowId}-'][id$='-logs-navbar-button']`);
          if ( navbarLogsButton ) {
            navbarLogsButton.trigger("click");
          }
        } else {
          startRepo2Docker(serviceId, rowId, userOptions, user, api);
        }
      }

  function homeSummaryButtonStart_default(serviceId, rowId, buttonId, button_options, user, api, base_url, utils) {
      const form = $(`form[id^='${serviceId}-${rowId}-form']`);
      const valid = validateForm(serviceId, rowId);
      if ( !valid ) {
        console.log(`Invalid Form for ${serviceId}-${rowId}`);
        return;
      }

      let userOptions = collectSelectedOptions(serviceId, rowId);
      clearLogs(serviceId, rowId);
      defaultLogs(serviceId, rowId);
      updateHeaderButtons(serviceId, rowId, "stopped");
      progressBarUpdate(serviceId, rowId, "", 0);
      
      const terminalElement = $(`[id^='${serviceId}-${rowId}-'][id$='-terminal-container']`);
      terminalElement.html("");
      
      // if it's a repo2DockerBuild, we handle the starting procedure in the startRepo2Docker function
      const newTab = window.open("about:blank");
      const options = getAPIOptions();
      options["error"] = function (jqXHR, textStatus, errorThrown) {
        newTab.close();
        if (jqXHR.status == 503) {
          this.tryCount--;
          if (this.tryCount >= 0) {
            $.ajax(this);
            return;
          }
          showToast("Request to Server failed. Try refreshing website");
          console.error("API Request failed:", textStatus, errorThrown);
          return;
        }
        if (jqXHR.status == 403) {                
          return;
        }
        showToast("Request to Server failed. Try refreshing website");
        console.error("API Request failed:", textStatus, errorThrown);
      }
      options["data"] = JSON.stringify(userOptions);
      options["success"] = function (data, textStatus, jqXHR) {
        $(`button[id^='${serviceId}-${rowId}-'][id$='-btn']`).prop("disabled", true);
        // updateHeaderButtons(serviceId, rowId, "starting");
        if ( !Object.keys(globalUserOptions).includes(serviceId) ){
          globalUserOptions[serviceId] = {};
        }
        globalUserOptions[serviceId][rowId] = userOptions;
        homeHeaderUpdate(serviceId, rowId);
        clearLogs(serviceId, rowId);
        try {
          newTab.location.href = utils.url_path_join(base_url, "start", user, rowId);
        } catch (e) {
          window.location.href = utils.url_path_join(base_url, "start", user, rowId);
        }
      }
      api.update_named_server(user, rowId, options);
              
      const toView = document.getElementById(`${serviceId}-${rowId}-summary-tr`)
      if ( toView ) toView.scrollIntoView();

      // show summary-tr
      const summaryTr = $(`tr[id^='${serviceId}-${rowId}-summary-tr']`);
      const accordionIcon = summaryTr.find(".accordion-icon");
      const collapse = $(`.collapse[id^='${serviceId}-${rowId}-collapse']`);
      const shown = collapse.hasClass("show");
      if ( ! shown ) {
        accordionIcon.removeClass("collapsed");
        new bootstrap.Collapse(collapse);
      }
      const navbarLogsButton = $(`[id^='${serviceId}-${rowId}-'][id$='-logs-navbar-button']`);
      if ( navbarLogsButton ) {
        navbarLogsButton.trigger("click");
      }
      if ( userOptions.service == "jupyterlab" && userOptions.option == "repo2docker") {
        startRepo2Docker(serviceId, rowId, userOptions, user, api, callStart=false);
      }
    }


  function homeSummaryButtonStart(serviceId, rowId, buttonId, button_options, user, api, base_url, utils) {
    if (pageType(null) == pageType("start")) {
      homeSummaryButtonStart_start(serviceId, rowId, buttonId, button_options, user, api, base_url, utils);
    } else {
      homeSummaryButtonStart_default(serviceId, rowId, buttonId, button_options, user, api, base_url, utils);
    }
  }



  function homeTriggerButtonDelete(serviceId, rowId, buttonId, button_options, user, api, base_url, utils) {
    updateHeaderButtons(serviceId, rowId, "disable");
    const options = getAPIOptions();
    options["success"] = function () {
      $(`tr[data-server-id='${serviceId}-${rowId}']`).each(function () {
        $(this).remove();
      });
      console.log(`Delete of ${serviceId}-${rowId} successful`);
    }
    api.delete_named_server(user, rowId, options);
  }

  function homeSummaryButtonDel(serviceId, rowId, buttonId, button_options, user, api, base_url, utils) {
    homeTriggerButtonDelete(serviceId, rowId, buttonId, button_options, user, api, base_url, utils);
  }

function triggerInitUntilValuesSet(serviceId, rowId, firstRow = false, maxTries = 1000, delayMs = 10) {
  return new Promise((resolve) => {
    let tries = 0;
    let modalWasVisible = false;

    function tryTrigger() {
      const $inputs = $(`[data-trigger-init][id^='${serviceId}-${rowId}-'][id$='-input']`);
      const $inputsCheck = $(`[data-trigger-init][id^='${serviceId}-${rowId}-'][id$='-option-input']`);

      console.time(`Init Row ${serviceId}-${rowId} (${tries + 1})`);

      $inputs.trigger("trigger_init");

      const allSet = !$inputsCheck.toArray().some(el => {
        const val = $(el).val();
        return val === undefined || val === "" || val === null;
      });

      tries++;

      if (allSet) {
        const frontendConfig = getFrontendConfig();
        const defaults = frontendConfig?.services?.options[serviceId]?.default || {};
        const defaultTab = defaults?.tab || "None";
        const defaultOptions = defaults?.options || {};

        for (const [key, value] of Object.entries(defaultOptions)) {
            if (value != null && value !== "") {
                const $el = $(`[id^='${serviceId}-${rowId}-${defaultTab}-'][id$='-${key}-input']`);

                if ($el.is("select")) {
                    const hasOption = $el.find(`option[value="${value}"]`).length > 0;
                    if (hasOption) {
                        $el.val(value);
                        $el.trigger("change");
                    }
                } else {
                    $el.val(value);
                    $el.trigger("change");
                }
            }
        }

        console.timeEnd(`Init Row ${serviceId}-${rowId} (${tries})`);

        if (pageType(null) === pageType("workshopmanager") && firstRow) {
          new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                modalWasVisible = true;
              } else if (modalWasVisible) {
                const serviceId = $('#service-input').val();
                const newId = $('#rowid-reload').val();
                window.location.href = `${window.location.origin}${window.location.pathname}?service=${serviceId}&row=${newId}`;
              }
            });
          }).observe(document.getElementById(`${serviceId}-${rowId}-modal`));
        }

        return resolve();
      }

      if (tries >= maxTries) {
        console.log(`Max tries reached (${maxTries}). Stopping.`);
        return resolve();
      }

      setTimeout(tryTrigger, delayMs);
    }

    tryTrigger();
  });
}


function fillingRowsRetry(serviceId, rowId, user_options, fillingOrder, maxTries = 1000, delayMs = 10) {
  return new Promise((resolve, reject) => {
    let tries = 0;
    let f = rowFills[pageType(null)];

    function tryTrigger() {
      const $inputs = $(`[id^='${serviceId}-${rowId}-'][id$='-option-input']`);
      if ($inputs.length === 0) return resolve();

      const allSet = $inputs.find(`option`).length > 0;
      tries++;

      if (allSet) {
        console.time(`Fill Row ${serviceId}-${rowId} (${tries})`);
        f(serviceId, rowId, user_options, fillingOrder);
        console.timeEnd(`Fill Row ${serviceId}-${rowId} (${tries})`);
        return resolve();
      }

      if (tries >= maxTries) {
        console.log(`Max tries reached (${maxTries}). Stopping.`);
        return resolve(); // still resolve to continue the chain
      }

      setTimeout(tryTrigger, delayMs);
    }

    tryTrigger();
  });
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let storageRowValue;
let storageServiceValue;
let storageShowlogs;
let storageStart;



const rowFills = {
  "home": homeFillExistingRow,
  "start": startFillExistingRow,
  "spawn": startFillExistingRow,
  "workshop": workshopFillExistingRow,
  "workshopmanager": workshopManagerFillExistingRow,
}

const rowTypes = {
  "home": appendRowToServiceTableHome,
  "start": appendRowToServiceTableStart,
  "spawn": appendRowToServiceTableStart,
  "workshop": appendRowToServiceTableWorkshop,
  "workshopmanager": appendRowToServiceTableWorkshopManager,
}

const rowHeaderDefault = {
  "home": getHomeDefaultHeader,
  "start": getHomeDefaultHeader,
  "spawn": getHomeDefaultHeader,
  "workshop": tcWorkshopDefaultHeader,
  "workshopmanager": tcWorkshopManagerDefaultHeader
}
const rowHeaderFirst = {
  "home": tcHomeFirstHeader,
  "workshopmanager": tcWorkshopManagerFirstHeader
}

let modalWasVisible = false;


document.addEventListener('DOMContentLoaded', async function () {
    const page = pageType(null);
    if ( urlParams.has('row') && urlParams.has('service') ) {
      storageServiceValue = urlParams.get('service');
      storageRowValue = urlParams.get('row');
      storageShowlogs = urlParams.has('clicklogs');
      storageStart = urlParams.has('start');
    } else if (localStorage.getItem('row') && localStorage.getItem('service')) {
      storageServiceValue = localStorage.getItem('service');
      storageRowValue = localStorage.getItem('row');
      storageStart = localStorage.getItem("start") === "true";
      storageShowlogs = localStorage.getItem("clicklogs") === "true";
    }

    async function f(serviceId, serviceOptions, rowId, rowOptions, index) {
      console.time(`Create Row ${serviceId}-${rowId}`);
      const header = index === 0 ? rowHeaderFirst[page] : rowHeaderDefault[page];

      rowTypes[page](serviceId, rowId, rowOptions, serviceOptions, header, index === 0);
      $(`#${serviceId}-loading-tr`).hide();
      await new Promise(r => setTimeout(r, 0));
      await triggerInitUntilValuesSet(serviceId, rowId, index===0);
      
      await new Promise(r => setTimeout(r, 0));
      

      if (index > 0 || ["spawn", "start", "workshop"].includes(page)) {
        await fillingRowsRetry(serviceId, rowId, getSpawner(rowId).decrypted_user_options, serviceOptions?.fillingOrder || []);
        if ( initSSEValues.initialized ) {
          for (const [key, value] of Object.entries(initSSEValues)) {
            let payload = Array.isArray(value) ? [value] : value;
            $(`[data-sse-${key}][data-service=${serviceId}][data-row=${rowId}]`).trigger("sse", payload);
          }
        }
        $(`#${serviceId}-${rowId}-summary-tr`).show();
        $(`#${serviceId}-${rowId}-loading-tr`).hide();
        if ( page === "home" ) {
          if ( storageRowValue && storageRowValue === rowId && storageServiceValue && storageServiceValue === serviceId ) {
            $(`div[id$='-table-div']:not([id^='${serviceId}-'])`).hide();
            $(`div[id$='-table-div'][id^='${serviceId}-']`).show();
            let option = $(`[id^='${serviceId}-${rowId}-'][id$='-option-input']`).val();
          
            $(`div[id$='-collapse']:not([id^='${serviceId}-${rowId}-collapse'])`).removeClass("show");
            $(`div[id^='${serviceId}-${rowId}-collapse']`).addClass("show");

            let x = document.getElementById(`${serviceId}-${rowId}-summary-tr`)
            if ( x ) x.scrollIntoView();

            if ( storageStart ) {
              const spawner = getSpawner(rowId);
              const ready = spawner.ready;
              const pending = spawner.pending;
              const active = spawner.active;
              if ( ready ) {
                window.open(`/user/${window.jhdata.user}/${rowId}`, "_blank");
              } else if ( !active ) {
                $(`[id^='${serviceId}-${rowId}-'][id$='-start-btn-header']`).trigger("click");
              } else {
                if ( pending === "stop" ) {
                  updateHeaderButtons(serviceId, rowId, "stopping");
                  progressBarUpdate(serviceId, rowId, "stopping", 100);
                } else {
                  $(`[id^='${serviceId}-${rowId}-'][id$='-logs-navbar-button']`).trigger("click");
                  homeHeaderUpdate(serviceId, rowId);
                  if ( serviceId === "jupyterlab" && option === "repo2docker" ) {
                    updateHeaderButtons(serviceId, rowId, "building");
                    progressBarUpdate(serviceId, rowId, "building", 2);
                  } else {
                    updateHeaderButtons(serviceId, rowId, "starting");
                    progressBarUpdate(serviceId, rowId, "starting", 10);
                  }
                }
              }
            }
            if ( storageShowlogs ) {
              $(`[id^='${serviceId}-${rowId}-'][id$='-logs-navbar-button']`).trigger("click");
              if ( serviceId == "jupyterlab" && option == "repo2docker") {
                startRepo2Docker(serviceId, rowId, ( getFrontendCollection()?.decrypted_user_options[rowId] || {}), window.jhdata.user, null, callStart=false);
              }
            }
            localStorage.removeItem('service');
            localStorage.removeItem('row');
            localStorage.removeItem('start');
            localStorage.removeItem('clicklogs');
          }
        }
      } else {
        $(`#${serviceId}-${rowId}-loading-tr`).hide();
      }

      console.timeEnd(`Create Row ${serviceId}-${rowId}`);
    }

    for (const [serviceId, serviceOptions] of Object.entries(getFrontendConfig().services.options)) {
      if (["home", "workshopmanager"].includes(page)) {
        await f(serviceId, serviceOptions, getFirstRowId(), {}, 0);
        await new Promise(r => setTimeout(r, 0));
      }

      const rows = Object.entries(getTableRows());
      for (let index = 0; index < rows.length; index++) {
        const [rowId, rowOptions] = rows[index];
        await f(serviceId, serviceOptions, rowId, rowOptions, index + 1);
        await new Promise(r => setTimeout(r, 0)); 
      }
    }
  });
// });
