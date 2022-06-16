import { Observable, Subject } from 'rxjs';
import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectorRef, Input } from '@angular/core';

import { AuthStore, CacheService, CallFuncService, CodxFormDynamicComponent, ViewsComponent, ApiHttpService, CodxGridviewComponent, UserModel, ViewType, ViewModel, ButtonModel } from 'codx-core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TM_Projects } from '@modules/tm/models/TM_Projects.model';


@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {


  @ViewChild('itemCreateBy', { static: true }) itemCreateBy: TemplateRef<any>;
  @ViewChild('itemManager', { static: true }) itemManager: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('itemCreate', { static: true }) itemCreate: TemplateRef<any>;
  @ViewChild('itemStartdate', { static: true }) itemStartdate: TemplateRef<any>;
  @ViewChild('itemEnddate', { static: true }) itemEnddate: TemplateRef<any>;
  @ViewChild('itemProjectCategoryVll', { static: true }) itemProjectCategoryVll: TemplateRef<any>;
  @ViewChild('itemStatusVll', { static: true }) itemStatusVll: TemplateRef<any>;
  @ViewChild('main') main: TemplateRef<any>;
  @ViewChild('sidebarRight') sidebarRight: TemplateRef<any>;
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('gridView') gridView: CodxGridviewComponent;

  user: UserModel;

  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [{
    id: '1',
    text: 'Thêm'
  }];

  addEditForm: FormGroup;

  columnsGrid = [];
  formName = "";
  gridViewName = "";
  isAfterRender = false;
  gridViewSetup: any;
  isAddMode: boolean = true;
  title = "";
  dataItem: any = {};
  isOpen = false;
  startDate: any;

  @Input() projects = new TM_Projects();

  constructor(private cache: CacheService, private auth: AuthStore, private fb: FormBuilder, private callfc: CallFuncService, private api: ApiHttpService
    , private dt: ChangeDetectorRef) { }

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

  ngAfterViewInit(): void {
    this.views = [{
      id: '1',
      type: ViewType.grid,
      sameData: false,
      active: true,
      model: {
        panelLeftRef: this.main,
        // sideBarRightRef: this.sidebarRight,
        // widthAsideRight: '900px'
      }
    }];
  }

  ngOnInit(): void {
    this.initFrom();
    this.columnsGrid = [
      { field: 'noName', headerText: '', template: this.GiftIDCell, width: 30 },
      { field: 'projectID', headerText: 'Mã dự án', width: 100 },
      { field: 'projectName', headerText: 'Tên dự án', width: 250 },
      { field: 'projectName2', headerText: 'Tên khác', width: 200 },
      { field: 'projectCategory', headerText: 'Phân loại', template: this.itemProjectCategoryVll, width: 140 },
      { field: 'status', headerText: 'Tình trạng', template: this.itemStatusVll, width: 140 },
      { field: 'projectManeger', headerText: 'Quản lí dự án', template: this.itemManager, width: 200 },
      { field: 'projectGroupName', headerText: 'Nhóm dự án', width: 140 },
      { field: 'customerName', headerText: 'Khách hàng', width: 200 },
      { field: 'location', headerText: 'Địa điểm', width: 250 },
      { field: 'memo', headerText: 'Ghi chú', width: 140 },
      { field: 'startDate', headerText: 'Ngày bắt đầu', template: this.itemStartdate, width: 150 },
      { field: 'finishDate', headerText: 'Ngày kết thúc', template: this.itemEnddate, width: 150 },
      { field: 'createName', headerText: 'Người tạo', template: this.itemCreateBy, width: 200 },
      { field: 'createdOn', headerText: 'Ngày tạo', template: this.itemCreate, width: 100 }
    ];
    this.cache.gridViewSetup('Projects', 'grvProjects').subscribe(res => {
      if (res)
        this.gridViewSetup = res;
    })
  }

  initFrom() {
    this.getFormGroup(this.formName, this.gridViewName).then((item) => {
      this.addEditForm = item;
      this.isAfterRender = true;
      this.getAutonumber("TM00631", "TM_Projects", "ProjectID").subscribe(key => {
        //  this.addEditForm.patchValue({
        //    projectID : key
        //  });

        this.projects.projectID = key;
      })
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

  openForm(dataItem, isAddMode) {
    this.isOpen = true;
    if (isAddMode == true) {
      this.isAddMode = true;
      this.dataItem = {};
      this.dt.detectChanges();
      this.openTask();
    }
    else {
      this.isAddMode = false;
      this.api
        .callSv(
          "TM",
          "ERM.Business.TM",
          "ProjectsBusiness",
          "GetAsync",
          [dataItem.projectID]
        )
        .subscribe((res) => {
          if (res && res.msgBodyData.length > 0) {
            this.dataItem = res.msgBodyData[0];
            this.dt.detectChanges();
            this.openTask();
          }
        });
      // this.startDate = this.addEditForm.value.startDate;
    }
  }

  setDefaultValue(e) {
    this.getAutonumber("TM00631", "TM_Projects", "ProjectID").subscribe(key => {
      e.projectID = key;
      e.isGroup = true;
      e.autoCode = false;
      e.projectDate = new Date();
      this.dataItem = e;
      this.dt.detectChanges();
    })
  }

  saveAfter(e) {
    this.Close();
    var t = this;
    t.gridView.loadData();
  }

  OnSaveForm() {
    this.addEditForm.value.isGroup = true;
    this.addEditForm.value.autoCode = true;
    this.addEditForm.value.projectDate = "05/31/2022"
    this.addEditForm.value.startDate = this.startDate;
    return this.api
      .execSv("TM", "TM", "ProjectsBusiness", "AddEditProjectsAsync", [
        this.addEditForm.value, this.isAddMode
      ])
      .subscribe((res) => {
        if (res) {

          let item = this.addEditForm.value;
          item.createName = this.user.userName;
          item.createdBy = this.user.userID;
          this.gridView.addHandler(item, this.isAddMode, "projectID");
          this.Close();
        }
      });
  }

  clickButton(evt: any, isAddMode) {
    if (isAddMode == true) {
      this.openTask();
      // this.isAddMode = true;
      // this.title = 'Thêm dự án';
      // this.initFrom();
      // this.showPanel();
    }

    //  this.renderer.addClass(popup, 'drawer-on');
  }

  showPanel() {
    // this.viewBase.currentView.openSidebarRight();
  }

  openTask(): void {
    const t = this;
    var obj = {
      gridViewName: 'grvProjects',
      formName: 'Projects',
      functionID: 'TM00631',
      entityName: 'TM_Projects',
      data: this.dataItem
    };

    this.callfc.openForm(CodxFormDynamicComponent, 'Thêm nhóm công việc', 900, 900, '', obj);
  }

  Close() {
    this.dataItem = null;
    // this.renderer.removeClass(popup, 'drawer-on');
    //this.viewBase.currentView.closeSidebarRight();
  }

  taskAction: any;
  showControl(p, item) {
    this.taskAction = item;
    p.open();
  }
}
