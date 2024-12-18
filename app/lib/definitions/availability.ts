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