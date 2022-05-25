import { ButtonModel } from 'codx-core/lib/layout/toolbar/tool-model';
import { TmService } from '@modules/tm/tm.service';
import { Component, OnInit, TemplateRef, ViewChild, Input, ChangeDetectorRef, Renderer2, ElementRef } from '@angular/core';
import { DataRequest, ApiHttpService, CacheService, AuthStore, UserModel, CodxGridviewComponent, CodxListviewComponent, ViewsComponent, CodxFormDynamicComponent, CallFuncService, NotificationsService } from 'codx-core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
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
  dataAddNew = new BehaviorSubject<any>(null);
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


  formName = "";
  gridViewName = "";
  functionID = "";
  entity = "";
  listTodo: any;
  model: DataRequest;
  searchType = "0";
  dataItem: any;
  addEditForm: FormGroup;
  isAfterRender = false;
  isAddMode = true;
  enableAddtodolist: boolean = false;
  todoAddText: any;
  isAddNew = this.dataAddNew.asObservable();
  totalRow = 1;
  createBy: any;
  createOn: any;
  total: number;
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

  buttons: Array<ButtonModel> = [{
    id: '1',
    text: 'Thêm'
  }]
  constructor(private tmSv: TmService, private api: ApiHttpService,
    private cache: CacheService, private auth: AuthStore, private fb: FormBuilder,
    private dt: ChangeDetectorRef, private callfc: CallFuncService,
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private notiService: NotificationsService,

  ) { }

  ngOnInit(): void {
    this.initForm();
    this.columnsGrid = [
      { field: 'noName', headerText: '', template: this.GiftIDCell, width: 30 },
      { field: 'taskGroupID', headerText: 'Mã nhóm', width: 100 },
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

  ngAfterViewInit(): void {

  }

  initForm() {
    this.getFormGroup(this.formName, this.gridViewName).then((item) => {
      this.addEditForm = item;
      this.isAfterRender = true;
      this.getAutonumber("TM00632", "TM_TaskGroups", "TaskGroupID").subscribe(key => {
        // this.addEditForm.patchValue({
        //   taskGroupID: key,
        //   approvalControl: "0",
        //   projectControl: "0",
        //   attachmentControl: "0",
        //   checkListControl: "0"
        // })
        this.taskGroups.TaskGroupID = key;
        this.taskGroups.ApprovalControl = "0";
        this.taskGroups.ProjectControl = "0";
        this.taskGroups.AttachmentControl = "0";
        this.taskGroups.CheckListControl = "0";
        this.listTodo = [];
      })
    })
  }

  addHandler(dataItem: any, isNew: boolean, key: string) {
    var t = this;
    if (!dataItem) return null;
    if (isNew) {
      this.gridView.data = [...dataItem, ...this.gridView.data];
      this.total = this.gridView.data.length;
      this.totalRow = this.gridView.data.length;
    }
    else {
      const index =
        this.gridView.data.findIndex(
          x => x[key] === dataItem[key]
        )
      this.gridView.data[index] = {};
      this.dt.detectChanges();
      this.gridView.data[index] = dataItem;
    }
    this.dt.detectChanges();
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

  clickButton(evt: any, popup: TemplateRef<any>) {
    console.log(popup);
    if (this.isAddMode == true) {
      this.isAddMode = true;
      this.initForm();
    } else {
      this.isAddMode = false;
      if (evt.checkList) {
        for (let item of evt.checkList.split(";")) {
          if (this.listTodo == null)
            this.listTodo = []
          var todo = new ToDo;
          todo.status = true;
          todo.text = item;
          this.listTodo.push(Object.assign({}, todo));
        }
      }
    }
    this.renderer.addClass(popup, 'drawer-on');

  }

  Close(popup: TemplateRef<any>) {
    this.listTodo = [];
    this.renderer.removeClass(popup, 'drawer-on');
  }

  valueApp(data) {

    this.taskGroups.ApprovalControl = data.data;

    console.log(this.taskGroups.ApprovalControl);
  }
  valuePro(data) {
    this.taskGroups.ProjectControl = data.data;
  }
  valueAtt(data) {
    this.taskGroups.AttachmentControl = data.data;

  }
  valueCheck(data) {
    this.taskGroups.CheckListControl = data.data
  }
  onChangeToDoStatus(value, index) {
    this.listTodo[index].status = value;
  }

  onDeleteTodo(index) {
    this.listTodo.splice(index, 1);//remove element from array
    this.dt.detectChanges();
  }

  onAddToDo() {
    if (this.listTodo == null)
      this.listTodo = [];
    var todo = new ToDo;
    todo.status = false;
    todo.text = this.todoAddText;
    this.listTodo.push(Object.assign({}, todo));
    //this.listTodo.push(this.todoAddText);
    this.enableAddtodolist = !this.enableAddtodolist;
    this.todoAddText = "";
    this.dt.detectChanges();
  }

  addTodolist() {

  }

  openTask(): void {
    const t = this;
    var obj = {
      gridViewName: 'grvTaskGroups',
      formName: 'TaskGroups',
      functionID: 'TM00632',
      entityName: 'TM_TaskGroups',
      // model: this.model,
      // text: this.text,
      // oldTitle: this.oldTitle,
      // id: this.id,
      // isEdit: this.isEdit,
      // name: this.name,
      // fiedName: this.fiedName,
      // formName: this.formName,
      // gridViewName: this.gridViewName,
    };

    this.callfc.openForm(CodxFormDynamicComponent, 'Dynamic', 0, 0, '', obj);
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

  openForm(data, isUpdate) {

  }

  deleteTaskGroup(item) {

  }
  addRow() {
    var t = this;
    this.tmSv.addTaskGroup(this.taskGroups)
      .subscribe((res) => {
        if (res) {
          this.notiService.notify(res[0].message);
          t.data = res[1];
          if (t.data) {
            let item = t.data;
            
            this.addHandler(item, this.isAddMode, "taskGroupID");
            this.dataAddNew.next(item);

          }
        }
      })
  }

  update

  lstSavecheckList: any = [];

  OnSaveForm() {
    this.lstSavecheckList = [];
    if (this.taskGroups.CheckListControl == '2') {
      for (let item of this.listTodo) {
        if (item.status == true) {
          this.lstSavecheckList.push(item.text)
        }
      }

      this.taskGroups.CheckList = this.lstSavecheckList.join(";");
      if (this.taskGroups.CheckList == "")
        this.taskGroups.CheckList = null;
    }
    else {
      this.taskGroups.CheckList = null;
    }
    this.addRow();
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
