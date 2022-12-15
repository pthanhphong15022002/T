import {
  Component,
  OnInit,
  Optional,
} from '@angular/core';
import { updateCell } from '@syncfusion/ej2-angular-spreadsheet';
import {
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
  constructor(
    private auth: AuthService,
    private cache:CacheService,
    private notifiSV: NotificationsService,
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
      debugger
      this.funcID = this.dialogData.funcID;
      this.action = this.dialogData.action;
      this.data = this.dialogData.data;
      this.isModeAdd = this.dialogData.isModeAdd;
      if(this.funcID)
      {
        this.getSetup(this.funcID);
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
          console.log(func);
          this.func = func;
          this.headerText = this.action +" "+ func.description;
          if(func?.formName && func?.gridViewName){
            this.cache.gridViewSetup(func.formName,func.gridViewName)
            .subscribe((grd:any) => {
              if(grd){
                this.grdViewSetup = grd;
                console.log(grd);
              }
            });
          }
        }
      });
    }
  }

  // value change
  valueChange(event:any){
    debugger
    if(event)
    {
      this.data[event.field] = event.data;
    }
  }
  // btn save
  onSave() {

  }

}
