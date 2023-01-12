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
  user: any;
  functionID: string;
  isAdd = '';
  data: HR_Positions = new HR_Positions();;
  isCorporation;
  formModel;
  blocked:boolean = false;

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
    this.isAdd = dt.data.isAddMode;
    this.title = dt.data.titleMore;
    this.data = dt.data.data;
    this.dialogRef = dialog;
    this.functionID = dt.data.function;
    this.formModel = this.dialogRef.formModel;
    this.isCorporation = dt.data.isCorporation; // check disable field DivisionID
    this.user = this.auth.userValue;

  }
  ngOnInit(): void {
    this.getFucnName(this.functionID);
    //xem lại bật tắt đánh số tự động
    this.blocked = this.data.positionID ? false : true;
  }
  // get function name
  getFucnName(funcID:string){
    if(funcID){
      this.cacheService.functionList(funcID).subscribe(func => {
        if(func)
        {
          this.title = `${this.title} ${func.description}`;
          this.cacheService
          .gridViewSetup(func.formName,func.gridViewName).subscribe((gv: any) => {
            console.log('form', gv);
          });
        }
      });
    }
  }

  // value change
  dataChange(e: any, field: string) {
    if (e) {
      if (e?.length == undefined) {
        this.data[field] = e?.data;
      } else {
        this.data[field] = e[0];
      }
    }
  }
  // click save
  OnSaveForm() {
    let _method = this.isAdd ? "SaveAsync" : "UpdateAsync";
    this.api.execSv(
      'HR', 
      'ERM.Business.HR',
      'PositionsBusiness', 
      _method, 
      [this.data])
      .subscribe((res) => {
        this.dialogRef.close(res);
    });
  }

  closePanel() {
    this.dialogRef.close();
  }
}
