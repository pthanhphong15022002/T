import { ChangeDetectorRef, Component, EventEmitter, OnInit, Optional, Output } from '@angular/core';
import { ApiHttpService, AuthService, AuthStore, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
import { HR_Positions } from '../../model/HR_Positions.module';

@Component({
  selector: 'lib-popup-add-positions',
  templateUrl: './popup-add-positions.component.html',
  styleUrls: ['./popup-add-positions.component.css']
})
export class PopupAddPositionsComponent implements OnInit {
  title = 'Thêm mới';
  dialogRef: any;
  isNew: boolean = true;
  user: any;
  functionID: string;
  action = '';
  position: HR_Positions = new HR_Positions();
  data: any;
  @Output() Savechange = new EventEmitter();

  constructor(
    private detectorRef: ChangeDetectorRef,
    private notiService: NotificationsService,
    private auth: AuthService,
    private api: ApiHttpService,
    private reportingLine: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData,
  ) {
    this.action = dt.data;
    this.dialogRef = dialog;
    this.functionID = this.dialogRef.formModel.funcID;
    this.data = dialog.dataService!.dataSelected;
    this.position = this.data;
  }

  ngOnInit(): void {
    this.user = this.auth.userValue;
    this.getParamerAsync(this.functionID);
    if (this.action === 'edit') {
      this.title = 'Chỉnh sửa';
      this.isNew = false;
    }
    if (this.action === 'copy') {
      this.title = 'Sao chép';
    }
  }


  paramaterHR:any = null;
  getParamerAsync(funcID:string){
    if(funcID)
    {
      this.api.execSv("SYS",
      "ERM.Business.AD",
      "AutoNumberDefaultsBusiness",
      "GenAutoDefaultAsync",
      [funcID])
      .subscribe((res:any) => {
        if(res)
        {
          console.log('paramaterHR: ',res);
          this.paramaterHR = res;
          if(this.paramaterHR.stop) return;
          else
          {
            let funcID = this.dialogRef.formModel.funcID;
            let entityName = this.dialogRef.formModel.entityName;
            let fieldName = "PositionID";
            if(funcID && entityName)
            {
              this.getDefaultPositionID(funcID,entityName,fieldName);
            }
          }
        }
      })
    }
  }
  positionID:string = "";
  getDefaultPositionID(funcID:string,entityName:string,fieldName:string,data:any = null)
  {
    if(funcID && entityName && fieldName){
      this.api.execSv(
        "SYS", 
        "ERM.Business.AD",
        "AutoNumbersBusiness",
        "GenAutoNumberAsync",
        [funcID, entityName, fieldName, null])
        .subscribe((res:any) =>{
          if(res)
          {
            this.positionID = res;
            this.data.OrgUnitID = res;
            this.detectorRef.detectChanges();
          }
        })
    }
    
  }
  valueChange(event:any){
    
  }

  dataChange(e: any, field: string) {
    if (e) {
      if (e?.length == undefined) {
        this.position[field] = e?.data;
      } else {
        this.position[field] = e[0];
      }
    }
  }

  beforeSave(op: any) {
    var data = [];
    op.methodName = 'UpdateAsync';
    op.className = 'PositionsBusiness';
    if (this.action === 'add') {
      this.isNew = true;
    } else if (this.action === 'edit') {
      this.isNew = false;
    }
    data = [
      this.position,
      this.isNew
    ];
    op.data = data;
    return true;
  }

  OnSaveForm() {

    this.api.exec("ERM.Business.HR", "PositionsBusiness", "UpdateAsync", [this.data, this.isNew]).subscribe(res => {
      if (res) {
        if (res) {
          if (this.isNew) {
            this.reportingLine.reportingLineComponent.addPosition(res);
          }
          else {
            this.reportingLine.positionsComponent.updatePosition(res);
          }
          this.Savechange.emit(res);
          this.dialogRef.close(res);
        }
        else {
          this.notiService.notify("Error");
        }
      }
    });
  }

  addPosition() {
    var t = this;
    this.dialogRef.dataService.save((opt: any) => {
      opt.data = [this.position];
      return true;
    })
      .subscribe((res) => {
        if (res.save) {
          this.dialogRef.close();
        }
      });
  }

  closePanel() {
    this.dialogRef.close()
  }
}
