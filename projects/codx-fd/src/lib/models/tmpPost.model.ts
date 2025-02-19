export class tmpTagObjects {
    memberType?: string;
    userID?: string;
    objectType?: string;
    objectID?: string;
    objectName?: string;
    full?: boolean;
    create?: boolean;
    read?: boolean;
    update?: boolean;
    assign?: boolean;
    delete?: boolean;
    share?: boolean;
    upload?: boolean;
    download?: boolean;
    isActive?: boolean;
    isSharing?: boolean;
    startDate?: Date;
    endDate?: Date;
    createdOn?: Date;
    createdBy?: string;
    modifiedOn?: Date;
    modifiedBy?: string;
}

export class tmpVotes {
    voteType?: string;
    createdName?: string;
    positionName?: string;
    orgUnitName?: string;
    createdOn?: Date;
    createdBy?: string;
}

export class SubFolder {
    recID?: string;
    id?: string;
    level?: string;
    type?: string;
    format?: string;
    description?: string;
    objectD?: string;
    createdOn?: string;
}

export class View {
    comment?: string;
    rating?: string;
    viewDate?: string;
    objectID?: string;
}

export class PermissionClient {
    objectName?: string;
    objectID?: string;
    objectType?: string;
    recID?: string;
    icon?: string;
    email?: string;
    type?: string;
    full?: boolean;
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
    share?: boolean;
    upload?: boolean;
    assign?: boolean;
    isSharing?: boolean;
    download?: boolean;
    isSystem?: boolean;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    title?: string;
    content?: string;
    revisionNote?: string;
}
export class History {
    recID?: string;
    fileName?: string;
    extension?: string;
    filePath?: string;
    pathDisk?: string;
    mimeType?: string;
    fileSize?: string;
    thumbnail?: string;
    folderPath?: string;
    folderId?: string;
    objectID?: string;
    objectType?: string;
    category?: string;
    tags?: string;
    subject?: string;
    topics?: string;
    language?: string;
    description?: string;
    author?: string;
    publisher?: string;
    publishYear?: string;
    publishDate?: string;
    copyRights?: string;
    owner?: string;
    bUID?: string;
    createdOn?: string;
    createdBy?: string;
    revisionNote?: string;
}
export class DataUploadClient {
    revisionNote?: string;
    recID?: string;
    fileName?: string;
    fileSize?: number;
    avatar?: string;
    thumbnail?: string;
    createdBy?: string;
    createdOn?: string;
    extension?: string;
    size?: string;
    type?: string;
    funcId?: string;
    folderName?: string;
    tags?: string;
    title?: string;
    subject?: string;
    objectType?: string;
    objectId?: string;
    category?: string;
    language?: string;
    description?: string;
    author?: string;
    publisher?: string;
    publishYear?: string;
    publishDate?: string;
    copyrights?: string;
    data?: string;
    folderId?: string;
    folderType?: string;
    copyrightsControl?: boolean;
    approval?: boolean;
    revision?: boolean;
    physical?: boolean;
    checkSecurity?: boolean;
    location?: string;
    approvers?: string;
    form?: string;
    titleEmail?: string;
    contentEmail?: string;
    hasSubFolder?: boolean;
    reWrite?: boolean;
    sendEmail?: boolean;
    postBlog?: boolean;
    urlPath?: string;
    urlShare?: string;
    comment?: string;
    icon?: string;
    excerpts?: string;
    uploadId?: string;
    relation?: string;
    source?: string;
    mimeType?: string;
    referType?: string;
    permissions?: PermissionClient[] = [];
    toPermission?: PermissionClient[] = [];
    byPermission?: PermissionClient[] = [];
    ccPermission?: PermissionClient[] = [];
    bccPermission?: PermissionClient[] = [];
    history?: History[] = [];
    views?: View[] = [];
    subFolder?: SubFolder[] = [];
    getIdUser?: string;
}
export class tmpCardDetail {
    recID?: string;
    cardType?: string;
    cardNo?: string;
    receiver?: any;
    sender?: any;
    senderID?: string;
    senderName?: string;
    receiverID?: string;
    receiverName?: string;
    postionName?: string;
    situation?: string;
    rating?: string;
    pattern?: any;
    status?: string;
    createdOn?: Date;
    behavior?: any;
    point?: number;
    temp?: string;
    hasGift?: boolean;
    hasPoint?: boolean;
    approveStatus?: string;
    attachment?: string;
    industry?: string;
    patternID?: string;
    headerColor?: string;
    textColor?: string;
    backgroundColor?: string;
    background?: string;
    tagType?: string;
}
export class tmpWPNews {
    recID?: string;
    category?: string;
    subject?: string;
    subContent?: string;
    createdOn?: Date;
}

export class tmpPost {
    recID?: string;
    comments?: string;
    content?: string;
    subject?: string;
    newsType?: string;
    views?: number;
    subContent?: string;
    contents?: string;
    allowShare?: boolean;
    category?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    parentID?: string;
    refID?: string;
    permissions?: tmpTagObjects[] = [];
    refType?: string;
    votes?: tmpVotes[] = [];
    shareControl?: string;
    createdName?: string;
    positionName?: string;
    orgUnitName?: string;
    approveControl?: string;
    approveStatus?: string;
    approveLevels?: string;
    approver?: string;
    approverOn?: Date;
    stop?: boolean;
    publishOn?: Date;
    createdOn?: Date;
    createdBy?: string;
    modifiedOn?: Date;
    modifiedBy?: string;
    myVoteType?: string;
    myVoted?: boolean;
    listVoteType?: [];
    totalVote?: number;
    isShowComment?: boolean = false;
    isShowShare?: boolean = false;
    totalComment?: number;
    listComment?: tmpPost[] = [];
    cardID?: string;
    card?: tmpCardDetail;
    isFeedBack?: boolean;
    totalSubComment?: number;
    isShowSubComment?: boolean = false;
    shareIcon?: string;
    shareText?: string;
    shareName?: string;
    listShare?: tmpTagObjects[] = [];
    listTag?: tmpTagObjects[] = [];
    tag?: number;
    tagName?: string;
    shares?: tmpPost;
    news?: tmpWPNews;
    images?: number;
    files?: DataUploadClient[] = [];
    attachments?: number;
}