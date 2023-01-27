import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  CallFuncService,
  CodxFormComponent,
  CodxListviewComponent,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  SidebarModel,
  UIComponent,
} from 'codx-core';
import { max } from 'moment';
import { CardType } from 'projects/codx-fd/src/lib/models/model';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { CodxHrService } from '../../codx-hr.service';
import { PopupSubEContractComponent } from '../popup-sub-econtract/popup-sub-econtract.component';

@Component({
  selector: 'lib-popup-econtract',
  templateUrl: './popup-econtract.component.html',
  styleUrls: ['./popup-econtract.component.scss'],
})
export class PopupEContractComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formModelPL: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  data: any;
  currentEJobSalaries: any;
  funcID: string;
  actionType: string;
  employeeId: string;
  isAfterRender = false;
  headerText: string;

  lstAllContract: any;
  dataCbxContractType: any;
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('listView') listView: CodxListviewComponent;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrSevice: CodxHrService,
    private codxShareService: CodxShareService,
    private callfunc: CallFuncService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    if (!this.formModelPL) {
      this.formModelPL = new FormModel();
      this.formModelPL.entityName = 'HR_EContracts';
      this.formModelPL.formName = 'EContracts';
      this.formModelPL.gridViewName = 'grvEContracts';
    }
    console.log('data', data);

    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.employeeId = data?.data?.employeeId;
    this.funcID = data?.data?.funcID;
    this.actionType = data?.data?.actionType;
    this.data = JSON.parse(JSON.stringify(data?.data?.salarySelected));
  }

  onInit(): void {
    this.hrSevice.getFormModel(this.funcID).then((formModel) => {
      if (formModel) {
        this.formModel = formModel;
        this.hrSevice
          .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
          .then((fg) => {
            if (fg) {
              this.formGroup = fg;
              this.initForm();
            }
          });
      }
    });
  }

  initForm() {
    if (this.actionType == 'add') {
      this.hrSevice.getEContractDefault().subscribe((res) => {
        if (res) {
          this.data = res;
          this.data.employeeID = this.employeeId;
          this.formModel.currentData = this.data;
          console.log('default contract data', this.data);
          this.formGroup.patchValue(this.data);
          this.cr.detectChanges();
          this.isAfterRender = true;
        }
      });
    } else if (this.actionType === 'edit' || this.actionType === 'copy') {
      this.formModel.currentData = this.data;
      this.formGroup.patchValue(this.data);
      this.cr.detectChanges();
      this.isAfterRender = true;
    }
  }

  onSaveForm(closeForm: boolean) {
    if (this.formGroup.invalid) {
      this.hrSevice.notifyInvalid(this.formGroup, this.formModel);
      return;
    }

    if (this.data.effectedDate > this.data.expiredDate) {
      this.hrSevice.notifyInvalidFromTo(
        'ExpiredDate',
        'EffectedDate',
        this.formModel
      );
      return;
    }

    if (this.actionType == 'add' || this.actionType == 'copy') {
      this.data.contractTypeID = '1';

      this.hrSevice.addEContract(this.data).subscribe((res) => {
        if (res) {
          //code test

          this.data = res;
          (this.listView.dataService as CRUDService).add(res).subscribe();
          this.actionType = 'edit';
          if (closeForm) {
            this.dialog && this.dialog.close();
          }
        }
      });
    } else if (this.actionType == 'edit') {
      this.hrSevice.editEContract(this.data).subscribe((res) => {
        if (res) {
          (this.listView.dataService as CRUDService).update(res).subscribe();
          if (closeForm) {
            this.dialog && this.dialog.close();
          }
        }
      });
    }

    this.cr.detectChanges();
  }

  validateBeforeSave(isAddNew: boolean) {
    if (this.lstAllContract && this.lstAllContract?.length > 0) {
      //khoảng thời gian ["Ngày hiệu lực", "Ngày hết hạn"] ko được lồng nhau với các HĐLĐ đã tồn tại trước đó
      if (this.data?.isAppendix == false) {
        let lstIsAppendix = this.lstAllContract.filter(
          (x) => x.IsAppendix == false
        );
        if (lstIsAppendix?.length > 0) {
          if (this.data?.effectedDate < lstIsAppendix[0].expiredDate) {
            this.notify.notifyCode(
              'Khoảng Thời gian HĐ này trùng với HĐ đang tồn tại. Vui lòng nhập lại khoảng thời gian HĐ!'
            );
            return;
          }
        }
      }

      if (isAddNew) {
        //Cảnh báo nếu thêm mới HĐLĐ, mà trước đó có  HĐ đang hiệu lực là HĐ không xác định thời hạn (có phân loại = 1)
        let crrValidContract = this.lstAllContract.filter(
          (p) => p.isCurrent == true
        );
        if (crrValidContract) {
          let cType = this.dataCbxContractType.filter(
            (p) => p.contractTypeID == crrValidContract.contractTypeID
          );
          if (cType && cType?.contractGroup == 1) {
            this.notify
              .alertCode(
                'Đã tồn tại HĐ vô thời hạn. Bạn có muốn tiếp tục tạo HĐ mới?'
              )
              .subscribe((x) => {
                if (x.event?.status == 'Y') {
                  this.onSaveForm(false);
                } else return;
              });
          }
        }

        //Cập nhật “Ngày hợp đồng chính thức” đối với Hợp đồng chính thức đầu tiên
      }
    }
  }

  afterRenderListView(event: any) {
    this.listView = event;
    if (this.lstAllContract) {
      this.lstAllContract == this.listView?.dataService.data;
    }
    console.log(this.listView);
  }

  click(data) {
    if (this.data) {
      this.actionType = 'edit';
      this.data = data;
      this.formModel.currentData = this.data;
      this.formGroup.patchValue(this.data);
      this.cr.detectChanges();
    }
  }

  valueChange(event) {
    if (event?.field && event?.component && event?.data != '') {
      switch (event.field) {
        case 'contractTypeID': {
          this.data.limitMonths =
            event?.component?.itemsSelected[0]?.LimitMonths;
          this.formGroup.patchValue({ limitMonths: this.data.limitMonths });
          this.setExpiredDate();
          break;
        }
        case 'effectedDate': {
          this.setExpiredDate();
          break;
        }
        case 'signerID': {
          let employee = event?.component?.itemsSelected[0];
          if (employee) {
            if (employee.PositionID) {
              this.hrSevice
                .getPositionByID(employee.PositionID)
                .subscribe((res) => {
                  if (res) {
                    this.data.signerPosition = res.positionName;
                    this.formGroup.patchValue({
                      signerPosition: this.data.signerPosition,
                    });
                    this.cr.detectChanges();
                  }
                });
            } else {
              this.data.signerPosition = null;
              this.formGroup.patchValue({
                signerPosition: this.data.signerPosition,
              });
            }
          }
          break;
        }
      }

      this.cr.detectChanges();
    }
  }

  setExpiredDate() {
    if (this.data.effectedDate) {
      let date = new Date(this.data.effectedDate);
      this.data.expiredDate = new Date(date.setMonth(date.getMonth() + 14));
      this.formGroup.patchValue({ expiredDate: this.data.expiredDate });
      this.cr.detectChanges();
    }
  }

  addSubContract() {
    let optionSub = new SidebarModel();
    // option.FormModel = this.view.formModel
    optionSub.Width = '550px';
    optionSub.zIndex = 1001;
    // let popupSubContract = this.callfunc.openSide(
    //   PopupSubEContractComponent,
    //   {
    //     actionType: 'add',
    //     salarySelected: null,
    //     headerText: 'Hợp đồng lao động',
    //     employeeId: this.data.employeeID,
    //   },
    //   optionSub
    // );
    let popupSubContract = this.callfc.openForm(
      PopupSubEContractComponent,
      '',
      550,
      screen.height,
      '',
      {
        employeeId: this.data.employeeID,
        contractNo: this.data.contractNo,
        formModel: this.formModel,
        formGroup: this.formGroup,
      }
    );
    popupSubContract.closed.subscribe((res) => {
      if (res) {
      }
    });
  }
}
