export class CalendarModel {
    calendarID: string;
    calendarName: string = '';
    category: string;
    description: string;
    wKTemplateID: string;
    weekendDays: string;
    daysPerYear: any;
    daysPerMonth: any;
    daysPerWeek: any;
    hoursPerDay: any;
    stdHours: number;
    startTime: string;
    endTime: string;
    dayoffCalendard: boolean;
    dayoffCode: string;
    dayoffColor: string;
    specialDayColor: string;
    useShift: boolean;
    stop: boolean;
    owner: string;
    bUID: string;
    createdOn: any;
    createdBy: string;
    modifiedOn: Date;
    modifiedBy: string;
    employeeID: string;
    positionID: string;
    orgUnitID: string;
    divisionID: string;
}

export class DaysOffModel {
    recID: string;
    dayoffCode: string;
    month: string;
    day: string;
    months: any;
    days: any;
    calendar: string;
    isLastYear: boolean;
    specialDay: boolean;
    symbol: string;
    color: string;
    workdayID: string;
    note: string;
    createdOn: string;
    createdBy: string;
    owner: string;
    bUID: string;
    employeeID: string;
    positionID: string;
    orgUnitID: string;
    divisionID: string
}

export class CalendarWeekModel {
    wKTemplateID: string;
    weekday: string;
    shiftType: string;
    hours: any;
    productivity: any;
    dayOff: any;
    dayoffCode: any;
    note: any;
    startTime: any;
    endTime: any;
    data: Array<any>;

}

export class CalendarDateModel {
    recID: string;
    calendarID: string;
    calendarDate: Date;
    year: string;
    month: string;
    week: string;
    weekday: string;
    symbol: string;
    dayoffColor: string;
    note: string;
}

