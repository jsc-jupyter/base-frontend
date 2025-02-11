define(["jquery"], function (
  $
) {
  "use strict";

  const functions = {
    get_hpc_system
  };

  function get_hpc_system(software_key, tab_key, input_key, values) {
    const systems = ["JUWELS", "JURECA", "JEDI", "JUSUF", "DEEP", "JSC-Cloud"];
    const entitlements = getEntitlements();
    const mapSystems = getMapSystems();
    console.log(mapSystems);
    const resPattern = /^urn:(.+?(?=:res:)):res:(?<systempartition>[^:]+):[^:]+:act:[^:]+:[^:]+$/;
    const systemPartitions = [];
    entitlements.forEach(entitlement => {
      const match = entitlement.match(resPattern);
      if (match) {
        const lowersystempartition = match.groups.systempartition.toLowerCase();
        const system = mapSystems?.[lowersystempartition];
        if ( system && !systemPartitions.includes(system) ) {
          systemPartitions.push(system);
        }
      }
    });
    console.log(systemPartitions);
    return systems;
  }
  return functions;
})
