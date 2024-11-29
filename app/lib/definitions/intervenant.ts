export type Intervenant = {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    key: string;
    creationdate: string;
    enddate: string;
    availability: JSON;
};

export type IntervenantForm = {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    enddate: string;
};