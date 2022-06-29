import { ChangeDetectorRef, Component, Input, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthStore, CacheService, ApiHttpService, DialogRef, DialogData, NotificationsService } from 'codx-core';
import { Observable, Subject } from 'rxjs';
import { BS_Ranges } from '../../../models/BS_Ranges.model';
import { rangeLine, RangeLine, RangeLineFormGroup } from '../../../models/task.model';

@Component({
  selector: 'lib-pop-add-ranges',
  templateUrl: './pop-add-ranges.component.html',
  styleUrls: ['./pop-add-ranges.component.css']
})
export class PopAddRangesComponent implements OnInit {
  @ViewChild("add", { static: true }) add: TemplateRef<any>;

  @Input() ranges = new BS_Ranges();
  @Input() rangeLines = new RangeLine();
  @Input() data: [];
  lstRangeLine: RangeLine[];
  lstSaveRangeLine: any;


  title = 'Thêm khoảng thời gian';
  dialog: any;
  isAfterRender = false;
  gridViewSetup: any;
  isAddMode = true;
  isAddLine: boolean = true;
  formName = "";
  gridViewName = "";
  user: any;
  functionID: string;
  action = '';


  constructor(private cache: CacheService, private fb: FormBuilder, private auth: AuthStore,
    private dt: ChangeDetectorRef, private modalService: NgbModal, private api: ApiHttpService,
    private authStore: AuthStore,
    private notiService: NotificationsService,

    @Optional() dialog?: DialogRef,
    @Optional() dd?: DialogData,) {
    this.ranges = {
      ...this.ranges,
      ...dd?.data[0],
    };
    this.action = dd?.data[1];

    this.lstRangeLine = [];
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.functionID = this.dialog.formModel.funcID;
  }

  ngOnInit(): void {
    this.initForm();
    this.initPopup();
    this.cache.gridViewSetup('RangesKanban', 'grvRangesKanban').subscribe(res => {
      if (res)
        this.gridViewSetup = res
    });
    if(this.action==='edit'){
      this.title = 'Chỉnh sửa khoảng giời gian';
      this.openForm(this.ranges, false);
    }
  }

  initForm() {
    this.getFormGroup(this.formName, this.gridViewName).then((item) => {
      this.isAfterRender = true;
      if(this.isAddMode==true){
        this.getAutonumber("TMS034", "BS_RangesKanban", "RangeID").subscribe(key => {
          this.ranges.rangeID = key;
        })
      }
      
    })
  }

  initPopup(dataItem = null) {

    if (dataItem) {
      this
        .getFormGroup("RangeLines", "grvRangeLines")
        .then((item) => {
          this.fb.group(RangeLineFormGroup);
          this.rangeLines.recID = item.value.recID;
          this.rangeLines.rangeID = dataItem.rangeID;
          this.rangeLines.breakName = dataItem.breakName;
          this.rangeLines.breakValue = dataItem.breakValue;
          this.rangeLines.id = dataItem.breakValue;
        });
    }
    else
      this
        .getFormGroup("RangeLines", "grvRangeLines")
        .then((item) => {
          this.fb.group(RangeLineFormGroup);
          this.rangeLines.recID = item.value.recID;
          this.rangeLines.rangeID = "";
          this.rangeLines.breakName = null;
          this.rangeLines.breakValue = null;
          this.rangeLines.id = this.lstRangeLine.length + 1;
        });
  }

  getFormGroup(formName, gridView): Promise<FormGroup> {
    return new Promise<FormGroup>((resolve, reject) => {
      this.cache.gridViewSetup(formName, gridView).subscribe(gv => {
        var model = {};
        if (gv) {
          const user = this.auth.get();
          for (const key in gv) {
            var b = false;
            if (Object.prototype.hasOwnProperty.call(gv, key)) {
              const element = gv[key];
              element.fieldName = element.fieldName.charAt(0).toLowerCase() + element.fieldName.slice(1);
              model[element.fieldName] = [];

              if (element.fieldName == "owner") {
                model[element.fieldName].push(user.userID);
              }
              if (element.fieldName == "createdOn") {
                model[element.fieldName].push(new Date());
              }
              else if (element.fieldName == "stop") {
                model[element.fieldName].push(false);
              }
              else if (element.fieldName == "orgUnitID") {
                model[element.fieldName].push(user['buid']);
              }
              else if (element.dataType == "Decimal" || element.dataType == "Int") {
                model[element.fieldName].push(0);
              }
              else if (element.dataType == "Bool" || element.dataType == "Boolean")
                model[element.fieldName].push(false);
              else if (element.fieldName == "createdBy") {
                model[element.fieldName].push(user.userID);
              } else {
                model[element.fieldName].push(null);
              }
            }
          }
        }
        resolve(this.fb.group(model, { updateOn: 'blur' }));
      });
    });
  }

