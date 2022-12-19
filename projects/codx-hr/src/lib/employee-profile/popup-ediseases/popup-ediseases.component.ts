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
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';

@Component({
  selector: 'lib-popup-ediseases',
  templateUrl: './popup-ediseases.component.html',
  styleUrls: ['./popup-ediseases.component.scss'],
})
export class PopupEDiseasesComponent extends UIComponent implements OnInit {
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
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('listView') listView: CodxListviewComponent;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrSevice: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    if (!this.formModel) {
      this.formModel = new FormModel();
      this.formModel.entityName = 'HR_EHealths';
      this.formModel.formName = 'EHealths';
      this.formModel.gridViewName = 'grvEHealths';
    }
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.employeeId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
    if (this.actionType === 'edit' || this.actionType === 'copy') {
      this.data = JSON.parse(JSON.stringify(data?.data?.salarySelected));
      this.formModel.currentData = this.data;
    }
  }

  onInit(): void {
    this.isAfterRender = true;
  }

  onSaveForm() {}

  afterRenderListView(event: any) {
    this.listView = event;
    console.log(this.listView);
  }

  click(data) {}
}
