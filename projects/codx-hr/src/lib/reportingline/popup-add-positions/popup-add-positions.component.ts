import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Optional,
  Output,
} from '@angular/core';
import {
  ApiHttpService,
  AuthService,
  AuthStore,
  CacheService,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
import { HR_Positions } from '../../model/HR_Positions.module';

@Component({
  selector: 'lib-popup-add-positions',
  templateUrl: './popup-add-positions.component.html',
  styleUrls: ['./popup-add-positions.component.css'],
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
  isCorporation;
  formModel;
  @Output() Savechange = new EventEmitter();

  constructor(
    private detectorRef: ChangeDetectorRef,
    private notiService: NotificationsService,
    private auth: AuthService,
    private api: ApiHttpService,
    private cacheService: CacheService,
    private reportingLine: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    debugger
    this.action = dt.data.isAddMode;
    this.title = dt.data.titleMore;
    this.data = dt.data.data;
    this.dialogRef = dialog;
    this.functionID = this.dialogRef.formModel.funcID;
    this.formModel = this.dialogRef.formModel;
    this.isCorporation = dt.data.isCorporation;
    this.position = this.data;
    this.user = this.auth.userValue;

  }

  ngOnInit(): void {
    this.getFucnName(this.functionID);
    if (this.action != 'edit') {
      this.getParamerAsync(this.functionID);
    }
    
  }
  // get function name
  getFucnName(funcID:string){
    if(funcID){
      this.cacheService.functionList(funcID).subscribe(func => {
        if(func)
        {
          this.title = `${this.title} ${func.descriptions}`;
          this.cacheService
          .gridViewSetup(func.formName,func.gridViewName).subscribe((gv: any) => {
            console.log('form', gv);
          });
        }
      });
    }
  }
  paramaterHR: any = null;
  getParamerAsync(funcID: string) {
    if (funcID) {
      this.api
        .execSv(
          'SYS',
          'ERM.Business.AD',
          'AutoNumberDefaultsBusiness',
          'GenAutoDefaultAsync',
          [funcID]
        )
        .subscribe((res: any) => {
          if (res) {
            this.paramaterHR = res;
            if (this.paramaterHR.stop) return;
            else {
              let funcID = this.dialogRef.formModel.funcID;
              let entityName = this.dialogRef.formModel.entityName;
              let fieldName = 'PositionID';
              if (funcID && entityName) {
                this.getDefaultPositionID(funcID, entityName, fieldName);
              }
            }
          }
        });
    }
  }
  positionID: string = '';
  getDefaultPositionID(
    funcID: string,
    entityName: string,
    fieldName: string,
    data: any = null
  ) {
    if (funcID && entityName && fieldName) {
      this.api
        .execSv(
          'SYS',
          'ERM.Business.AD',
          'AutoNumbersBusiness',
          'GenAutoNumberAsync',
          [funcID, entityName, fieldName, null]
        )
        .subscribe((res: any) => {
          if (res) {
            this.positionID = res;
            this.data.positionID = res;
            this.detectorRef.detectChanges();
          }
        });
    }
  }
  valueChange(event: any) {}

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
    data = [this.position, this.isNew];
    op.data = data;
    return true;
  }

  OnSaveForm() {
    if (this.action) {
      this.isNew = this.action === 'add' ? true : false;
      this.api
        .execSv('HR', 'ERM.Business.HR', 'PositionsBusiness', 'UpdateAsync', [
          this.data,
          this.isNew,
        ])
        .subscribe((res) => {
          if (res) {
            this.dialogRef.close(res);
          } else {
            this.notiService.notify('Error');
            this.dialogRef.close();
          }
        });
    }
  }

  addPosition() {
    this.dialogRef.dataService
      .save((opt: any) => {
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
    this.dialogRef.close();
  }
}
