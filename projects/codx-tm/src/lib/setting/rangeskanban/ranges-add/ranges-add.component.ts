import { Component, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { DialogRef, FormModel, CallFuncService, DialogModel, Util } from 'codx-core';
import { RangeLine } from '../../../models/task.model';

@Component({
  selector: 'ranges-add',
  templateUrl: './ranges-add.component.html',
  styleUrls: ['./ranges-add.component.css']
})
export class PopAddRangesComponent implements OnInit {
  rangeLines = new RangeLine();
  lstRangeLine: RangeLine[];
  title = 'Thêm khoảng thời gian';
  range: any;
  dialog: DialogRef;

  formModelRangeLine: FormModel = {
    formName: 'RangeLines',
    gridViewName: 'grvRangeLines',
  };

  constructor(
    // private cache: CacheService, private fb: FormBuilder, private auth: AuthStore,
    // private dt: ChangeDetectorRef, private modalService: NgbModal, private api: ApiHttpService,
    // private authStore: AuthStore,
    // private notiService: NotificationsService,
    private callfc: CallFuncService,
    @Optional() dialog?: DialogRef) {
    // this.ranges = {
    //   ...this.ranges,
    //   ...dd?.data[0],
    // };
    // this.action = dd?.data[1]; //lấy edit để mở form edit

    this.lstRangeLine = [];
    this.dialog = dialog;
    this.range = dialog.dataService!.dataSelected;
    this.formModelRangeLine.userPermission = dialog.formModel.userPermission;
    // this.user = this.authStore.get();
    // this.functionID = this.dialog.formModel.funcID;
  }

  ngOnInit(): void {
    // this.initForm();
    // this.initPopup();
    // this.cache.gridViewSetup('RangesKanban', 'grvRangesKanban').subscribe(res => {
    //   if (res)
    //     this.gridViewSetup = res
    // });
    // if (this.action === 'edit') {
    //   this.title = 'Chỉnh sửa khoảng giời gian';
    //   this.openForm(this.ranges, false);
    // }
  }

  // initForm() {
  //   this.getFormGroup(this.formName, this.gridViewName).then((item) => {
  //     this.isAfterRender = true;
  //     if (this.isAddMode == true) {
  //       this.getAutonumber("TMS034", "BS_RangesKanban", "RangeID").subscribe(key => {
  //         this.ranges.rangeID = key;
  //       })
  //     }

  //   })
  // }

  // initPopup(dataItem = null) {

  //   if (dataItem) {
  //     this
  //       .getFormGroup("RangeLines", "grvRangeLines")
  //       .then((item) => {
  //         this.fb.group(RangeLineFormGroup);
  //         this.rangeLines.recID = item.value.recID;
  //         this.rangeLines.rangeID = dataItem.rangeID;
  //         this.rangeLines.breakName = dataItem.breakName;
  //         this.rangeLines.breakValue = dataItem.breakValue;
  //         this.rangeLines.id = dataItem.breakValue;
  //       });
  //   }
  //   else
  //     this
  //       .getFormGroup("RangeLines", "grvRangeLines")
  //       .then((item) => {
  //         this.fb.group(RangeLineFormGroup);
  //         this.rangeLines.recID = item.value.recID;
  //         this.rangeLines.rangeID = "";
  //         this.rangeLines.breakName = null;
  //         this.rangeLines.breakValue = null;
  //         this.rangeLines.id = this.lstRangeLine.length + 1;
  //       });
  // }

  // getFormGroup(formName, gridView): Promise<FormGroup> {
  //   return new Promise<FormGroup>((resolve, reject) => {
  //     this.cache.gridViewSetup(formName, gridView).subscribe(gv => {
  //       var model = {};
  //       if (gv) {
  //         const user = this.auth.get();
  //         for (const key in gv) {
  //           var b = false;
  //           if (Object.prototype.hasOwnProperty.call(gv, key)) {
  //             const element = gv[key];
  //             element.fieldName = element.fieldName.charAt(0).toLowerCase() + element.fieldName.slice(1);
  //             model[element.fieldName] = [];

  //             if (element.fieldName == "owner") {
  //               model[element.fieldName].push(user.userID);
  //             }
  //             if (element.fieldName == "createdOn") {
  //               model[element.fieldName].push(new Date());
  //             }
  //             else if (element.fieldName == "stop") {
  //               model[element.fieldName].push(false);
  //             }
  //             else if (element.fieldName == "orgUnitID") {
  //               model[element.fieldName].push(user['buid']);
  //             }
  //             else if (element.dataType == "Decimal" || element.dataType == "Int") {
  //               model[element.fieldName].push(0);
  //             }
  //             else if (element.dataType == "Bool" || element.dataType == "Boolean")
  //               model[element.fieldName].push(false);
  //             else if (element.fieldName == "createdBy") {
  //               model[element.fieldName].push(user.userID);
  //             } else {
  //               model[element.fieldName].push(null);
  //             }
  //           }
  //         }
  //       }
  //       resolve(this.fb.group(model, { updateOn: 'blur' }));
  //     });
  //   });
  // }

  // getAutonumber(functionID, entityName, fieldName): Observable<any> {
  //   var subject = new Subject<any>();
  //   this.api.execSv<any>("SYS", "ERM.Business.AD", "AutoNumbersBusiness",
  //     "GenAutoNumberAsync", [functionID, entityName, fieldName, null])
  //     .subscribe(item => {
  //       if (item)
  //         subject.next(item);
  //       else
  //         subject.next(null);
  //     });
  //   return subject.asObservable();
  // }

  openPopup(template: any, data = null) {
    this.dialog.dataService.save().subscribe(res => {
      if (res.save != null) {
        if (data) {
          let rl = this.lstRangeLine.find(function (x) { return x => x.recID == data.recID });
          this.rangeLines = data;
          if (!rl)
            this.lstRangeLine.push(data);
        }
        else {
          this.rangeLines.recID = Util.uid();
          this.lstRangeLine.push(this.rangeLines);
        }

        let dialog = this.callfc.openForm(template, '', 500, 400);
        dialog.closed.subscribe(res => {
          this.rangeLines = new RangeLine();
        })
      }
    });
  }


  onSave() {
    this.dialog.dataService
      .save()
      .subscribe(res => {
        if (res && !res.error) {
          this.dialog.close();
        }
      });
  }

  deletePopup(index) {
    this.lstRangeLine.splice(index, 1);
  }

  valueChange(data) {
    this.rangeLines[data.field] = data.data;
  }
}


