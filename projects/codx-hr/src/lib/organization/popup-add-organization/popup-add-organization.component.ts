import {
  Component,
  OnInit,
  Optional,
} from '@angular/core';
import { updateCell } from '@syncfusion/ej2-angular-spreadsheet';
import {
  ApiHttpService,
  AuthService,
  CacheService,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';
@Component({
  selector: 'lib-popup-add-organization',
  templateUrl: './popup-add-organization.component.html',
  styleUrls: ['./popup-add-organization.component.css'],
})
export class PopupAddOrganizationComponent implements OnInit{
  // input
  funcID:string = "";
  action:any = null;
  headerText:string ="";
  isModeAdd:boolean = false;
  dialogData:any = null;
  dialogRef:DialogRef = null;
  // 
  func:any = null;
  grdViewSetup:any = null;
  user:any = null;
  data:any = null;
  parameterHR: any = null;

  constructor(
    private auth: AuthService,
    private cache:CacheService,
    private notifiSV: NotificationsService,
    private api: ApiHttpService,

    @Optional() dt?: DialogData,
    @Optional() dialogRef?: DialogRef,
  ) 
  {
    this.user = this.auth.userValue;
    this.dialogData = dt.data;
    this.dialogRef = dialogRef;
  }
  ngOnInit(): void {
    if(this.dialogData)
    {
      this.funcID = this.dialogData.funcID;
      this.action = this.dialogData.action;
      this.data = this.dialogData.data;
      this.isModeAdd = this.dialogData.isModeAdd;
      if(this.funcID)
      {
        this.getSetup(this.funcID);
        this.getParamerAsync(this.funcID);
      }
    }
  }

  // get setup
  getSetup(funcID:string){
    if(funcID)
    {
      this.cache.functionList(funcID)
      .subscribe((func:any) => {
        if(func)
        {
          this.func = func;
          this.headerText = this.action.text +" "+ func.description;
          if(func?.formName && func?.gridViewName){
            this.cache.gridViewSetup(func.formName,func.gridViewName)
            .subscribe((grd:any) => {
              if(grd){
                this.grdViewSetup = grd;
              }
            });
          }
        }
      });
    }
  }
  // get parameter auto number
  getParamerAsync(funcID: string) {
    if (funcID) {
      this.api
        .execSv(
          'SYS',
          'ERM.Business.AD',
          'AutoNumberDefaultsBusiness',
          'GenAutoDefaultAsync',
          [funcID]
        ).subscribe((res: any) => {
          if (res) {
            this.parameterHR = JSON.parse(JSON.stringify(res));
          }
        });
    }
  }
  // value change
  valueChange(event:any){
    if(event)
    {
      this.data[event.field] = event.data;
    }
  }
  // btn save
  onSave() 
  {
    if(this.action.functionID === "SYS03")
    {
      this.editData(this.data);
    }
    else
    {
      this.saveData(this.data);
    }
  }

  // insert
  saveData(data:any){
    if(data){
      this.api
        .execAction<boolean>(
         "HR_OrganizationUnits",
          [data],
          'SaveAsyncLogic',
          true)
          .subscribe((res:any) =>{
            if(!res?.error){
              this.notifiSV.notifyCode("SYS006");
              this.dialogRef.close(data);
            }
            else
            {
              this.notifiSV.notifyCode("SYS023");
              this.dialogRef.close(null);
            }
        });
    }
  }
  // edit
  editData(data:any){
    if(data){
      debugger
      this.api
        .execAction<boolean>(
         "HR_OrganizationUnits",
          [data],
          'UpdateAsyncLogic',
          true
        )
        .subscribe((res:any) =>{
            if(!res?.error){
              this.notifiSV.notifyCode("SYS007");
              this.dialogRef.close(null);
            }
            else
            {
              this.notifiSV.notifyCode("SYS021");
              this.dialogRef.close(null);
            }
        });
    }
  }
}
