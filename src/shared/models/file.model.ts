import { isEditable } from "@syncfusion/ej2-angular-grids";
import { AppRoutingModule } from "src/app/app-routing.module";

export class DialogAttachmentType {
    objectType: any;
    objectId: any;
    folderType: any;
    functionID: any;
    type: any;
    popup: any;
    hideBtnSave: any;
    hideUploadBtn: any;
    hideFolder: any;
    isDM:any;
}

export class DataReturn {
    status: any;
    message: any;
    data: any;
    messageHddUsed: any;
    totalUsed: any;
    totalHdd: any;
}

export class FileInfo {
    recID: string;
    id: string;    
    fullName: string;
    create: boolean;
    read: boolean;
    assign: boolean;
    delete: boolean;
    write: boolean;
    share: boolean;
    update: boolean;
    upload: boolean;
    isDelete: boolean;
    download: boolean;
    isSystem: boolean;
    isSharing: boolean;
    fileName: string;
    folderName: string;
    extension: string;
    pathDisk: string;
    highlight: string;
    owner: string;
    content: string;
    parentId: string;
    hasThumbnail: any;
    rating: any;
    version: any;
    counting: any;
    bookmark: any;
    author: any;
    folderId: string;
    fileSize: any;
    description: string;
    publisher: string;
    publisherYear: any;
    publisherDate: any;
    copyrights: string;
    data: string;
    permissions: any;
    avatar: string;
    userName: string;
    uploadDate: any;
    size: any;
    type: any;
    tags: any;
    subject: any;
    objectType: any;
    language: any;
    thumbnail: any;
    bookmarks: any;
    excerpts: string;
    relation: string;
    source: string = "";
    countDownload: any;
    childID:any
}

export class ItemInterval {
    instant: any;
    id: any;
}

export class FilterModel
{
    field: string;
    logic: string;
    value: string;
}

export class FileUpload {
    order: any;
    isSystem: any;
    recID: string;
    title: string = "";
    relation: string = "";
    source: string = "";
    fileName: string;
    avatar: any;
    thumbnail: string;
    uploadId: string;
    createdBy: string;
    createdByName: string;
    referType: string;
    createdOn: Date;
    extension: string;
    category: string;
    fileSize: any;
    type: any;
    mimeType: any;
    folderName: string;
    hasSubFolder: any;
    tags: any;
    subject: any;
    objectID: any;
    objectType: any;
    language: any;
    description: string;
    author: string;
    publisher: string;
    publishYear: any;
    publishDate: any;
    copyRights: string;
    data: any;
    item: any;
    folderID: string;
    approval: boolean = false;
    revision: boolean = false;
    checkSecurity: boolean = false;
    physical: boolean = false;
    copyrightsControl: boolean = false;
    location: string = "";
    approvers: string = "";
    revisionNote: any;
    bookmarks: Bookmark[];
    permissions: Permission[];
    form: string = ""; // share or request permission
    titleEmail: string = "";
    contentEmail: string = "";
    funcID: string;
    folderType: string = "";
    version: string = "";
    urlShare: string = "";
    excerpts: string = "";
    toPermission: Permission[];
    byPermission: Permission[];
    ccPermission: Permission[];
    bccPermission: Permission[];
    history: HistoryFile[];
    subFolder: SubFolder[];
    views: View[];
    reWrite: boolean;
    sendEmail: boolean;
    postBlog: boolean;
    urlPath: string = "";
    note: string = "";
    icon: string = "";
    comment: string = "";
    userName: string = "";
    read: boolean;
    create: boolean;
    delete: boolean;
    share: boolean;
    download: boolean;
    upload: boolean;
    assign: boolean;
    write: boolean;
    viewThumb:boolean = false;
    rawFile:any;
    entityName:any;
    expiredOn:any;
    isAlert:any;
    isEmail:any;
}


export class SubFolder {
    recID: string;
    id: string;
    level: string;
    levelText: string;
    type: string;
    typeText: string;
    format: string;
    formatText: string;
    description: string;
    objectID: string;
    createdOn: any;
}

export class Bookmark {
    recID: string;
    objectID: any;
}

export class HistoryFile {
    recID: string;
    fileName: string;
    extension: string;
    filePath: any;
    pathDisk: any;
    mimeType: any;
    fileSize: any;
    thumbnail: any;
    folderPath: any;
    folderId: any;
    objectID: any;
    objectType: any;
    category: any;
    tags: any;
    subject: any;
    topics: any;
    language: any;
    description: any;
    author: any;
    publisher: any;
    publishYear: any;
    publishDate: any;
    copyRights: any;
    owner: any;
    bUID: any;
    type: any;
    createdOn: any;
    createdBy: any;
    note: any;
}

export class View {
    recID: string;
    comment: string;
    rating: any;
    viewDate: any;
    objectID: string;
}

export class Permission {
    recID: string;
    id: string;
    memberType:string;
    objectName: string;
    objectID: string;
    objectType: string;
    approvers: string ;
    type: string;
    email: string;
    typeId: string;
    full: boolean = false;
    create: boolean = false;
    read: boolean = false;
    update: boolean = false;
    delete: boolean = false;
    share: boolean = false;
    isSharing: boolean = false;
    allowOtherShare: boolean = false;
    upload: boolean = false;
    download: boolean = false;
    revision: boolean = false;
    assign: boolean = false;
    allowOtherDownload: boolean = false;
    isActive: boolean = false;
    isSystem: boolean = false;
    isParentShare: boolean = false;
    icon: string;
    startDate: Date | any;
    endDate: Date |any;
    title: any;
    content: any;
    form: string;
    createdOn: Date;
    approvalStatus: string;
    createdBy: string;
}

export class FileDownload {
    content: any;
    extension: string;
    mimeType: string;
    fileName: string;
}

export class FileInfoReturn {
    file: FileInfo
    isError: boolean
    error: string
    errorType: string
}