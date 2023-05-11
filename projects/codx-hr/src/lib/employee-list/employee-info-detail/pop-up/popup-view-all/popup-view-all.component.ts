import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { Component, Input, OnInit, ViewChild, Injector, ChangeDetectorRef, Optional, TemplateRef, AfterViewInit } from '@angular/core';
import { CRUDService, CallFuncService, CodxFormComponent, CodxGridviewComponent, DataService, DialogData, DialogRef, NotificationsService, SidebarModel, SortModel, UIComponent } from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/lib/codx-hr.service';
import { PopupEPassportsComponent } from 'projects/codx-hr/src/lib/employee-profile/popup-epassports/popup-epassports.component';

@Component({
  selector: 'lib-popup-view-all',
  templateUrl: './popup-view-all.component.html',
  styleUrls: ['./popup-view-all.component.css']
})
export class PopupViewAllComponent  extends UIComponent implements OnInit{
  rowCount: any;
  funcID: any;
  employeeId: any;
  sortModel: SortModel;
  headerText : any;
  dataService: DataService;
  columnGrid: any;
  hasFilter: any;
  formModel: any;
  formGroup: any;
  
  //#region funcID
  ePassportFuncID = 'HRTEM0202';

  //#endregion

  //#region columnGrid
  passportColumnGrid: any
  //#endregion

  //#region headerText
  passportHeaderText: any
  //#endregion

  ops = ['y'];

  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('gridView') gridView: CodxGridviewComponent;
  @ViewChild('filterPassport', { static: true }) filterPassport: TemplateRef<any>;
  @ViewChild('customeHeader', { static: true }) customeHeader: TemplateRef<any>;
  @ViewChild('filter', { static: true }) filter: TemplateRef<any>;

  // Column grid viewchild
  @ViewChild('passportCol1', { static: true }) passportCol1: TemplateRef<any>;
  @ViewChild('passportCol2', { static: true }) passportCol2: TemplateRef<any>;

  dialogRef: any;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    private df: ChangeDetectorRef,
    @Optional() data?: DialogData,
    @Optional() dataRef?: DialogRef

  ){
    super(injector);
    this.dialogRef = dataRef;
    this.funcID = data?.data?.funcID;
    this.employeeId = data?.data?.employeeId;
    this.headerText = data?.data?.headerText;
    this.sortModel = data?.data?.sortModel;
    this.formModel = data?.data?.formModel;
    this.hasFilter = data?.data?.hasFilter;
  }

  onInit(): void {
    //#region columnGrid EPassport - Hộ chiếu
    if(!this.passportColumnGrid){
      this.hrService.getHeaderText(this.ePassportFuncID).then((res) => {
        this.passportHeaderText = res;
        this.passportColumnGrid = [
          {
            headerText:
              this.passportHeaderText['PassportNo'] +
              ' | ' +
              this.passportHeaderText['IssuedPlace'],
            template: this.passportCol1,
            width: '150',
          },
          {
            headerText:
              this.passportHeaderText['IssuedDate'] +
              ' | ' +
              this.passportHeaderText['ExpiredDate'],
            template: this.passportCol2,
            width: '150',
          },
        ];
        if(this.funcID == this.ePassportFuncID){
          this.columnGrid = this.passportColumnGrid;
          this.filter = this.filterPassport;
        }
      });
  
      //Get row count
      let ins = setInterval(() => {
        if (this.gridView) {
          clearInterval(ins);
          let t = this;

          this.gridView.dataService.onAction.subscribe((res) => {
            if(res){
              if (res.type != null && res.type == 'loaded') {
                t.rowCount = res['data'].length;
              this.df.detectChanges();
              }
            }
          })
        }
      }, 200);
    }
    //#endregion
  }

  closeDialog(){
    if(this.funcID == this.ePassportFuncID){
      // this.dialogRef.close(this.gridView.dataService.data[0]);
      let lstData = this.gridView.dataService.data;
      let sortedList = lstData.sort((a, b) => {
        if(a.issuedDate < b.issuedDate){
          return 1;
        }
        if(a.issuedDate > b.issuedDate){
          return -1;
        }
        return 0;
      })
      debugger
      this.dialogRef.close(sortedList[0]);
    }
    else{
      this.dialogRef.close();
    }
  }

  clickMF(event: any, data: any, funcID = null){
    switch(event.functionID){
      case 'SYS03': //edit
        if(funcID == this.ePassportFuncID) {
          this.handleEmployeePassportInfo(event.text, 'edit', data);
        }
        break;
      case 'SYS04': //copy
        if(funcID == this.ePassportFuncID){
          this.copyValue(event.text, data);
        }
        break;
      case 'SYS02': //delete
      this.notify.alertCode('SYS030').subscribe((x) => {
        if(x.event?.status == 'Y'){
          if(funcID == this.ePassportFuncID){
            this.hrService.DeleteEmployeePassportInfo(data.recID).subscribe((p) => {
              if(p == true){
                this.notify.notifyCode('SYS008');
                this.updateGridView(this.gridView, 'delete', data);
              }
              else {
                this.notify.notifyCode('SYS022');
              }
            })
          }
        }
      })
    }
  }

  copyValue(actionHeaderText, data){
    this.gridView.dataService.dataSelected = data;
    (this.gridView.dataService as CRUDService).copy().subscribe((res) => {
      this.handleEmployeePassportInfo(actionHeaderText, 'copy', res);
    })
  }

  updateGridView(
    gridView: CodxGridviewComponent,
    actionType: string,
    dataItem: any
  ) {
    if (!dataItem) (gridView?.dataService as CRUDService)?.clear();
    else {
      let returnVal = 0;
      if (actionType == 'add' || actionType == 'copy') {
        (gridView?.dataService as CRUDService)?.add(dataItem, 0).subscribe();
        returnVal = 1;
      } else if (actionType == 'edit') {
        (gridView?.dataService as CRUDService)?.update(dataItem).subscribe();
      } else if (actionType = 'delete') {
        (gridView?.dataService as CRUDService)?.remove(dataItem).subscribe();
        returnVal = -1;
      }
      // return returnVal;
      this.rowCount += returnVal;
      this.df.detectChanges();
    }
  }

  handleEmployeePassportInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    //option.DataService = this.passportGridview?.dataService;
    option.FormModel = this.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEPassportsComponent,
      {
        actionType: actionType,
        funcID: this.ePassportFuncID,
        headerText:
          actionHeaderText + ' ' + this.headerText,
        employeeId: this.employeeId,
        passportObj: data,
      },
      option
    );

    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        this.updateGridView(this.gridView, actionType, res.event);
      }
      this.df.detectChanges();
    });
  }

}
