import { ChangeDetectorRef, Component, HostListener, Injector, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { CacheService, CallFuncService, CodxFormComponent, CodxGridviewV2Component, DialogData, DialogRef, FormModel, NotificationsService, UIComponent, Util } from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/public-api';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import {Kowds} from '../kowds.model';
import { DateRangePickerModule } from '@syncfusion/ej2-angular-calendars';
@Component({
  selector: 'lib-popup-ekowds',
  templateUrl: './popup-ekowds.component.html',
  styleUrls: ['./popup-ekowds.component.css']
})
export class PopupEkowdsComponent extends UIComponent implements OnInit{
  @HostListener('click', ['$event.target']) onClick(e) {
    console.log('target click vao', e);
    
    if (this.gridView1) {
      if (this.gridView1.gridRef.isEdit == true) {
        //this.gridView2.isEdit = false;
        //this.gridView2.isAdd = false;
        this.gridView1.endEdit();
      } else {
        //
      }
    }}
  
  dialog: DialogRef;
  actionType: string;
  formModel: FormModel;
  headerText: string;
  daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  dataObj: any;
  columnGrid1: any;
  dataSourceGridView1: any = [];
  loadGridview1 = true;
  vllMode = '1';
  dowCode: any;
  employeeId: string;
  currentYear: any;
  currentMonth: any;
  minDate: any;
  maxDate: any;
  fromDateVal: any;
  toDateVal: any;

  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };

  vllObj1 : any;
  vllObj2 : any;
  selectedDate: any;

  @ViewChild('gridView1') gridView1: CodxGridviewV2Component;

  @ViewChild('tmpGrid1Col1', { static: true })
  tmpGrid1Col1: TemplateRef<any>;
  @ViewChild('tmpGrid1Col2', { static: true })
  tmpGrid1Col2: TemplateRef<any>;
  @ViewChild('headTmpGrid1Col1', { static: true })
  headTmpGrid1Col1: TemplateRef<any>;
  @ViewChild('headTmpGrid1Col2', { static: true })
  headTmpGrid1Col2: TemplateRef<any>;
  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private df: ChangeDetectorRef,
    private hrSevice: CodxHrService,
    private callfunc: CallFuncService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.actionType = data?.data?.actionType;
    this.dataObj = JSON.parse(JSON.stringify(data?.data?.dataObj));
    this.employeeId = JSON.parse(JSON.stringify(data?.data?.employeeId));
    this.dataObj.employeeID = this.employeeId;
    this.currentYear = JSON.parse(JSON.stringify(data?.data?.crrYear));
    this.currentMonth = JSON.parse(JSON.stringify(data?.data?.crrMonth));
    this.dowCode = JSON.parse(JSON.stringify(data?.data?.dowCode));
    let day = JSON.parse(JSON.stringify(data?.data?.selectedDate));
    this.selectedDate = new Date(this.currentYear, this.currentMonth, day);
    this.minDate = new Date(this.currentYear, this.currentMonth, 1);
    this.maxDate =  new Date(this.currentYear, this.currentMonth, this.daysInMonth[this.currentMonth]);
    console.log('current Month', this.currentMonth);
    console.log('current Year', this.currentYear);
    console.log('minDate', this.minDate);
    console.log('maxDate', this.maxDate);
    console.log('formModel', this.formModel);
    console.log('selected Date', this.selectedDate);
  }


  addRowGrid1() {
    let idx = this.gridView1?.dataSource?.length > 0 ? this.gridView1.dataSource.length : 0;
    let temp = new Kowds(Util.uid(), '', '','', this.dowCode);
    this.gridView1.addRow(temp, idx, false, true);

    // if (this.alpolicyObj.policyID) {
    //   this.CheckIfPolicyIDExist(this.alpolicyObj.policyID).subscribe((res) => {
    //     if (res[0] == true) {
    //       // this.originPolicyId = this.alpolicyObj.policyID;
    //       let idx = this.gridView1.dataSource.length;
    //       // if(idx > 1){
    //       //   let data = JSON.parse(JSON.stringify(this.gridView1.dataSource[0]));
    //       //   data.recID = Util.uid();
    //       //   data.days = 0;
    //       //   data.fromValue = 0;
    //       //   this.gridView1.addRow(data, idx);
    //       // }
    //       let data = {
    //         recID: Util.uid(),
    //       };
    //       this.gridView1.addRow(data, idx, false, true);
    //     } else {
    //       this.notify.notifyCode('HR027');
    //     }
    //   });
    // } else {
    //   this.notify.notifyCode('HR027');
    // }
  }

  onInit(): void {
    if (!this.columnGrid1) {
      this.columnGrid1 = [
        {
          field: 'kowCode',
          allowEdit: true,
          controlType: 'combobox',
          dataType: 'int',
          headerTemplate: this.headTmpGrid1Col1,
          referedType: 3,
          referedValue: 'HRKows',
          // template: this.tmpGrid1Col1,
          width: '150',
        },
        {
          field: 'dayNum',
          allowEdit: true,
          controlType: 'text',
          dataType: 'float',
          headerTemplate: this.headTmpGrid1Col2,
          // template: this.tmpGrid1Col2,
          width: '150',
        },
      ];
    }
    this.cache.valueList('HR057').subscribe((res) => {
      console.log('doc cache ', res);
      this.vllObj1 = {...res.datas[0]}
      this.vllObj2 = {...res.datas[1]}
      console.log('2 cai vll vua lay dc', this.vllObj1, this.vllObj2);
    })

  }

  onSaveForm(){
    debugger
  }

  onChangeCalFromTo(evt){
    this.fromDateVal = evt[0]
    this.toDateVal = evt[0]
  }

  onSelectVllVal(evt, data){
    debugger
    if(data == '1'){
      this.vllMode = '1';
    }
    else this.vllMode = '2';
  }

  onEditGrid1(evt) {
    debugger
    // if (!evt.fromValue) {
    //   this.notify.notifyCode('HR023');
    //   setTimeout(() => {
    //     this.GetPolicyDetailByFirstMonthType(
    //       this.alpolicyObj.firstMonthType
    //     ).subscribe((res) => {
    //       this.dataSourceGridView1 = res;
    //     });
    //     this.gridView1.refresh();
    //   }, 200);
    //   return;
    // }
    // if (!evt.days) {
    //   this.notify.notifyCode('HR024');
    //   setTimeout(() => {
    //     this.GetPolicyDetailByFirstMonthType(
    //       this.alpolicyObj.firstMonthType
    //     ).subscribe((res) => {
    //       this.dataSourceGridView1 = res;
    //     });
    //     this.gridView1.refresh();
    //   }, 200);
    //   return;
    // }
    // let index = this.gridView1.dataSource.findIndex(
    //   (v) => v.recID == evt.recID
    // );
    // this.UpdatePolicyDetail(evt).subscribe((res) => {
    //   if (res && res.oldData) {
    //     this.gridView1.gridRef.dataSource[index] = res.oldData;
    //     this.gridView1.refresh();
    //   } else {
    //     this.notify.notifyCode('SYS007');
    //   }
    // });
  }

  onDeleteGrid1(evt) {}

  onAddNewGrid1(evt) {
    debugger
    // if (!evt.fromValue) {
    //   this.notify.notifyCode('HR023');
    //   let legth = this.gridView1.dataSource.length;
    //   let index = legth - 1;
    //   setTimeout(() => {
    //     this.gridView1.deleteRow(this.gridView1.dataSource[index], true);
    //     this.gridView1.dataSource.splice(index, 1);
    //     (this.gridView1.gridRef.dataSource as any).splice(index, 1);
    //     this.gridView1.refresh();
    //   }, 200);
    //   return;
    // }
    // if (!evt.days) {
    //   this.notify.notifyCode('HR024');
    //   let legth = this.gridView1.dataSource.length;
    //   let index = legth - 1;
    //   setTimeout(() => {
    //     this.gridView1.deleteRow(this.gridView1.dataSource[index], true);
    //     // this.gridView1.dataSource.splice(index, 1);
    //     (this.gridView1.gridRef.dataSource as any).splice(index, 1);
    //     this.gridView1.refresh();
    //   }, 200);
    //   return;
    // }
    // evt.policyID = this.alpolicyObj.policyID;
    // evt.policyType = this.alpolicyObj.policyType;
    // evt.itemType = 'ALFirstMonthType';
    // evt.itemSelect = this.alpolicyObj.firstMonthType;
    // this.AddPolicyDetail(evt).subscribe((res) => {
    //   if (res) {
    //     this.lstPolicyDetailRecID.push(res.recID);
    //     this.notify.notifyCode('SYS006');
    //   } else {
    //     (this.gridView1?.dataService as CRUDService)?.remove(evt).subscribe();
    //     this.gridView1.deleteRow(evt, true);
    //     this.gridView1.refresh();
    //   }
    // });
  }

  clickMF(event, data) {
    // this.notify.alertCode('SYS030').subscribe((x) => {
    //   if (x.event?.status == 'Y') {
    //     this.DeletePolicyDetail(data.recID).subscribe((res) => {
    //       if (res == true) {
    //         this.notify.notifyCode('SYS008');
    //           (this.gridView1?.dataService as CRUDService)
    //             ?.remove(data)
    //             .subscribe();
    //           this.gridView1.deleteRow(data, true);
            
    //       }
    //     });
    //   }
    // });
  }

  changeDataMF(evt) {
    for (let i = 0; i < evt.length; i++) {
      let funcIDStr = evt[i].functionID;
      if (funcIDStr == 'SYS04' || funcIDStr == 'SYS03') {
        evt[i].disabled = true;
      } else if (funcIDStr == 'SYS02') {
        evt[i].disabled = false;
      }
    }
  }

  addEmpKow(){
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.PR',
      'KowDsBusiness',
      'AddEmpKowAsync',
      [this.fromDateVal, this.toDateVal, this.dataObj.employeeID, this.dataObj, this.vllMode]
    );
  }

  // deleteEmpKow(data){
  //   return this.api.execSv<any>(
  //     'HR',
  //     'ERM.Business.PR',
  //     'KowDsBusiness',
  //     'DeleteEmpKowAsync',
  //     [data, this.filterMonth, this.filterYear]
  //   );
  // }
}


