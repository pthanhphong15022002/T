export class IETables
{
    recID: string = "";
    sessionID :string = "";
    sourceTable: string = "";
    destinationTable : string = "";
    parentEntity : string = "";
    mappingTemplate : string = "";
    firstRowHeader : boolean = false;
    firstCell : string = "";
    importRule : string = "";
    processIndex : number = null;
    isSummary : boolean = false;
    isError : boolean = false;
    filterID : string;
    predicate : string;
    dataValues : string;
    operation : string;
    createdOn : Date;
    createdBy : string;
    modifiedOn : Date;
    modifiedBy : string;
    owner : string;
    buid : string;
    employeeID : string;
    positionID : Date;
    orgUnitID : string;
    divisionID : Date;
    mappingName : "+"
}