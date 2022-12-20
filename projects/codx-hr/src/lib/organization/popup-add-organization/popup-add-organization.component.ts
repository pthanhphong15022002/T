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
  action:string = "";
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
          this.headerText = this.action +" "+ func.description;
          if(func?.formName && func?.gridViewName){
            this.cache.gridViewSetup(func.formName,func.gridViewName)
            .subscribe((grd:any) => {
              if(grd){
                console.log(grd);
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
    console.log(this.data);
    this.api.execSv("HR","ERM.Business.HR","OrganizationUnitsBusiness","InsertOrgUnitAsync",[this.data])
    .subscribe((res:any[]) => {
      if(res[0]){
        let result = [res[1],res[2]];
        this.notifiSV.notifyCode("SYS007");
        this.dialogRef.close(result);
      }
      else
      {
        this.notifiSV.notifyCode("SYS021");
      }
    });
  }

}
