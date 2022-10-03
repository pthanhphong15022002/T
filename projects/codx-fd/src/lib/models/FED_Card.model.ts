import { FD_Permissions } from "./FD_Permissionn.model";

export class FED_Card {
    recID: string;
    cardType: string;
    receiver: string;
    sender: string;
    behavior: string;
    category: string;
    groupID: string;
    situation: string;
    time: any;
    action: string;
    result: string;
    comment: string;
    rating: string;
    pattern: string;
    status: string;
    approve: string;
    level: string;
    feedback: string;
    industry: string;
    evaluate: string;
    attachment: string;
    hasPoints: boolean;
    hasGifts: boolean;
    countLikes: number;
    countComments: number;
    isMulti: boolean;
    refType: string;
    refID: string;
    year: number;
    createdOn: any;
    createdBy: string;
    modifiedOn: any;
    modifiedBy: string;
    approveStatus: string;
    permissions: FD_Permissions[];
    //Others
    functionID: string;
    entityName: string;
    entityPer: string;
    files: any;
    giftID: any;
    gifts: any;
    totalGift: number;
    coins: number;
    totalPoint: number;
    shareds: string;
    transType: string;
    tagType: string;
    shareControl:string;
    listShare:any[];
    objectType:string ="";

}
