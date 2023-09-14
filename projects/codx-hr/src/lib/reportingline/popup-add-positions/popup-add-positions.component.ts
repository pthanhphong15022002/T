import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Optional,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {
  ApiHttpService,
  AuthService,
  CacheService,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';

@Component({
  selector: 'hr-popup-add-positions',
  templateUrl: './popup-add-positions.component.html',
  styleUrls: ['./popup-add-positions.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupAddPositionsComponent implements OnInit {
  title = 'Thêm mới';
  dialogRef: any;
  dialogData: any;
  user: any;
  functionID: string;
  isAdd = '';
  data: any = null;
  isCorporation;
  formModel;
  formGroup;
  blocked: boolean = false;
  isAfterRender = false;
  grvSetup: any;
  // validate: any = 0;
  @Output() Savechange = new EventEmitter();

  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      mane: 'positionInfo',
    },
    {
      icon: 'icon-info',
      text: 'Mô tả',
      mane: 'description',
    },
  ];

  constructor(
    private auth: AuthService,
    private api: ApiHttpService,
    private cacheService: CacheService,
    private cr: ChangeDetectorRef,
    private notifiSV: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    this.dialogRef = dialog;
    this.dialogData = dt.data;
    //this.isAdd = dt.data.isAddMode;
    //this.title = dt.data.titleMore;
    this.data = JSON.parse(JSON.stringify(dt.data.data));
    // this.functionID = dt.data.function;
    // this.isCorporation = dt.data.isCorporation; // check disable field DivisionID
    this.user = this.auth.userValue;
  }
  ngOnInit(): void {
    this.isAdd = this.dialogData.isAdd;
    this.title = this.dialogData.title;
    this.functionID = this.dialogData.funcID;
    this.formModel = this.dialogRef.formModel;
    this.hrService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName, this.formModel)
      .then((fg) => {
        if (fg) {
          this.formGroup = fg;
          this.formGroup.patchValue(this.data);
          this.isAfterRender = true;
        }
      });
    this.getGrvSetup(this.formModel.formName, this.formModel.gridViewName);
    if (this.isAdd)
      this.blocked = this.dialogRef.dataService.keyField ? true : false;
    else this.blocked = true;
  }
  // get function name

  //get grvSetup
  getGrvSetup(fromName: string, grdViewName: string) {
    this.cacheService
      .gridViewSetup(fromName, grdViewName)
      .subscribe((grv: any) => {
        if (grv) {
          this.grvSetup = grv;
        }
      });
  }
  // value change
  dataChange(e: any, field: string) {
    if (e) {
      if (e?.length == undefined) {
        this.data[field] = e?.data;
      } else {
        this.data[field] = e[0];
        if (field == 'positionID') {
          let itemSelected = e.component?.itemsSelected[0];
          if (itemSelected) {
            if (itemSelected.hasOwnProperty('DepartmentID')) {
              let departmentID = itemSelected['DepartmentID'];
              this.data['departmentID'] = departmentID;
            }
            if (itemSelected.hasOwnProperty('DivisionID')) {
              let departmentID = itemSelected['DivisionID'];
              this.data['divisionID'] = departmentID;
            }
            if (itemSelected.hasOwnProperty('CompanyID')) {
              let departmentID = itemSelected['CompanyID'];
              this.data['companyID'] = departmentID;
            }
          }
        }
      }
    }
  }

  valChange(evt) {
    //this.data.orgUnitID = evt.data.value[0]
  }

  // click save
  OnSaveForm() {
    if (this.formGroup.invalid) {
      this.hrService.notifyInvalid(this.formGroup, this.formModel);
      return;
    }

    let _method = this.isAdd ? 'SaveAsync' : 'UpdateAsync';
    this.api
      .execSv('HR', 'ERM.Business.HR', 'PositionsBusiness', _method, [
        this.data,
        this.functionID,
      ])
      .subscribe((res) => {
        if (this.isAdd) {
          this.dialogRef.dataService.add(res, 0).subscribe();
          this.notifiSV.notifyCode('SYS006');
        }
        else {
          this.notifiSV.notifyCode('SYS007');
          this.dialogRef.dataService.update(res).subscribe();
        }
        this.dialogRef.close(res);
      });
  }

  closePanel() {
    this.dialogRef.close();
  }

  setTile(form) {
    form.title = this.title;
    this.cr.detectChanges();
  }
  // checkValidate() {
  //   var keygrid = Object.keys(this.gridViewSetup);
  //   var keymodel = Object.keys(this.data);
  //   for (let index = 0; index < keygrid.length; index++) {
  //     if (this.gridViewSetup[keygrid[index]].isRequire == true) {
  //       for (let i = 0; i < keymodel.length; i++) {
  //         if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
  //           if (
  //             this.data[keymodel[i]] == null ||
  //             String(this.data[keymodel[i]]).match(/^ *$/) !== null
  //           ) {
  //             this.notifiSV.notifyCode(
  //               'SYS009',
  //               0,
  //               '"' + this.gridViewSetup[keygrid[index]].headerText + '"'
  //             );
  //             this.validate++;
  //           }
  //         }
  //       }
  //     }
  //   }
  // }
}
