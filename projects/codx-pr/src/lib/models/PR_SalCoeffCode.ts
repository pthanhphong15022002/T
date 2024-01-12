export class PR_SalCoeffCode
{
    recID:string;
    employeeID:string;
    dowCode:string;
    coeffCode:string;
    coefficient:number;
    write:boolean;
    update:boolean;
    delete:boolean;
    constructor(recID, employeeID, dowCode, coeffCode, coefficient){
        this.recID = recID;
        this.employeeID = employeeID;
        this.dowCode = dowCode;
        this.coeffCode = coeffCode;
        this.coefficient = coefficient;
        this.write = true;
        this.update = true;
        this.delete = true;
    }
}
