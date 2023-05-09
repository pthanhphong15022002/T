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
  CodxFormComponent,
  CodxGridviewComponent,
  DataRequest,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  SortModel,
  UIComponent,
} from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/public-api';

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
  // headerText: string;

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
  @Output() clickMFunction = new EventEmitter();

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    private df: ChangeDetectorRef,
    // @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    // this.dialog = dialog;
    // this.formModel = dialog?.formModel;

    this.funcID = data?.data?.funcID;
    this.employeeId = data?.data?.employeeId;
    this.headerText = data?.data?.headerText;
    this.actionType = data?.data?.actionType;
  }

  closeModel(): void {
    // console.log(this.dialog)
    // this.dialog?.close();
  }

  ngAfterViewInit() {
    let ins = setInterval(() => {
      if (this.eBenefitGrid) {
        clearInterval(ins);

        this.eBenefitRowCount = this.eBenefitGrid.dataService.rowCount;
        this.headerText =
          this.headerText + ' ' + this.eBenefitGrid.dataService.rowCount;
      }
    }, 1300);
  }

  onInit(): void {
    this.benefitSortModel = new SortModel();
    this.benefitSortModel.field = 'EffectedDate';
    this.benefitSortModel.dir = 'desc';

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

      // let ins = setInterval(() => {
      //   if (this.eBenefitGrid) {
      //     console.log(this.eBenefitGrid)
      //     clearInterval(ins);
      //     let t = this;
      //     this.eBenefitGrid.dataService.onAction.subscribe((res) => {
      //       if (res) {
      //         if (res.type == 'loaded') {
      //           t.eBenefitRowCount = res['data'].length;
      //         }
      //       }
      //     });
      //     this.eBenefitRowCount = this.eBenefitGrid.dataService.rowCount;
      //     console.log(this.eBenefitGrid.dataService.rowCount)
      //     this.headerText = this.headerText + this.eBenefitGrid.dataService.rowCount;
      //   }
      // }, 100);
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

  valueChangeFilterBenefit(evt) {
    this.filterByBenefitIDArr = evt.data;
    this.UpdateEBenefitPredicate();
  }

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

  //Filter year
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

  // else if (funcID == 'eDegrees') {
  //   this.hrService
  //     .DeleteEmployeeDegreeInfo(data.recID)
  //     .subscribe((p) => {
  //       if (p == true) {
  //         this.notify.notifyCode('SYS008');
  //         (this.eDegreeGrid?.dataService as CRUDService)
  //           ?.remove(data)
  //           .subscribe();
  //         this.eDegreeRowCount--;
  //         this.df.detectChanges();
  //       } else {
  //         this.notify.notifyCode('SYS022');
  //       }
  //     });
  // }

  // clickMF(evt: any, data: any = null){
  //   this.clickMFunction.emit({event: evt, data: data});
  // (clickMF)="clickMF($event, data)"
  // }

  clickMF(event: any, data: any, funcID = null) {
    switch (event.functionID) {
      case 'SYS02':
        if (funcID == 'eBenefit') {
          this.hrService.DeleteEBenefit(data).subscribe((p) => {
            if (p != null) {
              this.notify.notifyCode('SYS008');
              this.eBenefitRowCount--; 
              (this.eBenefitGrid?.dataService as CRUDService)
                ?.remove(data)
                .subscribe(); 
              this.df.detectChanges();
            } else {
              this.notify.notifyCode('SYS022');
            }
            this.df.detectChanges();
          });
        }
    }
  }
}
