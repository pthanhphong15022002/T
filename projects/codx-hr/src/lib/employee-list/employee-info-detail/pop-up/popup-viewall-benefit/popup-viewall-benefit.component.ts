import { FormGroup } from '@angular/forms';
import {
  ChangeDetectorRef,
  EventEmitter,
  Injector,
  Input,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import {
  CRUDService,
  CallFuncService,
  CodxFormComponent,
  CodxGridviewComponent,
  DataRequest,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  SidebarModel,
  SortModel,
  UIComponent,
} from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/public-api';
import { PopupEbenefitComponent } from 'projects/codx-hr/src/lib/employee-profile/popup-ebenefit/popup-ebenefit.component';

@Component({
  selector: 'lib-popup-viewall-benefit',
  templateUrl: './popup-viewall-benefit.component.html',
  styleUrls: ['./popup-viewall-benefit.component.css'],
})
export class PopupViewallBenefitComponent
  extends UIComponent
  implements OnInit
{
  @Input() formModel: any;
  formGroup: FormGroup;
  @Input() dialog: any;

  // funcID: string;
  // employeeId: string;
  actionType: string;
  headerTextNew: string;

  lstFuncID: any = [];
  //Render Signer Position follow Singer ID
  data: any;
  benefitColumnGrid;
  benefitHeaderTexts;
  eBenefitRowCount: number = 0;
  eBenefitGrvSetup;
  benefitFuncID = 'HRTEM0403';
  BeneFitColorValArr: any = [];
  ops = ['y'];
  benefitSortModel: SortModel;
  numPageSizeGridView = 100;

  filterByBenefitIDArr: any = [];
  filterEBenefitPredicates: string;
  startDateEBenefitFilterValue;
  endDateEBenefitFilterValue;

  benefitFormodel: FormModel;
  @ViewChild('gridView') eBenefitGrid: CodxGridviewComponent;
  @ViewChild('form') form: CodxFormComponent;

  @ViewChild('templateBenefitID', { static: true })
  templateBenefitID: TemplateRef<any>;
  @ViewChild('templateBenefitAmt', { static: true })
  templateBenefitAmt: TemplateRef<any>;
  @ViewChild('templateBenefitEffected', { static: true })
  templateBenefitEffected: TemplateRef<any>;

  @Input() funcID;
  @Input() employeeId;
  @Input() headerText;
  @Output() RenderUpdateData = new EventEmitter();

  constructor(
    private injector: Injector,
    private callfunc: CallFuncService,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    private df: ChangeDetectorRef,
    // @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);

    this.funcID = data?.data?.funcID;
    this.employeeId = data?.data?.employeeId;
    this.headerText = data?.data?.headerText;
    this.actionType = data?.data?.actionType;
  }

  //Count number of row
  getCountRow() {
    this.hrService
      .countEmpTotalRecord(this.employeeId, 'EBenefitsBusiness')
      .subscribe((res) => {
        if(res){
          this.headerTextNew = this.headerText + ' ' + res;
        }
        else {
          this.headerTextNew = this.headerText + ' ' + 0;
        }
      });
    return this.headerTextNew;
  }

  onInit(): void {
    this.benefitSortModel = new SortModel();
    this.benefitSortModel.field = 'EffectedDate';
    this.benefitSortModel.dir = 'desc';

    this.getCountRow();

    this.hrService.getHeaderText(this.benefitFuncID).then((res) => {
      this.benefitHeaderTexts = res;
      this.benefitColumnGrid = [
        {
          headerText: this.benefitHeaderTexts['BenefitID'],
          template: this.templateBenefitID,
          width: '150',
        },
        {
          headerText: this.benefitHeaderTexts['BenefitAmt'],
          template: this.templateBenefitAmt,
          width: '150',
        },
        {
          headerText: 'Hiệu lực',
          template: this.templateBenefitEffected,
          width: '150',
        },
      ]; 
    });

    this.hrService.getFormModel(this.benefitFuncID).then((res) => {
      this.benefitFormodel = res;

      this.cache
        .gridViewSetup(
          this.benefitFormodel.formName,
          this.benefitFormodel.gridViewName
        )
        .subscribe((res) => {
          this.eBenefitGrvSetup = res;
          let dataRequest = new DataRequest();

          dataRequest.comboboxName = res.BenefitID.referedValue;
          dataRequest.pageLoading = false;

          this.hrService.loadDataCbx('HR', dataRequest).subscribe((data) => {
            this.BeneFitColorValArr = JSON.parse(data[0]);
          });
        });
    });
  }
  //#region filter
  UpdateEBenefitPredicate() {
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
      (this.eBenefitGrid.dataService as CRUDService)
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
      (this.eBenefitGrid.dataService as CRUDService)
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
      (this.eBenefitGrid.dataService as CRUDService)
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
      (this.eBenefitGrid.dataService as CRUDService)
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

  getFormHeader(functionID: string) {
    let funcObj = this.lstFuncID.filter((x) => x.functionID == functionID);
    let headerText = '';
    if (funcObj && funcObj.length > 0) {
      headerText = funcObj[0].description;
    }
    return headerText;
  }

  handlEmployeeBenefit(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.FormModel = this.benefitFormodel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEbenefitComponent,
      {
        employeeId: this.employeeId,
        actionType: actionType,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.benefitFuncID),
        funcID: this.benefitFuncID,
        benefitObj: data,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        if (actionType == 'add' || actionType == 'copy') {
          if (res.event.length > 1) {
            (this.eBenefitGrid?.dataService as CRUDService)
              ?.update(res.event[0])
              .subscribe();
            (this.eBenefitGrid?.dataService as CRUDService)
              ?.add(res.event[1])
              .subscribe();
          } else {
            (this.eBenefitGrid?.dataService as CRUDService)
              ?.add(res.event[0])
              .subscribe();
          }
          this.getCountRow();
        } else if (actionType == 'edit') {
          (this.eBenefitGrid?.dataService as CRUDService)
            ?.update(res.event)
            .subscribe();
          this.getCountRow();

        
        }
        this.RenderUpdateData.emit({
          isRenderDelete: true ,
        });
      }
    });
  }

  copyValue(actionHeaderText, data, flag) {
    if (flag == 'benefit') {
      if (this.eBenefitGrid) {
        this.eBenefitGrid.dataService.dataSelected = data;
        (this.eBenefitGrid.dataService as CRUDService)
          .copy()
          .subscribe((res: any) => {
            this.handlEmployeeBenefit(actionHeaderText, 'copy', res);
          });
      } else {
        this.hrService
          .copy(data, this.benefitFormodel, 'RecID')
          .subscribe((res) => {
            this.handlEmployeeBenefit(actionHeaderText, 'copy', res);
          });
      }
    }
  }

  clickMF(event: any, data: any, funcID = null) {
    console.log(event.functionID);
    switch (event.functionID) {
      case 'SYS02':
        this.notify.alertCode('SYS030').subscribe((x) => {
          if (x.event?.status == 'Y') {
            if (funcID == 'eBenefit') {
              this.hrService.DeleteEBenefit(data).subscribe((p) => {
                if (p != null) {
                  this.notify.notifyCode('SYS008');
                  this.getCountRow();

                  //this.RenderUpdateData.emit({event: evt, data: data});
                  this.RenderUpdateData.emit({
                   isRenderDelete: true ,
                  });

                  (this.eBenefitGrid?.dataService as CRUDService)
                    ?.remove(data)
                    .subscribe();
                  this.df.detectChanges();
                } else {
                  this.notify.notifyCode('SYS022');
                }
              });
            }
          }
        });
        break;
      case 'SYS03':
        this.handlEmployeeBenefit(event.text, 'edit', data);
        break;
      case 'SYS04':
        this.copyValue(event.text, data, 'benefit');
        this.df.detectChanges();
        break;
    }
  }
}
