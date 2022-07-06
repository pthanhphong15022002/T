import { Data_Line } from './../../../../../../codx-fd/src/lib/wallets/wallets.component';
import { ChangeDetectorRef, Component, Input, OnInit, Optional } from '@angular/core';
import {
  AuthStore,
  CacheService,
  DialogData,
  DialogRef,
  ApiHttpService,
  NotificationsService,
  AuthService,
} from 'codx-core';
import { TM_Projects } from '../../../models/TM_Projects.model';
import moment from 'moment';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'lib-pop-add-project',
  templateUrl: './pop-add-project.component.html',
  styleUrls: ['./pop-add-project.component.css'],
})
export class PopAddProjectComponent implements OnInit {
  @Input() projects = new TM_Projects();

  titleAdd = 'Thêm mới dự án';
  titleUpdate = 'Chỉnh sửa dự án';
  title = '';
  dialog: any;
  user: any;
  functionID: string;
  gridViewSetup: any;
  readOnly = false;

  // BaoLV 1.TM - Danh muc du an
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
    this.projects = {
      ...this.projects,
      ...dd?.data[0],
    };


    this.dialog = dialog;
    this.user = this.authStore.get();
    this.functionID = this.dialog.formModel.funcID;
  }

  ngOnInit(): void {
    this.cache.gridViewSetup('Projects', 'grvProjects').subscribe((res) => {
      // if (res) this.gridView

      // BaoLV 2.TM - Danh mục dự án - Chức năng cập nhật thông tin dự án
      if (res) {
        this.gridViewSetup = res;

      }
    });

    // BaoLV 1.TM - Danh muc du an
    this.initForm();
  }

  valueApp(data) {
    this.projects.projectCategory = data.data;
  }

  valueChange(data) {
    if (data.data) {
      this.projects.projectName = data.data;
    }
  }

  valueCus(data) {
    this.projects.customerName = data.data;
  }

  valueLocation(data) {
    this.projects.location = data.data;
  }

  cbxChangeProjectGroup(data) {
    if (data.data && data.data[0]) {
      // this.projects.projectGroupID = data.data;
      // if (data.field === 'projectGroupID' && this.action == 'add')
      //   this.loadTodoByGroup(this.projects.projectGroupID);

      // BaoLV 1.TM - Danh mục dự án - Lấy giá trị trong mảng của nhóm dự án
      this.projects.projectGroupID = data.data.join(';');

    }
  }

  cbxChangeProjects(data) {
    if (data.data) {
      // this.projects.projectManeger = data.data;

      // BaoLV 1.TM - Danh mục dự án - Lấy giá trị trong mảng của dự án
      this.projects.projectManeger = data.data.join(';');
    }
  }
  changeTime(data) {
    if (!data.field) return;
    this.projects[data.field] = data.data.fromDate;
    if (data.field == 'startDate') {
      if (!this.projects.endDate)
        this.projects.endDate = moment(new Date(data.data.fromDate))
          .add(1, 'hours')
          .toDate();
    }
    if (data.field == 'startDate' || data.field == 'endDate') {
      if (this.projects.startDate && this.projects.endDate)
        this.projects.estimated = moment(this.projects.endDate).diff(
          moment(this.projects.startDate),
          'hours'
        );
    }
  }

  changeMemo(event) {
    var field = event.field;
    var dt = event.data;
    this.projects.memo = dt?.value ? dt.value : dt;
  }

  // BaoLV 1.TM - Danh mục dự án - Gọi hàm tự sinh ID khi thêm mới dự án
  initForm() {
    this.getFormGroup(this.formName, this.gridViewName).then((item) => {
      this.isAfterRender = true;
      if(this.projects.projectID == undefined) {
        this.title = this.titleAdd;
        this.getAutonumber('TMS031', 'TM_Projects', 'ProjectID').subscribe(
          (key) => {
                this.projects.projectID = key;
            }
        );
      }
      else {
        this.title = this.titleUpdate;
      }
    });
  }

  // BaoLV 1.TM - Danh mục dự án
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

  // BaoLV 1.TM - Danh mục dự án - Hàm tự sinh ID khi chọn chức năng thêm mới
  getAutonumber(functionID, entityName, fieldName): Observable<any> {
    var subject = new Subject<any>();
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.AD',
        'AutoNumbersBusiness',
        'GenAutoNumberAsync',
        [functionID, entityName, fieldName, null]
      )
      .subscribe((item) => {
        if (item) subject.next(item);
        else subject.next(null);
      });
    return subject.asObservable();
  }

  // BaoLV 1.TM - Danh mục dự án - Chức năng thêm và chỉnh sửa thông tin dự án
  onSaveOrEdit() {
    this.addOrUpdateData();
  }

  // BaoLV 1.TM - Danh mục dự án - Chức năng thêm và chỉnh sửa thông tin dự án
  beforeSaveOrEdit(op: any) {
    var data = [];
    op.method = 'AddEditProjectsAsync';
    data = [this.projects];
    op.data = data;
    return true;
  }

  // BaoLV 1.TM - Danh mục dự án - Chức năng thêm và chỉnh sửa thông tin dự án
  addOrUpdateData() {
    this.dialog.dataService
      .save((option: any) => this.beforeSaveOrEdit(option))
      .subscribe((res) => {
        // if (res.save) {
        //   this.notiService.notify('Thêm mới công việc thành công');
        // }
        // this.dialog.dataService.setDataSelected(res);
        // this.dialog.dataService.closed();
        if (res.save) {
          this.dialog.dataService.setDataSelected(res.save[0]);
          //   this.notiService.notifyCode('E0528');
        }

      });
    this.dialog.close();
  }
}
