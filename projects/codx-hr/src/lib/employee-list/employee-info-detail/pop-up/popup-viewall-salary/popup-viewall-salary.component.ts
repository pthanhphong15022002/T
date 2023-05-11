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
import { PopupEBasicSalariesComponent } from 'projects/codx-hr/src/lib/employee-profile/popup-ebasic-salaries/popup-ebasic-salaries.component';


@Component({
  selector: 'lib-popup-viewall-salary',
  templateUrl: './popup-viewall-salary.component.html',
  styleUrls: ['./popup-viewall-salary.component.css']
})
export class PopupViewallSalaryComponent  extends UIComponent
implements OnInit{
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
  basicSalaryColumnGrid;
  basicSalaryHeaderText;
  eBasicSalaryFuncID = 'HRTEM0401';
  bSalarySortModel: SortModel;
  numPageSizeGridView = 100;
 
  eBasicSalaryFormmodel: FormModel;
  @ViewChild('gridView') eBasicSalaryGridview: CodxGridviewComponent;
  @ViewChild('form') form: CodxFormComponent;

  // eBasicSalary
  @ViewChild('basicSalaryCol1', { static: true })
  basicSalaryCol1: TemplateRef<any>;
  @ViewChild('basicSalaryCol2', { static: true })
  basicSalaryCol2: TemplateRef<any>;
  @ViewChild('basicSalaryCol3', { static: true })
  basicSalaryCol3: TemplateRef<any>;
  @ViewChild('basicSalaryCol4', { static: true })
  basicSalaryCol4: TemplateRef<any>;

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
      .countEmpTotalRecord(this.employeeId, 'EBasicSalariesBusiness')
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
    this.bSalarySortModel = new SortModel();
    this.bSalarySortModel.field = 'EffectedDate';
    this.bSalarySortModel.dir = 'desc';

    this.getCountRow();

    this.hrService.getHeaderText(this.eBasicSalaryFuncID).then((res) => {
      this.basicSalaryHeaderText = res;
      this.basicSalaryColumnGrid = [
        {
          headerText: this.basicSalaryHeaderText['BSalary'],
          template: this.basicSalaryCol1,
          width: '100',
        },
        {
          headerText: this.basicSalaryHeaderText['SISalary'],
          template: this.basicSalaryCol2,
          width: '100',
        },
        {
          headerText:
            this.basicSalaryHeaderText['JSalary'],
          template: this.basicSalaryCol3,
          width: '150',
        }, 
        {
          headerText:this.basicSalaryHeaderText['EffectedDate'],
          template: this.basicSalaryCol4,
          width: '150',
        },
      ];
    });

    this.hrService.getFormModel(this.eBasicSalaryFuncID).then((res) => {
      this.eBasicSalaryFormmodel = res;
    });
  } 

  getFormHeader(functionID: string) {
    let funcObj = this.lstFuncID.filter((x) => x.functionID == functionID);
    let headerText = '';
    if (funcObj && funcObj.length > 0) {
      headerText = funcObj[0].description;
    }
    return headerText;
  }

  HandleEmployeeBasicSalariesInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.FormModel = this.eBasicSalaryFormmodel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEBasicSalariesComponent,
      {
        actionType: actionType,
        headerText:
        actionHeaderText + ' ' + this.getFormHeader(this.eBasicSalaryFuncID),
        funcID: this.eBasicSalaryFuncID,
        employeeId: this.employeeId,
        salaryObj: data,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        if (actionType == 'add' || actionType == 'copy') {
          if (res.event.length > 1) {
            (this.eBasicSalaryGridview?.dataService as CRUDService)
              ?.update(res.event[0])
              .subscribe();
            (this.eBasicSalaryGridview?.dataService as CRUDService)
              ?.add(res.event[1][0])
              .subscribe();
          } else {
            (this.eBasicSalaryGridview?.dataService as CRUDService)
              ?.add(res.event[0])
              .subscribe();
          }
          this.getCountRow();
        } else if (actionType == 'edit') {
          (this.eBasicSalaryGridview?.dataService as CRUDService)
          ?.update(res.event[0])
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
    if (flag == 'basicSalary') {
      if (this.eBasicSalaryGridview) {
        this.eBasicSalaryGridview.dataService.dataSelected = data;
        (this.eBasicSalaryGridview.dataService as CRUDService)
          .copy()
          .subscribe((res: any) => {
            this.HandleEmployeeBasicSalariesInfo(actionHeaderText, 'copy', res);
          });
      } else {
        this.hrService
          .copy(data, this.eBasicSalaryFormmodel, 'RecID')
          .subscribe((res) => {
            this.HandleEmployeeBasicSalariesInfo(actionHeaderText, 'copy', res);
          });
      }
      // this.hrService
      // .copy(data, this.eBasicSalaryFormmodel, 'RecID')
      // .subscribe((res) => {
      //   this.HandleEmployeeBasicSalariesInfo(actionHeaderText, 'copy', res);
      // });
    }
  }

  clickMF(event: any, data: any, funcID = null) {
    console.log(event.functionID);
    switch (event.functionID) {
      case 'SYS02':
        this.notify.alertCode('SYS030').subscribe((x) => {
          if (x.event?.status == 'Y') {
            if (funcID == 'basicSalary') {
              this.hrService.DeleteEmployeeBasicsalaryInfo(data.recID).subscribe((p) => {
                if (p == true) {
                  this.notify.notifyCode('SYS008');
                  this.getCountRow();

                  this.RenderUpdateData.emit({
                   isRenderDelete: true ,
                  });

                  (this.eBasicSalaryGridview?.dataService as CRUDService)
                    ?.remove(data)
                    .subscribe();
                } else {
                  this.notify.notifyCode('SYS022');
                }
              });
            }
          }
        });
        break;
      //Edit
      case 'SYS03':
        this.HandleEmployeeBasicSalariesInfo(event.text, 'edit', data);
        break;
      case 'SYS04':
        this.copyValue(event.text, data, 'basicSalary');
        this.df.detectChanges();
        break;
    }
  }
}
