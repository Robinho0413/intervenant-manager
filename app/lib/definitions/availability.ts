export interface SelectInfo {
    start: Date;
    end: Date;
    view: {
        calendar: {
            unselect: () => void;
        };
    };
}

export interface Availability {
    days: string;
    from: string;
    to: string;
}

export interface WeekNumberFunction {
    (date: Date): number;
}

export interface CalendarProps {
    intervenant: {
        id: string;
        firstname: string;
        lastname: string;
        availability: Record<string, Availability[]>;
    };
    startDate: Date;
    endDate: Date;
}

export interface UpdatedAvailability {
    [key: string]: Availability[];
}

export interface Slot {
    days: string;
    from: string;
    to: string;
}

export interface EventInfo {
    event: {
        id: string;
        title: string;
        start: string;
        end: string;
    };
}

export interface PageProps {
    params: Promise<{
        key: string;
    }>;
}
