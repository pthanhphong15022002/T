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
import { CodxHrService } from '../../codx-hr.service';
@Component({
  selector: 'lib-popup-evaccine',
  templateUrl: './popup-evaccine.component.html',
  styleUrls: ['./popup-evaccine.component.scss'],
})
export class PopupEVaccineComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  data: any;
  currentEJobSalaries: any;
  funcID: string;
  idField: string = 'recID';
  actionType: string;
  employeeId: string;
  isAfterRender = false;
  headerText: string;
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('listView') listView: CodxListviewComponent;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    // if (!this.formModel) {
    //   this.formModel = new FormModel();
    //   this.formModel.entityName = 'HR_EVaccines';
    //   this.formModel.formName = 'EVaccines';
    //   this.formModel.gridViewName = 'grvEVaccines';
    // }
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.employeeId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
    this.funcID = data?.data?.funcID;

    if (this.actionType === 'edit' || this.actionType === 'copy') {
      this.data = JSON.parse(JSON.stringify(data?.data?.salarySelected));
      this.formModel.currentData = this.data;
    }
  }

  onInit(): void {
    this.hrService.getFormModel(this.funcID).then((formModel) => {
      if (formModel) {
        this.formModel = formModel;
        this.hrService
          .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
          .then((formGroup) => {
            if (formGroup) {
              this.formGroup = formGroup;
              this.initForm();
            }
          });
      }
    });
  }

  initForm() {
    if (this.actionType == 'add') {
      this.hrService
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res) => {
          if (res && res.data) {
            this.data = res?.data;
            this.data.employeeID = this.employeeId;
            this.formModel.currentData = this.data;
            this.formGroup.patchValue(this.data);
            this.cr.detectChanges();
            this.isAfterRender = true;
          } else {
            this.notify.notify('Error');
          }
        });
    } else {
      this.formModel.currentData = this.data;
      this.formGroup.patchValue(this.data);
      this.cr.detectChanges();
      this.isAfterRender = true;
    }
  }

  onSaveForm(isClose: boolean) {
    // if (this.formGroup.invalid) {
    //   this.hrService.notifyInvalid(this.formGroup, this.formModel);
    //   return;
    // }

    if (this.actionType == 'add' || this.actionType == 'copy') {
      this.hrService.addEVaccine(this.data).subscribe((res) => {
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
      this.hrService.editEVaccine(this.data).subscribe((res) => {
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

  afterRenderListView(event: any) {
    this.listView = event;
    console.log(this.listView);
  }

  click(data) {}
}
