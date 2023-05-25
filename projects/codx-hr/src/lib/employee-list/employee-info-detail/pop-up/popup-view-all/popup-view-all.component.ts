import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import {
  Component,
  Input,
  OnInit,
  ViewChild,
  Injector,
  ChangeDetectorRef,
  Optional,
  TemplateRef,
  AfterViewInit,
} from '@angular/core';
import {
  CRUDService,
  CallFuncService,
  CodxFormComponent,
  CodxGridviewComponent,
  DataRequest,
  DataService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  SidebarModel,
  SortModel,
  UIComponent,
} from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/lib/codx-hr.service';
import { PopupEPassportsComponent } from 'projects/codx-hr/src/lib/employee-profile/popup-epassports/popup-epassports.component';
import { PopupEVisasComponent } from 'projects/codx-hr/src/lib/employee-profile/popup-evisas/popup-evisas.component';
import { PopupEWorkPermitsComponent } from 'projects/codx-hr/src/lib/employee-profile/popup-ework-permits/popup-ework-permits.component';
import { PopupEBasicSalariesComponent } from 'projects/codx-hr/src/lib/employee-profile/popup-ebasic-salaries/popup-ebasic-salaries.component';
import { PopupEbenefitComponent } from 'projects/codx-hr/src/lib/employee-profile/popup-ebenefit/popup-ebenefit.component';
import { PopupSubEContractComponent } from 'projects/codx-hr/src/lib/employee-profile/popup-sub-econtract/popup-sub-econtract.component';
import { PopupEProcessContractComponent } from 'projects/codx-hr/src/lib/employee-contract/popup-eprocess-contract/popup-eprocess-contract.component';

@Component({
  selector: 'lib-popup-view-all',
  templateUrl: './popup-view-all.component.html',
  styleUrls: ['./popup-view-all.component.css'],
})
export class PopupViewAllComponent extends UIComponent implements OnInit {
  rowCount: any;
  funcID: any;
  employeeId: any;
  sortModel: SortModel;
  headerText: any;
  dataService: DataService;
  columnGrid: any;
  hasFilter: any;
  formModel: any;
  formGroup: any;
  date: any;
  //#region declare empInfo
  infoPersonal: any;
  //#endregion

  //#region funcID
  ePassportFuncID = 'HRTEM0202';
  eVisaFuncID = 'HRTEM0203';
  eWorkPermitFuncID = 'HRTEM0204';
  eBasicSalaryFuncID = 'HRTEM0401';
  ebenefitFuncID = 'HRTEM0403';
  eContractFuncID = 'HRTEM0501';
  //#endregion

  //#region columnGrid
  passportColumnGrid: any;
  visaColumnGrid: any;
  workPermitColumnGrid: any;
  basicSalaryColumnGrid: any;
  benefitColumnGrid: any;
  eContractColumnGrid;
  //#endregion

  //#region headerText
  passportHeaderText: any;
  benefitHeaderText: any;
  //#endregion

  //#region gridview setup
  eBenefitGrvSetup;

  //#region filter benefit
  filterByBenefitIDArr: any = [];
  filterEBenefitPredicates: string;
  startDateEBenefitFilterValue;
  endDateEBenefitFilterValue;
  eContractHeaderText: any;
  //#endregion

  ops = ['y'];

  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('gridView') gridView: CodxGridviewComponent;
  @ViewChild('filterPassport', { static: true })
  filterPassport: TemplateRef<any>;
  @ViewChild('customeHeader', { static: true }) customeHeader: TemplateRef<any>;
  @ViewChild('filter', { static: true }) filter: TemplateRef<any>;

  // Column grid viewchild
  @ViewChild('passportCol1', { static: true }) passportCol1: TemplateRef<any>;
  @ViewChild('passportCol2', { static: true }) passportCol2: TemplateRef<any>;

  // eWorkPermit grid viewchild
  @ViewChild('workPermitCol1', { static: true })
  workPermitCol1: TemplateRef<any>;
  @ViewChild('workPermitCol2', { static: true })
  workPermitCol2: TemplateRef<any>;

