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
  CodxFormComponent,
  CodxListviewComponent,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { max } from 'moment';
import { CardType } from 'projects/codx-fd/src/lib/models/model';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { CodxHrService } from '../../codx-hr.service';

@Component({
  selector: 'lib-popup-econtract',
  templateUrl: './popup-econtract.component.html',
  styleUrls: ['./popup-econtract.component.scss'],
})
export class PopupEContractComponent extends UIComponent implements OnInit {
  formModel: FormModel;
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
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    if (!this.formModel) {
      this.formModel = new FormModel();
      this.formModel.entityName = 'HR_EContracts';
      this.formModel.formName = 'EContracts';
      this.formModel.gridViewName = 'grvEContracts';
    }
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.employeeId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
    this.data = JSON.parse(JSON.stringify(data?.data?.salarySelected));
  }

  onInit(): void {
    if (this.formModel) {
      this.codxShareService
        .getFormGroup(this.formModel?.formName, this.formModel?.gridViewName)
        .then((res) => {
          if (res) {
            this.formGroup = res;
            this.initForm();
          }
        });
    }
  }

  initForm() {
    if (this.actionType == 'add') {
      this.hrSevice.getEContractDefault().subscribe((res) => {
        if (res) {
          this.data = res;
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

  onSaveForm(isClose: boolean) {
    if (this.actionType == 'add' || this.actionType == 'copy') {
      this.hrSevice.addEContract(this.data).subscribe((res) => {
        if (res) {
          this.data = res;
          (this.listView.dataService as CRUDService).add(res).subscribe();
          this.actionType = 'edit';
          if (isClose) {
            this.dialog && this.dialog.close();
          }
        }
      });
    } else if (this.actionType == 'edit') {
      this.hrSevice.editEContract(this.data).subscribe((res) => {
        if (res) {
          (this.listView.dataService as CRUDService).update(res).subscribe();
          if (isClose) {
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

  click(data) {}
}
