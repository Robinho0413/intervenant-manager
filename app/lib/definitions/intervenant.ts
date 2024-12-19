import { Availability } from "./availability";

export type Intervenant = {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    key: string;
    creationdate: string;
    enddate: string;
    availability: Record<string, Availability[]>;
    isKeyExpired: boolean;
};

export type IntervenantForm = {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    enddate: string;
};

export interface PageProps {
    params: Promise<{
        id: string;
    }>;
}
