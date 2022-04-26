import { StatusNote } from './enum/enum';

export class Notes {
    recID: string;
    transID: string;
    noteType: string;
    memo: string;
    pictures: object;
    checkList: any[];
    isPin: boolean;
    showCalendar: boolean;
    createdOn: string;
    createdBy: string;   
}

export class NoteGoal {
    status: StatusNote;
    listNote: any;
}