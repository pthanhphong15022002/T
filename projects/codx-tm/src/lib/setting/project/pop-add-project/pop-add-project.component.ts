import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import {
  AuthStore,
  CacheService,
  DialogData,
  DialogRef,
  ApiHttpService,
  NotificationsService,
} from 'codx-core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'lib-pop-add-project',
  templateUrl: './pop-add-project.component.html',
  styleUrls: ['./pop-add-project.component.css'],
})
export class PopAddProjectComponent implements OnInit {
  project: any;
  titleAdd = 'Thêm mới dự án';
  titleUpdate = 'Chỉnh sửa dự án';
  title = '';
  dialog: DialogRef;
  user: any;
  functionID: string;
  gridViewSetup: any;
  readOnly = false;

  formName = 'Projects';
  gridViewName = 'grvProjects';
  isAddMode = true;
  isAfterRender: boolean;
  projectGroups: any;

  constructor(
    private authStore: AuthStore,
    private cache: CacheService,
    private api: ApiHttpService,

    // BaoLV 1.TM - Danh muc du an
    private fb: FormBuilder,
    private notiService: NotificationsService,
    private data: ChangeDetectorRef,
    @Optional() dialog?: DialogRef,
    @Optional() dd?: DialogData
  ) {
    this.project = dialog.dataService!.dataSelected;
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.functionID = this.dialog.formModel.funcID;
  }

  ngOnInit(): void {

  }

  valueApp(data) {
    this.project.projectCategory = data.data;
  }

  valueChange(data) {
    if (data.data) {
      this.project.projectName = data.data;
    }
  }

  valueCus(data) {
    this.project.customerName = data.data;
  }

  valueLocation(data) {
    this.project.location = data.data;
  }

  cbxChangeProjectGroup(data) {
    if (data.data && data.data[0]) {
      this.project.projectGroupID = data.data.join(';');

    }
  }

  cbxChangeProjects(data) {
    if (data.data) {
      this.project.projectManeger = data.data.join(';');
    }
  }

  changeMemo(event) {
    var field = event.field;
    var dt = event.data;
    this.project.memo = dt?.value ? dt.value : dt;
  }

  getFormGroup(formName, gridView): Promise<FormGroup> {
    return new Promise<FormGroup>((resolve, reject) => {
      this.cache.gridViewSetup(formName, gridView).subscribe((gv) => {
        var model = {};
        if (gv) {
          const user = this.authStore.get();
          for (const key in gv) {
            var b = false;
            if (Object.prototype.hasOwnProperty.call(gv, key)) {
              const element = gv[key];
              element.fieldName =
                element.fieldName.charAt(0).toLowerCase() +
                element.fieldName.slice(1);
              model[element.fieldName] = [];

              if (element.fieldName == 'owner') {
                model[element.fieldName].push(user.userID);
              }
              if (element.fieldName == 'createdOn') {
                model[element.fieldName].push(new Date());
              } else if (element.fieldName == 'stop') {
                model[element.fieldName].push(false);
              } else if (element.fieldName == 'orgUnitID') {
                model[element.fieldName].push(user['buid']);
              } else if (
                element.dataType == 'Decimal' ||
                element.dataType == 'Int'
              ) {
                model[element.fieldName].push(0);
              } else if (
                element.dataType == 'Bool' ||
                element.dataType == 'Boolean'
              )
                model[element.fieldName].push(false);
              else if (element.fieldName == 'createdBy') {
                model[element.fieldName].push(user.userID);
              } else {
                model[element.fieldName].push(null);
              }
            }
          }
        }
        resolve(this.fb.group(model, { updateOn: 'blur' }));
      });
    });

  }

  onSaveOrEdit() {
    this.addOrUpdateData();
  }

  beforeSaveOrEdit(op: any) {
    var data = [];
    op.method = 'AddEditProjectsAsync';
    data = [this.project];
    op.data = data;
    return true;
  }

  addOrUpdateData() {
    this.dialog.dataService
      .save((option: any) => this.beforeSaveOrEdit(option))
      .subscribe((res) => {
        if (res.save) {
          this.dialog.dataService.setDataSelected(res.save[0]);
        }

      });
    this.dialog.close();
  }
}
