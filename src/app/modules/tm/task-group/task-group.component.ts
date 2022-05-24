import { TmService } from '@modules/tm/tm.service';
import { Component, OnInit, TemplateRef, ViewChild, Input, ChangeDetectorRef } from '@angular/core';
import { DataRequest, ApiHttpService, CacheService, AuthStore, UserModel, CodxGridviewComponent, CodxListviewComponent, ViewsComponent } from 'codx-core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { ToDo } from '../models/task.model';
import { TM_TaskGroups } from '../models/TM_TaskGroups.model';

@Component({
  selector: 'app-task-group',
  templateUrl: './task-group.component.html',
  styleUrls: ['./task-group.component.scss']
})
export class TaskGroupComponent implements OnInit {
  @Input() data: [];
  @Input() taskGroups = new TM_TaskGroups();

  @ViewChild('itemCreateBy', { static: true }) itemCreateBy: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('itemCreate', { static: true }) itemCreate: TemplateRef<any>;
  @ViewChild('itemStopCheck', { static: true }) itemStopCheck: TemplateRef<any>;
  @ViewChild('itemApprovalControlVll', { static: true }) itemApprovalControlVll: TemplateRef<any>;
  @ViewChild('itemProjectControlVll', { static: true }) itemProjectControlVll: TemplateRef<any>;
  @ViewChild('itemAttachmentControl', { static: true }) itemAttachmentControl: TemplateRef<any>;
  @ViewChild('itemCheckListControlVll', { static: true }) itemCheckListControlVll: TemplateRef<any>;
  @ViewChild('itemCheckList', { static: true }) itemCheckList: TemplateRef<any>;
  @ViewChild('gridView') gridView: CodxGridviewComponent;
  @ViewChild('listView') listView: CodxListviewComponent;

  user: UserModel;

  formName ="";
  gridViewName="";
  functionID = "";
  entity = "";
  listTodo: any;
  model: DataRequest;
  searchType = "0";
  addEditForm: FormGroup;
  isAfterRender = false;
  isAddMode = true;
  enableAddtodolist: boolean = false;
  todoAddText: any;
  title = 'Tạo mới nhóm công việc';

  columnsGrid = [];
  headerStyle = {
    textAlign: 'center',
    backgroundColor: '#F1F2F3',
    fontWeight: 'bold',
    border: 'none'
  }
  columnStyle = {
    border: 'none',
    fontSize: '13px !important',
    fontWeight: 400,
    lineHeight: 1.4
  }
  constructor(private tmSv: TmService, private api: ApiHttpService,
    private cache: CacheService, private auth: AuthStore, private fb: FormBuilder,
    private dt: ChangeDetectorRef,

  ) {}

  ngOnInit(): void {
   this.initForm();
    this.columnsGrid = [
      { field: 'noName', nameColumn: '', template: this.GiftIDCell, width: 30 },
      { field: 'taskGroupID', headerText: 'Mã nhóm',width: 100 },
      { field: 'taskGroupName', headerText: 'Nhóm công việc', width: 200 },
      { field: 'taskGroupName2', headerText: 'Tên khác', width: 200 },
      { field: 'note', headerText: 'Ghi chú', width: 180 },
      { field: 'approvalControl', headerText: 'Xét duyệt?', template: this.itemApprovalControlVll, width: 140 },
      { field: 'projectControl', headerText: 'Chọn dự án', template: this.itemProjectControlVll, width: 140 },
      { field: 'attachmentControl', headerText: 'Đính kèm file', template: this.itemAttachmentControl, width: 140 },
      { field: 'checkListControl', headerText: 'Nhập việc cần làm', template: this.itemCheckListControlVll, width: 180 },
      { field: 'checkList', headerText: 'CheckList', template: this.itemCheckList, width: 100 },
      { field: 'createName', headerText: 'Người tạo', template: this.itemCreateBy, width: 200 },
      { field: 'createdOn', headerText: 'Ngày tạo', template: this.itemCreate, width: 100 }
    ];
  }


  initForm() {
    this.getFormGroup(this.formName, this.gridViewName).then((item) => {
      this.addEditForm = item;
      this.isAfterRender = true;
      // this.getAutonumber(this.functionID, this.entity, "TaskGroupID").subscribe(key => {
      //   this.addEditForm.patchValue({
      //     taskGroupID: key,
      //     approvalControl: "0",
      //     projectControl: "0",
      //     attachmentControl: "0",
      //     checkListControl: "0"
      //   })

      //   this.listTodo = [];
      // })
    })
  }


  getFormGroup(formName, gridView): Promise<FormGroup> {
    return new Promise<FormGroup>((resolve, reject) => {
      this.cache.gridViewSetup(formName, gridView).subscribe(gv => {
        var model = {};
        if (gv) {
          const user = this.auth.get();
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

              // if (element.isRequire) {
              //   model[element.fieldName].push(Validators.compose([
              //     Validators.required,
              //   ]));
              // }
              // else {
              //   model[element.fieldName].push(Validators.compose([
              //   ]));
              // }
            }
          }
        }

        resolve(this.fb.group(model, { updateOn: 'blur' }));
      });
    });

  }
  getAutonumber(functionID, entityName, fieldName): Observable<any> {
    var subject = new Subject<any>();
    this.api.execSv<any>("SYS", "AD", "AutoNumbersBusiness",
      "GenAutoNumberAsync", [functionID, entityName, fieldName, null])
      .subscribe(item => {
        if (item)
          subject.next(item);
        else
          subject.next(null);
      });
    return subject.asObservable();
  }

  deleteTaskGroup(item){
    
  }
  addRow(){

  }
  getCheckList(checkList) {
    if (checkList != null) {
      return checkList.split(";");
    }
    return []

  }
  readMore(dataItem) {
    dataItem.disableReadmore = !dataItem.disableReadmore;
    this.dt.detectChanges();
    //this.tableView.addHandler(dataItem, false, "taskGroupID");
  }
}