  getAutonumber(functionID, entityName, fieldName): Observable<any> {
    var subject = new Subject<any>();
    this.api.execSv<any>("SYS", "ERM.Business.AD", "AutoNumbersBusiness",
      "GenAutoNumberAsync", [functionID, entityName, fieldName, null])
      .subscribe(item => {
        if (item)
          subject.next(item);
        else
          subject.next(null);
      });
    return subject.asObservable();
  }

  openPopup(itemdata, isAddLine, index) {
    this.isAddLine = isAddLine;

    if (!itemdata) {
      this.initPopup();
    }
    else if (!itemdata.recID) {
      var item = this.lstRangeLine.find(x => x.id == itemdata.id);
      this.initPopup(item);
    } else {
      if (itemdata.recID) {
        this.initPopup(itemdata);
      }
    }
    this.modalService
      .open(this.add, { centered: true })
      .result.then(
        (result) => {
          if (isAddLine) {
            this.lstRangeLine.push(this.rangeLines);
            console.log(this.lstRangeLine);
            this.rangeLines = new RangeLine();
          } else {
            this.lstRangeLine[index].breakName = this.rangeLines.breakName;
            this.lstRangeLine[index].breakValue = this.rangeLines.breakValue;
            this.dt.detectChanges()
          };
        },
        (reason) => {
          console.log("reason", this.getDismissReason(reason));
        }
      );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return "by pressing ESC";
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return "by clicking on a backdrop";
    } else {
      return `with: ${reason}`;
    }
  }

  openForm(data, isAddMode) {
    if (isAddMode == false) {
      this.isAddMode = false;
      this.rangeLines = new RangeLine();
      this.ranges = new BS_Ranges();

      this.title = 'Chỉnh sửa khoảng thời gian công việc';
      this.api.execSv<any>("BS", "BS", "RangesKanbanBusiness", "GetRangesKanbanAndLinesByIdAsync", data.rangeID).subscribe((res) => {
        if (res) {
          data = res;
          this.ranges = data[0];
          this.lstRangeLine = data[1];
          if (this.lstRangeLine == null) {
            this.lstRangeLine = [];
          }
          this.dt.detectChanges();
        }

      })
    }
    // this.renderer.addClass(popup, 'drawer-on');
  }

  beforeSave(op: any) {
    var data = [];
    op.method = 'AddEditRangeAsync';
    data = [
      this.ranges,
      this.lstRangeLine,
      this.isAddMode
    ];

    op.data = data;
    return true;
  }


  OnSaveForm() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        if (res.save) {
          this.lstSaveRangeLine = [];
          if (this.lstRangeLine != null) {
            for (let item1 of this.lstRangeLine) {
              var rangeline = new rangeLine(
                item1.recID,
                item1.rangeID,
                item1.breakName,
                item1.breakValue
              );
              this.lstSaveRangeLine.push(rangeline);
            }
          }
          // if(this.isAddMode==true)
          //   this.notiService.notify('Thêm mới khoảng thời gian thành công');
          //   else
          //   this.notiService.notify('Chỉnh sửa khoảng thời gian thành công');

        }
      });
      this.dialog.close();

  }

  deletePopup(index) {
    this.lstRangeLine.splice(index, 1);
  }

  valueValue(data) {
    this.rangeLines.breakValue = data.data;
  }
  valueName(data) {
    this.rangeLines.breakName = data.data;
  }

  valueChange(data) {
    if (data.data) {
      this.ranges.rangeName = data.data;
    }
  }

  changeMemo(event) {
    var field = event.field;
    var dt = event.data;
    this.ranges.note = dt?.value ? dt.value : dt;
  }
}


