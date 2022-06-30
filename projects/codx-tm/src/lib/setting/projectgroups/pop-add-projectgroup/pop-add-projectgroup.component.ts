import { TM_TaskGroups } from './../../../models/TM_TaskGroups.model';
import { Component, Input, OnInit, Optional } from '@angular/core';
import { AuthStore, CacheService, DialogData, DialogRef, ApiHttpService, NotificationsService } from 'codx-core';
import { TM_ProjectGroups } from '../../../models/TM_ProjectGroups.model';
import { Observable, Subject } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'lib-pop-add-projectgroup',
  templateUrl: './pop-add-projectgroup.component.html',
  styleUrls: ['./pop-add-projectgroup.component.css']
})
export class PopAddProjectgroupComponent implements OnInit {
  @Input() projectGroups = new TM_ProjectGroups();

  title = 'Thêm nhóm dự án';
  dialog: any;
  user: any;
  functionID: string;
  gridViewSetup: any;
  formName = "";
  gridViewName = "";
  isAfterRender = false;
  isAddMode = true;

  constructor(
    private cache: CacheService,
    private authStore: AuthStore,
    private fb: FormBuilder,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dd?: DialogData,
  ) {
    this.projectGroups = {
      ...this.projectGroups,
      ...dd?.data[0],
    };
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.functionID = this.dialog.formModel.funcID;
  }

  ngOnInit(): void {
    this.cache.gridViewSetup('ProjectGroups', 'grvProjectGroups').subscribe(res => {
      if (res)
        this.gridViewSetup = res
    })
    this.initForm();
  }

  initForm() {
    this.getFormGroup(this.formName, this.gridViewName).then((item) => {
      this.isAfterRender = true;
      this.getAutonumber("TMS033", "TM_ProjectGroups", "ProjectGroupID").subscribe(key => {
        this.projectGroups.projectGroupID = key;
      })
    })
  }

  getFormGroup(formName, gridView): Promise<FormGroup> {
    return new Promise<FormGroup>((resolve, reject) => {
      this.cache.gridViewSetup(formName, gridView).subscribe(gv => {
        var model = {};
        if (gv) {
          const user = this.authStore.get();
          for (const key in gv) {
            var b = false;
            if (Object.prototype.hasOwnProperty.call(gv, key)) {
              const element = gv[key];
              element.fieldName = element.fieldName.charAt(0).toLowerCase() + element.fieldName.slice(1);
              model[element.fieldName] = [];

              if (element.fieldName == "owner") {
                model[element.fieldName].push(user.userID);
              }
              if (element.fieldName == "createdOn") {
                model[element.fieldName].push(new Date());
              }
              else if (element.fieldName == "stop") {
                model[element.fieldName].push(false);
              }
              else if (element.fieldName == "orgUnitID") {
                model[element.fieldName].push(user['buid']);
              }
              else if (element.dataType == "Decimal" || element.dataType == "Int") {
                model[element.fieldName].push(0);
              }
              else if (element.dataType == "Bool" || element.dataType == "Boolean")
                model[element.fieldName].push(false);
              else if (element.fieldName == "createdBy") {
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

  getAutonumber(functionID, entityName, fieldName): Observable<any> {
    var subject = new Subject<any>();
    this.api.execSv<any>("SYS", "ERM.Business.AD", "AutoNumbersBusiness",
      "GenAutoNumberAsync", [functionID, entityName, fieldName, null])
      .subscribe(item => {
        if (item)
          subject.next(item);
        else
          subject.next(null);
      });
    return subject.asObservable();
  }

  beforeSave(op: any) {
    var data = [];
    op.method = 'AddEditProjectGroupsAsync';
    data = [
      this.projectGroups,
      this.isAddMode
    ];

    op.data = data;
    return true;
  }

  onSaveForm() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        if (res.save) {
          this.dialog.dataService.setDataSelected(res);
          this.dialog.close();
          this.notiService.notify('Thêm nhóm dự án thành công'); ///sau này có mess thì gán vào giờ chưa có
        }
      });
  }

  valueApp(data) {
    this.projectGroups.projectCategory = data.data;
  }

  valueChange(data) {
    if (data.data) {
      this.projectGroups.projectGroupName = data.data;
    }
  }

  changeMemo(event) {
    var field = event.field;
    var dt = event.data;
    this.projectGroups.note = dt?.value ? dt.value : dt;
  }
}
