// @ts-ignore

import {createContext} from "react";

type IncidentCheck = {
    interval: number;
    url: string;
    services: Record<string, number>;
    healthThreshold: {
        interactive: number;
        compute: number;
    }
}

type SystemConfiguration = {
    interactivePartitions: [number];
    weight: number;
    backendService: string;
    maxPerUser?: {
        default: number;
    }
}

type FrontendCollection = {
    hostname: string;
    incidentCheck: IncidentCheck;
    systemConfig: Record<string, SystemConfiguration>;
    mapSystems: Record<string, string>;
    mapPartitions: Record<string, string>;
    defaultPartitions: Record<string, [string]>;
    serviceConfig: Record<string, object>;
}

// @ts-expect-error Blub
export const FrontendCollectionContext = createContext<FrontendCollection>({})
