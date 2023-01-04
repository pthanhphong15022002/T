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
  selector: 'lib-popup-emp-business-travels',
  templateUrl: './popup-emp-business-travels.component.html',
  styleUrls: ['./popup-emp-business-travels.component.css'],
})
export class PopupEmpBusinessTravelsComponent
  extends UIComponent
  implements OnInit
{
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('listView') listView: CodxListviewComponent;

  formGroup: FormGroup;
  formModel: FormModel;
  dialog: DialogRef;
  headerText: '';
  funcID;
  employId;
  data;

  isAfterRender = false;
  actionType: string;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notitfy: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.actionType = data?.data?.actionType;
    if (!this.formModel) {
      this.formModel = new FormModel();
      this.formModel.formName = 'EBusinessTravels';
      this.formModel.entityName = 'HR_EBusinessTravels';
      this.formModel.gridViewName = 'grvEBusinessTravels';
    }
    this.funcID = this.dialog?.formModel?.funcID;
    this.employId = data?.data?.employeeId;
  }

  onInit(): void {
    if (this.formModel) {
      this.hrService
        .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
        .then((fg) => {
          if (fg) {
            this.formGroup = fg;
            this.initForm();
          }
        });
    }
  }

  initForm() {
    if (this.actionType == 'add') {
      this.hrService.getEBTravelDefaultAsync().subscribe((res) => {
        if (res) {
          this.data = res;
          this.data.employeeID = this.employId;
          this.formModel.currentData = this.data;
          this.formGroup.patchValue(this.data);
          this.cr.detectChanges();
          this.isAfterRender = true;
        }
      });
    }
  }

  onSaveForm(isCloseForm: boolean) {
    if (this.actionType == 'add' || this.actionType == 'copy') {
      this.data.contractTypeID = '1';

      this.hrService.addEBusinessTravels(this.data).subscribe((res) => {
        if (res) {
          //code test

          this.data = res;
          (this.listView.dataService as CRUDService).add(res).subscribe();
          this.actionType = 'edit';
          if (isCloseForm) {
            this.dialog && this.dialog.close();
          }
        }
      });
    } else if (this.actionType == 'edit') {
      this.hrService.editEBusinessTravels(this.data).subscribe((res) => {
        if (res) {
          (this.listView.dataService as CRUDService).update(res).subscribe();
          if (isCloseForm) {
            this.dialog && this.dialog.close();
          }
        }
      });
    }

    this.cr.detectChanges();
  }

  afterRenderListView(event) {
    this.listView = event;
    console.log(this.listView);
  }

  click(data) {
    if(data){
      this.data = data;
      this.formModel.currentData = this.data;
      this.formGroup.patchValue(this.data)

      this.cr.detectChanges();
      this.actionType = 'edit';
    }
  }

  swipeToRightTab(e) {
    if (e.isSwiped) {
      e.cancel = true;
    }
  }
}
