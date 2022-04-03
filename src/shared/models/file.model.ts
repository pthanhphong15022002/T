export class tmpFile {
    id: string;
    category: string;
    fileName: string;
    filePath: string;
    fileBytes: any;
    fileSize: number;
    avatar: string;
    createdOn: any;
}
/*export class FileInfo {
    recId: string;
    fullName: string;
    owner: string;
    pathDisk: string;
    parentId: string;
}*/
export class FileInfo {
    recID: string;
    fullName: string;
    fileName: string;
    extension: string;
    pathDisk: string;
    highlight: string;
    owner: string;
    content: string;
    parentId: string;
    rating: any;
    version: any;
    counting: any;
    thumbnail: string;
    bookmark: any;
}

export class FileUpload {
    fileName: string;
    avatar: string;
    thumbnail: string;
    userName: string;
    uploadDate: any;
    extension: string;
    size: any;
    type: any;
    fullName: string;
    tags: any;
    subject: any;
    objectType: any;
    objectID: any;
    funcId: any;
    language: any;
    description: string;
    author: string;
    publisher: string;
    publisherYear: any;
    publisherDate: any;
    copyright: string;
    data: string;
    folderId: string;
    permission: Permission[];
}

export class Permission {
    recID: string;
    name: string;
    typeId: string;
    fullRight: boolean;
    createRight: boolean
    readRight: boolean;
    updateRight: boolean;
    deleteRight: boolean;
    shareRight: boolean;
    uploadRight: boolean;
    downloadRight: boolean;
    icon: string;
    fromDate: any;
    toDate: any;
}

export class FileDownload {
    content: any;
    extension: string;
    mimeType: string;
    fileName: string;
    objectID: string;
}

export class FileInfoReturn {
    file: FileInfo
    isError: boolean
    error: string
    errorType: string
}

export class FolderInfo {
    recID: string;
    fullName: string;
    owner: string;
    pathDisk: string;
    parentId: string;
    thumbnail: string;
    level: string;
    allowAdd: any;
    AllowDelete: any;
    AllowEdit: any;
    typeMenu: any;
    bookmark: any;
    hasChild: any;
}
