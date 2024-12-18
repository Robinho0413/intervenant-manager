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