  //Column grid visa viewChild
  @ViewChild('visaCol1', { static: true }) visaCol1: TemplateRef<any>;
  @ViewChild('visaCol2', { static: true }) visaCol2: TemplateRef<any>;

  //Column grid ebasic salary viewChild
  @ViewChild('basicSalaryCol1', { static: true })
  basicSalaryCol1: TemplateRef<any>;
  @ViewChild('basicSalaryCol2', { static: true })
  basicSalaryCol2: TemplateRef<any>;
  @ViewChild('basicSalaryCol3', { static: true })
  basicSalaryCol3: TemplateRef<any>;
  @ViewChild('basicSalaryCol4', { static: true })
  basicSalaryCol4: TemplateRef<any>;

  //Column grid ebenefit viewChild
  @ViewChild('templateBenefitID', { static: true })
  templateBenefitID: TemplateRef<any>;
  @ViewChild('templateBenefitAmt', { static: true })
  templateBenefitAmt: TemplateRef<any>;
  @ViewChild('templateBenefitEffected', { static: true })
  templateBenefitEffected: TemplateRef<any>;

  //Filter benefit
  @ViewChild('filterBenefit', { static: true })
  filterBenefit: TemplateRef<any>;

  dialogRef: any;

  // EContract grid 
  @ViewChild('eContractCol1', { static: true }) eContractCol1: TemplateRef<any>;
  @ViewChild('eContractCol2', { static: true }) eContractCol2: TemplateRef<any>;
  @ViewChild('eContractCol3', { static: true }) eContractCol3: TemplateRef<any>;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    private df: ChangeDetectorRef,
    @Optional() data?: DialogData,
    @Optional() dataRef?: DialogRef
  ) {
    super(injector);
    this.dialogRef = dataRef;
    this.funcID = data?.data?.funcID;
    this.employeeId = data?.data?.employeeId;
    this.headerText = data?.data?.headerText;
    this.sortModel = data?.data?.sortModel;
    this.formModel = data?.data?.formModel;
    this.hasFilter = data?.data?.hasFilter;
  }

  //Get grid view setup
  GetGrvBenefit() {
    this.hrService.getFormModel(this.ebenefitFuncID).then((res) => {
      this.formModel = res;

      this.cache
        .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
        .subscribe((res) => {
          this.eBenefitGrvSetup = res;
          let dataRequest = new DataRequest();

          dataRequest.comboboxName = res.BenefitID.referedValue;
          dataRequest.pageLoading = false;

          // this.hrService.loadDataCbx('HR', dataRequest).subscribe((data) => {
          //   this.BeneFitColorValArr = JSON.parse(data[0]);
          // });
        });
    });
  }

  checkIsNewestDate(effectedDate, expiredDate){
    if(effectedDate){
      let eff = new Date(effectedDate).toISOString();
      let date = new Date().toISOString();
      if(expiredDate){
        let expire = new Date(expiredDate).toISOString();
        if(date >= eff && date <= expire){
          return true;
        }
        return false;
      }
      else{
        if(date >= eff){
          return true;
        }
        return false;
      }
    }
    return true;
  }

  onInit(): void {
    //#region columnGrid EPassport - Hộ chiếu
    if (!this.passportColumnGrid) {
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
        if (this.funcID == this.ePassportFuncID) {
          this.columnGrid = this.passportColumnGrid;
          this.filter = this.filterPassport;
          //Get row count
          this.getRowCount();
        }
      });
    }
    //#endregion

    //#region get columnGrid EVisa - Thị thực
    if (!this.visaColumnGrid) {
      this.hrService.getHeaderText(this.eVisaFuncID).then((res) => {
        let visaHeaderText = res;
        this.visaColumnGrid = [
          {
            headerText:
              visaHeaderText['VisaNo'] + ' | ' + visaHeaderText['IssuedPlace'],
            template: this.visaCol1,
            width: '150',
          },
          {
            headerText: 'Thời hạn' + ' | ' + 'Quốc gia đến',
            template: this.visaCol2,
            width: '150',
          },
        ];
        if (this.funcID == this.eVisaFuncID) {
          this.columnGrid = this.visaColumnGrid;
          this.filter = null;
          //Get row count
          this.getRowCount();
        }
      });
    }
    //#endregion

    //#region get columnGrid EWorkPermit - Giấy phép lao động
    if (!this.workPermitColumnGrid) {
      this.hrService.getHeaderText(this.funcID).then((res) => {
        let workHeaderText = res;
        this.workPermitColumnGrid = [
          {
            headerText:
              workHeaderText['WorkPermitNo'] +
              ' | ' +
              workHeaderText['IssuedPlace'],
            template: this.workPermitCol1,
            width: '150',
          },
          {
            headerText:
              workHeaderText['IssuedDate'] + ' | ' + workHeaderText['ToDate'],
            template: this.workPermitCol2,
            width: '150',
          },
        ];
        if (this.funcID == this.eWorkPermitFuncID) {
          this.columnGrid = this.workPermitColumnGrid;
          this.filter = null;
          //Get row count
          this.getRowCount();
        }
      });
    }
    //#endregion

    //#region get columnGrid EBasicSalary - Lương cơ bản
    if (!this.basicSalaryColumnGrid) {
      this.hrService.getHeaderText(this.funcID).then((res) => {
        let basicSalaryHeaderText = res;
        this.basicSalaryColumnGrid = [
          {
            headerText: basicSalaryHeaderText['BSalary'],
            template: this.basicSalaryCol1,
            width: '100',
          },
          {
            headerText: basicSalaryHeaderText['SISalary'],
            template: this.basicSalaryCol2,
            width: '100',
          },
          {
            headerText: basicSalaryHeaderText['JSalary'],
            template: this.basicSalaryCol3,
            width: '150',
          },
          {
            headerText: basicSalaryHeaderText['EffectedDate'],
            template: this.basicSalaryCol4,
            width: '150',
          },
        ];
        if (this.funcID == this.eBasicSalaryFuncID) {
          this.columnGrid = this.basicSalaryColumnGrid;
          this.filter = null;
          //Get row count
          this.getRowCount();
        }
      });
    }

    if (!this.eContractColumnGrid) {
      this.hrService.getHeaderText(this.eContractFuncID).then((res) => {
        this.eContractHeaderText = res;
        this.eContractColumnGrid = [
          {
            headerText:
              this.eContractHeaderText['ContractTypeID'] +
              ' | ' +
              this.eContractHeaderText['EffectedDate'],

            template: this.eContractCol1,
            width: '250',
          },
          {
            // headerText: this.eContractHeaderText['ContractNo'] +
            // ' - ' +
            // this.eContractHeaderText['SignedDate'],
            headerText: 'Hợp đồng',
            template: this.eContractCol2,
            width: '150',
          },
          {
            headerText: this.eContractHeaderText['Note'],
            template: this.eContractCol3,
            width: '150',
          },
        ];
        if (this.funcID == this.eContractFuncID) {
          this.columnGrid = this.eContractColumnGrid;
          this.filter = null;
          this.getEmpInfo();
          //Get row count
          this.getRowCount();
        }
      });
    }
    //#endregion

    //#region get columnGrid EBasicSalary - Lương cơ bản
    if (!this.basicSalaryColumnGrid) {
      this.hrService.getHeaderText(this.funcID).then((res) => {
        let basicSalaryHeaderText = res;
        this.basicSalaryColumnGrid = [
          {
            headerText: basicSalaryHeaderText['BSalary'],
            template: this.basicSalaryCol1,
            width: '100',
          },
          {
            headerText: basicSalaryHeaderText['SISalary'],
            template: this.basicSalaryCol2,
            width: '100',
          },
          {
            headerText: basicSalaryHeaderText['JSalary'],
            template: this.basicSalaryCol3,
            width: '150',
          },
          {
            headerText: basicSalaryHeaderText['EffectedDate'],
            template: this.basicSalaryCol4,
            width: '150',
          },
        ];
        if (this.funcID == this.eBasicSalaryFuncID) {
          this.columnGrid = this.basicSalaryColumnGrid;
          this.filter = null;
          //Get row count
          this.getRowCount();
        }
      });
    }

    if (!this.eContractColumnGrid) {
      this.hrService.getHeaderText(this.eContractFuncID).then((res) => {
        this.eContractHeaderText = res;
        this.eContractColumnGrid = [
          {
            headerText:
              this.eContractHeaderText['ContractTypeID'] +
              ' | ' +
              this.eContractHeaderText['EffectedDate'],

            template: this.eContractCol1,
            width: '250',
          },
          {
            // headerText: this.eContractHeaderText['ContractNo'] +
            // ' - ' +
            // this.eContractHeaderText['SignedDate'],
            headerText: 'Hợp đồng',
            template: this.eContractCol2,
            width: '150',
          },
          {
            headerText: this.eContractHeaderText['Note'],
            template: this.eContractCol3,
            width: '150',
          },
        ];
        if (this.funcID == this.eContractFuncID) {
          this.columnGrid = this.eContractColumnGrid;
          this.filter = null;
          this.getEmpInfo();
          //Get row count
          this.getRowCount()
        }
      });
    }
    //#endregion

    //#region get columnGrid EBenefit - Phụ cấp
    if (!this.benefitColumnGrid) {
      this.hrService.getHeaderText(this.funcID).then((res) => {
        this.benefitHeaderText = res;
        this.benefitColumnGrid = [
          {
            headerText: this.benefitHeaderText['BenefitID'],
            template: this.templateBenefitID,
            width: '150',
          },
          {
            headerText: this.benefitHeaderText['BenefitAmt'],
            template: this.templateBenefitAmt,
            width: '150',
          },
          {
            headerText: 'Hiệu lực',
            template: this.templateBenefitEffected,
            width: '150',
          },
        ];
        if (this.funcID == this.ebenefitFuncID) {
          this.columnGrid = this.benefitColumnGrid;
          this.filter = this.filterBenefit;
          this.GetGrvBenefit();
          //Get row count
          this.getRowCount();
        }
      });
    }
    //#endregion
  }

  getRowCount() {
    let ins = setInterval(() => {
      if (this.gridView) {
        clearInterval(ins);
        let t = this;
        this.gridView.dataService.onAction.subscribe((res) => {
          if (res) {
            if (res.type != null && res.type == 'loaded') {
              t.rowCount = res['data'].length;
              this.df.detectChanges();
            }
          }
        });
      }
    }, 100);
  }

  closeDialog() {
    //return isCurrent Passport value
    if (
      this.funcID == this.ePassportFuncID ||
      this.funcID == this.eVisaFuncID ||
      this.funcID == this.eWorkPermitFuncID
    ) {
      // this.dialogRef.close(this.gridView.dataService.data[0]);
      let lstData = this.gridView.dataService.data;
      let sortedList = lstData.sort((a, b) => {
        if (a.issuedDate < b.issuedDate) {
          return 1;
        }
        if (a.issuedDate > b.issuedDate) {
          return -1;
        }
        return 0;
      });
      if (sortedList.length > 0) {
        this.dialogRef.close(sortedList[0]);
      } else {
        this.dialogRef.close('none');
      }
    }
    else if(this.funcID == this.eContractFuncID){
      let lstData = this.gridView.dataService.data;
      let found = lstData.find(
        (val) => val.isCurrent == true
      )
        if(found){
          debugger
          this.dialogRef.close(found)
        }
        else{
          this.dialogRef.close('none');
        }
    } 
    else if(this.funcID == this.ebenefitFuncID || this.funcID == this.eBasicSalaryFuncID){
      let lstData = this.gridView.dataService.data;
      let lstResult = []
      for(let i = 0; i < lstData.length; i++){
        if(this.checkIsNewestDate(lstData[i].effectedDate, lstData[i].expiredDate) == true){
          lstResult.push(lstData[i]);
        }
      }
      if(lstResult.length > 0){
        console.log('ds kq ne', lstResult);
        
        if(this.funcID == this.eBasicSalaryFuncID){
          this.dialogRef.close(lstResult[0])
        }
        this.dialogRef.close(lstResult)
      }
      else{
        this.dialogRef.close('none')
      }
    }
    else {
      this.dialogRef.close();
    }
  }

  handleShowHideMf(event, data) {
    for (let i = 0; i < event.length; i++) {
      if (
        event[i].functionID.substr(event[i].functionID.length - 7) == 'ViewAll'
      ) {
        event[i].disabled = true;
        break;
      }
    }
    if(this.funcID == this.eContractFuncID){
      this.hrService.handleShowHideMF(event, data, this.formModel);
    }
  }

  clickMF(event: any, data: any, funcID = null) {
    switch (event.functionID) {
      case 'SYS03': //edit
        if (funcID == this.ePassportFuncID) {
          this.handleEmployeePassportInfo(event.text, 'edit', data);
        } else if (funcID == this.eVisaFuncID) {
          this.handleEmployeeVisaInfo(event.text, 'edit', data);
        } else if (funcID == this.eWorkPermitFuncID) {
          this.handleEmployeeWorkingPermitInfo(event.text, 'edit', data);
        } else if (funcID == this.eBasicSalaryFuncID) {
          this.HandleEmployeeBasicSalariesInfo(event.text, 'edit', data);
        } else if (funcID == this.ebenefitFuncID) {
          this.HandleEmployeeBenefit(event.text, 'edit', data);
        } else if(funcID == this.eContractFuncID){
          this.handleEContractInfo(event.text, 'edit', data);
        }
        break;
      case 'SYS04': //copy
        this.copyValue(event.text, data);
        break;
      case 'SYS02': //delete
        this.notify.alertCode('SYS030').subscribe((x) => {
          if (x.event?.status == 'Y') {
            if (funcID == this.ePassportFuncID) {
              this.hrService
                .DeleteEmployeePassportInfo(data.recID)
                .subscribe((p) => {
                  if (p == true) {
                    this.notify.notifyCode('SYS008');
                    this.updateGridView(this.gridView, 'delete', data);
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == this.eVisaFuncID) {
              this.hrService
                .DeleteEmployeeVisaInfo(data.recID)
                .subscribe((p) => {
                  if (p == true) {
                    this.notify.notifyCode('SYS008');
                    this.updateGridView(this.gridView, 'delete', data);
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == this.eWorkPermitFuncID) {
              this.hrService
                .DeleteEmployeeWorkPermitInfo(data.recID)
                .subscribe((p) => {
                  if (p == true) {
                    this.notify.notifyCode('SYS008');
                    this.updateGridView(this.gridView, 'delete', data);
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == this.eBasicSalaryFuncID) {
              this.hrService
                .DeleteEmployeeBasicsalaryInfo(data.recID)
                .subscribe((p) => {
                  if (p == true) {
                    this.notify.notifyCode('SYS008');
                    this.updateGridView(this.gridView, 'delete', data);
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == this.ebenefitFuncID) {
              this.hrService
                .DeleteEBenefit(data)
                .subscribe((p) => {
                  if (p) {
                    this.notify.notifyCode('SYS008');
                    this.updateGridView(this.gridView, 'delete', data);
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == this.eContractFuncID) {
              this.hrService
                .deleteEContract(data)
                .subscribe((p) => {
                  if (p[0] != null) {
                    this.notify.notifyCode('SYS008');
                    this.updateGridView(this.gridView, 'delete', data);
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } 
          }
        });
    }
  }

  copyValue(actionHeaderText, data) {
    this.gridView.dataService.dataSelected = data;
    if (this.funcID == this.ePassportFuncID) {
      (this.gridView.dataService as CRUDService).copy().subscribe((res) => {
        this.handleEmployeePassportInfo(actionHeaderText, 'copy', res);
      });
    } else if (this.funcID == this.eVisaFuncID) {
      (this.gridView.dataService as CRUDService).copy().subscribe((res) => {
        this.handleEmployeeVisaInfo(actionHeaderText, 'copy', res);
      });
    } else if (this.funcID == this.eWorkPermitFuncID) {
      (this.gridView.dataService as CRUDService).copy().subscribe((res) => {
        this.handleEmployeeWorkingPermitInfo(actionHeaderText, 'copy', res);
      });
    } else if (this.funcID == this.eBasicSalaryFuncID) {
      (this.gridView.dataService as CRUDService).copy().subscribe((res) => {
        this.HandleEmployeeBasicSalariesInfo(actionHeaderText, 'copy', res);
      });
    } else if (this.funcID == this.ebenefitFuncID) {
      (this.gridView.dataService as CRUDService).copy().subscribe((res) => {
        this.HandleEmployeeBenefit(actionHeaderText, 'copy', res);
      });
    } else if (this.funcID == this.eContractFuncID) {
      (this.gridView.dataService as CRUDService).copy().subscribe((res) => {
        this.handleEContractInfo(actionHeaderText, 'copy', res);
      });
    }
  }

  updateGridView(
    gridView: CodxGridviewComponent,
    actionType: string,
    dataItem: any
  ) {
    if (!dataItem) (gridView?.dataService as CRUDService)?.clear();
    else {
      debugger
      let returnVal = 0;
      if (actionType == 'add' || actionType == 'copy') {
        (gridView?.dataService as CRUDService)?.add(dataItem).subscribe();
      this.df.detectChanges();
      debugger
        returnVal = 1;
      } else if (actionType == 'edit') {
        (gridView?.dataService as CRUDService)?.update(dataItem).subscribe();
        this.df.detectChanges();
      } else if ((actionType == 'delete')) {
        (gridView?.dataService as CRUDService)?.remove(dataItem).subscribe();
        this.df.detectChanges();
        returnVal = -1;
      }
      // return returnVal;
      this.rowCount += returnVal;
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
        headerText: actionHeaderText + ' ' + this.headerText,
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

  handleEmployeeVisaInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    //option.DataService = this.visaGridview.dataService;
    option.FormModel = this.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEVisasComponent,
      {
        actionType: actionType,
        headerText: actionHeaderText + ' ' + this.headerText,
        employeeId: this.employeeId,
        funcID: this.eVisaFuncID,
        visaObj: data,
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

  handleEmployeeWorkingPermitInfo(
    actionHeaderText,
    actionType: string,
    data: any
  ) {
    let option = new SidebarModel();
    // option.DataService = this.workPermitGridview.dataService;
    option.FormModel = this.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEWorkPermitsComponent,
      {
        actionType: actionType,
        headerText: actionHeaderText + ' ' + this.headerText,
        employeeId: this.employeeId,
        funcID: this.eWorkPermitFuncID,
        workPermitObj: data,
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

  HandleEmployeeBasicSalariesInfo(
    actionHeaderText,
    actionType: string,
    data: any
  ) {
    let option = new SidebarModel();
    option.FormModel = this.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEBasicSalariesComponent,
      {
        actionType: actionType,
        headerText: actionHeaderText + ' ' + this.headerText,
        employeeId: this.employeeId,
        funcID: this.eBasicSalaryFuncID,
        salaryObj: data,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        this.updateGridView(this.gridView, actionType, res.event[0]);
      }
      this.df.detectChanges();
    });
  }

  HandleEmployeeBenefit(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.FormModel = this.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEbenefitComponent,
      {
        actionType: actionType,
        headerText:
          actionHeaderText + ' ' + this.headerText,
        employeeId: this.employeeId,
        funcID: this.ebenefitFuncID,
        benefitObj: data,
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

  //#region filter
  UpdateEBenefitPredicate() {
    debugger
    this.filterEBenefitPredicates = '';
    if (
      this.filterByBenefitIDArr.length > 0 &&
      this.startDateEBenefitFilterValue != null
    ) {
      this.filterEBenefitPredicates = `(EmployeeID=="${this.employeeId}" and (`;
      let i = 0;
      for (i; i < this.filterByBenefitIDArr.length; i++) {
        if (i > 0) {
          this.filterEBenefitPredicates += ' or ';
        }
        this.filterEBenefitPredicates += `BenefitID==@${i}`;
      }
      this.filterEBenefitPredicates += ') ';
      this.filterEBenefitPredicates += `and (EffectedDate>="${this.startDateEBenefitFilterValue}" and EffectedDate<="${this.endDateEBenefitFilterValue}")`;
      this.filterEBenefitPredicates += ') ';
      console.log('truong hop 1', this.filterEBenefitPredicates);
      (this.gridView.dataService as CRUDService)
        .setPredicates(
          [this.filterEBenefitPredicates],
          [this.filterByBenefitIDArr.join(';')]
        )
        .subscribe();
    } else if (
      this.filterByBenefitIDArr.length > 0 &&
      (this.startDateEBenefitFilterValue == undefined ||
        this.startDateEBenefitFilterValue == null)
    ) {
      this.filterEBenefitPredicates = `(EmployeeID=="${this.employeeId}" and (`;
      let i = 0;
      for (i; i < this.filterByBenefitIDArr.length; i++) {
        if (i > 0) {
          this.filterEBenefitPredicates += ' or ';
        }
        this.filterEBenefitPredicates += `BenefitID==@${i}`;
      }
      this.filterEBenefitPredicates += ') ';
      this.filterEBenefitPredicates += ') ';
      console.log('truong hop 2', this.filterEBenefitPredicates);
      (this.gridView.dataService as CRUDService)
        .setPredicates(
          [this.filterEBenefitPredicates],
          [this.filterByBenefitIDArr.join(';')]
        )
        .subscribe();
    } else if (
      this.filterByBenefitIDArr.length <= 0 &&
      this.startDateEBenefitFilterValue != null
    ) {
      this.filterEBenefitPredicates = `(EmployeeID=="${this.employeeId}" and EffectedDate>="${this.startDateEBenefitFilterValue}" and EffectedDate<="${this.endDateEBenefitFilterValue}")`;
      (this.gridView.dataService as CRUDService)
        .setPredicates([this.filterEBenefitPredicates], [])
        .subscribe();
      console.log('truong hop 3', this.filterEBenefitPredicates);
    } else if (
      this.filterByBenefitIDArr.length <= 0 &&
      (this.startDateEBenefitFilterValue == undefined ||
        this.startDateEBenefitFilterValue == null)
    ) {
      this.filterEBenefitPredicates = `(EmployeeID=="${this.employeeId}")`;
      console.log('truong hop 4', this.filterEBenefitPredicates);
      (this.gridView.dataService as CRUDService)
        .setPredicates([this.filterEBenefitPredicates], [''])
        .subscribe();
    }
  }

  valueChangeFilterBenefit(evt) {
    this.filterByBenefitIDArr = evt.data;
    this.UpdateEBenefitPredicate();
  }

  valueChangeYearFilterBenefit(evt) {
    if (evt.formatDate == undefined && evt.toDate == undefined) {
      this.startDateEBenefitFilterValue = null;
      this.endDateEBenefitFilterValue = null;
    } else {
      this.startDateEBenefitFilterValue = evt.fromDate.toJSON();
      this.endDateEBenefitFilterValue = evt.toDate.toJSON();
    }
    this.UpdateEBenefitPredicate();
  }
  //#endregion

  getEmpInfo(){
    if (!this.infoPersonal) {
      let empRequest = new DataRequest();
      empRequest.entityName = 'HR_Employees';
      empRequest.dataValues = this.employeeId;
      empRequest.predicates = 'EmployeeID=@0';
      empRequest.pageLoading = false;
      this.hrService.loadData('HR', empRequest).subscribe((emp) => {
        if (emp[1] > 0) {
          this.infoPersonal = emp[0][0];
        }
      });
    }
  }

  handleEContractInfo(actionHeaderText, actionType: string, data: any) {
    debugger
    let option = new SidebarModel();
    option.Width = '850px';
    option.FormModel = this.formModel;
    let isAppendix = false;
    debugger
    if (
      (actionType == 'edit' || actionType == 'copy') &&
      data.isAppendix == true
    ) {
      isAppendix = true;
    }
    let dialogAdd = this.callfunc.openSide(
      isAppendix ? PopupSubEContractComponent : PopupEProcessContractComponent,
      {
        actionType: actionType,
        dataObj: data,
        empObj: this.infoPersonal,
        headerText:
          actionHeaderText + ' ' + this.headerText,
        employeeId: this.employeeId,
        funcID: this.eContractFuncID,
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
