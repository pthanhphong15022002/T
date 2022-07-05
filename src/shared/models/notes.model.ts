import { StatusNote } from './enum/enum';

export class Notes {
    recID: string;
    transID: string;
    noteType: string;
    title: string;
    memo: string;
    pictures: object;
    checkList: any[];
    isPin: boolean;
    showCalendar: boolean;
    createdOn: string;
    createdBy: string;   
}

export class TempNote {
    status: StatusNote;
    listNote: any;
}