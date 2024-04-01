export class BP_DocumentControl {
    stepNo: string;
    stepID: string;
    title: string;
    memo: string;
    files: Array<any>;
    isRequire: string;
    templateID: string;
    templateType: string;
    isTemplateAreas: string;
    permissions: Array<any>;
}
export class BP_Files {
    fileID :string;
    fileName : string;
    type:string;
    esign : boolean;
    areas:Array<any>;
}
