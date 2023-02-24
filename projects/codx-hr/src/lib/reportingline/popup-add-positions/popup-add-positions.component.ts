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
  selector: 'hr-popup-add-positions',
  templateUrl: './popup-add-positions.component.html',
  styleUrls: ['./popup-add-positions.component.css'],
})
export class PopupAddPositionsComponent implements OnInit {
  title = 'Thêm mới';
  dialogRef: any;
  user: any;
  functionID: string;
  isAdd = '';
  data: any = null;
  isCorporation;
  formModel;
  blocked:boolean = false;

  @Output() Savechange = new EventEmitter();

  constructor(
    private auth: AuthService,
    private api: ApiHttpService,
    private cacheService: CacheService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    this.isAdd = dt.data.isAddMode;
    this.title = dt.data.titleMore;
    this.data = dt.data.data;
    this.dialogRef = dialog;
    this.functionID = dt.data.function;
    this.formModel = this.dialogRef.formModel;
    // this.isCorporation = dt.data.isCorporation; // check disable field DivisionID
    this.user = this.auth.userValue;

  }
  ngOnInit(): void {
    this.getFucnName(this.functionID);
    if(this.isAdd)
      this.blocked = this.dialogRef.dataService.keyField ? true : false;
    else
      this.blocked = true;
  }
  // get function name
  getFucnName(funcID:string){
    if(funcID){
      this.cacheService.functionList(funcID).subscribe(func => {
        if(func)
        {
          this.title = `${this.title} ${func.description}`;
          // this.cacheService
          // .gridViewSetup(func.formName,func.gridViewName).subscribe((gv: any) => {
          //   console.log('form', gv);
          // });
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
        // if(field == "positionID"){
        //   let itemSelected = e.component?.itemsSelected[0];
        //   if(itemSelected){
        //     if(itemSelected.hasOwnProperty("DepartmentID"))
        //     {
        //       let departmentID = itemSelected["DepartmentID"];
        //       this.data["departmentID"] = departmentID;
        //     }
        //     if(itemSelected.hasOwnProperty("DivisionID"))
        //     {
        //       let departmentID = itemSelected["DivisionID"];
        //       this.data["divisionID"] = departmentID;
        //     }
        //     if(itemSelected.hasOwnProperty("CompanyID"))
        //     {
        //       let departmentID = itemSelected["CompanyID"];
        //       this.data["companyID"] = departmentID;
        //     }
        //   }
        // }
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
        if(this.isAdd)
          this.dialogRef.dataService.add(res,0).subscribe();
        else
          this.dialogRef.dataService.update(res).subscribe();
        this.dialogRef.close(res);
    });
  }

  closePanel() {
    this.dialogRef.close();
  }
}
