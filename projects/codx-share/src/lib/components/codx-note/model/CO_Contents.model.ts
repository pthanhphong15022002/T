
export class CO_Contents {
    lineType: string;
    icon: string;
    textColor: string = 'black';
    format: string;
    memo: string;
    status: string = null;
    refType: string;
    refID: string;
    tasks: number = 0;
    comments: number = 0;
    attachments: number = 0;
    recID: string;
}

var LINE_TYPE = {
    TEXT: 1,
    TITLE: 2,
    LIST: 3,
    CHECKBOX: 4,
}
//LineType
//1: Text
//2: Title
//3: List
//4: CheckBox