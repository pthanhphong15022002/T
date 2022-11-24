import {
  Component,
  Injector,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  UIComponent,
  ViewModel,
  ButtonModel,
  ViewType,
  DialogData,
  DialogRef,
  FormModel,
} from 'codx-core';
import { CodxEsService } from 'projects/codx-es/src/public-api';
import { CodxHrService } from '../../../codx-hr.service';

@Component({
  selector: 'lib-employee-positions',
  templateUrl: './employee-positions.component.html',
  styleUrls: ['./employee-positions.component.scss'],
})
export class EmployeePositionsComponent extends UIComponent {
  constructor(
    private inject: Injector,
    private activedRouter: ActivatedRoute,
    private esService: CodxEsService,
    private hrService: CodxHrService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.data = dt.data.data;
    this.employeeID = this.data.employeeID;
    this.dialog = dialog;
    this.formModel = new FormModel();
    this.formModel.formName = 'EAppointions';
    this.formModel.gridViewName = 'grvEAppointions';
    this.esService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((res) => {
        this.formGroup = res;
        this.formGroup.controls['employeeID'].setValue(this.employeeID);

        console.log('fg', this.formGroup);
      });
  }

  //data
  data;
  employeeID;
  dialog: DialogRef;
  //codx-views setting
  views: Array<ViewModel> | any = [];
  funcID: string;
  service = 'HR';
  assemblyName = 'HR';
  entity = 'HR_EAppointions';
  className = 'EAppointionsBusiness';
  method = 'GetLstAppointionByEIDAsync';
  idField = 'employeeID';
  predicate = '@EmployeeID=@0';
  dataValue = 'EmployeeID';
  button;
  buttons: Array<ButtonModel> = [];
  formGroup: FormGroup;
  formModel: FormModel;
  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
    console.log('dtttt', this.data, this.employeeID);
    this;
  }

  ngAfterViewInit() {}

  changeItemDetail(employee) {}

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        // this.addNew();
        break;
    }
  }

  saveAppointions() {
    this.hrService
      .addOrEditEAppointion(this.formGroup.value)
      .subscribe((result) => {});
  }

  changeAppointion(appoiont) {
    console.log(appoiont.data, this.formGroup);
    this.formGroup.patchValue(appoiont.data);
    this.detectorRef.detectChanges();
  }

  closePopup() {
    this.dialog.close();
  }
}
