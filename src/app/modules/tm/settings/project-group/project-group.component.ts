import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthStore, CacheService, CallFuncService, CodxFormDynamicComponent } from 'codx-core';
import { ButtonModel } from 'codx-core/lib/layout/toolbar/tool-model';
import { ViewModel } from 'codx-core/lib/layout/views/view-model';

@Component({
  selector: 'app-project-group',
  templateUrl: './project-group.component.html',
  styleUrls: ['./project-group.component.scss']
})
export class ProjectGroupComponent implements OnInit {

  @ViewChild('itemCreateBy', { static: true }) itemCreateBy: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('itemCreate', { static: true }) itemCreate: TemplateRef<any>;
  @ViewChild('itemApprovalControlVll', { static: true }) itemApprovalControlVll: TemplateRef<any>;
  views: Array<ViewModel> = [];
  @ViewChild('main') main: TemplateRef<any>;
  @ViewChild('sidebarRight') sidebarRight: TemplateRef<any>;

  addEditForm: FormGroup;
  dataItem: any = {};
  isAfterRender = false;
  gridViewSetup: any;
  isAddMode = true;
  formName = "";
  gridViewName = "";
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
  }];
  constructor( private cache: CacheService, private auth: AuthStore, private fb: FormBuilder, private callfc: CallFuncService,) { }

  columnsGrid =[];

  ngOnInit(): void {
    this.columnsGrid = [
      { field: 'noName', headerText: '', template: this.GiftIDCell, width: 30 },
      { field: 'projectGroupID', headerText: 'Mã nhóm', width: 100 },
      { field: 'projectGroupName', headerText: 'Tên nhóm dự án', width: 150 },
      { field: 'projectGroupName2', headerText: 'Tên khác', width: 140 },
      { field: 'projectCategory', headerText: 'Phân loại', template: this.itemApprovalControlVll, width: 80 },
      { field: 'note', headerText: 'Ghi chú', width: 160 },
      { field: 'createName', headerText: 'Người tạo', template: this.itemCreateBy, width: 120 },
      { field: 'createdOn', headerText: 'Ngày tạo', template: this.itemCreate, width: 100 }
    ];
    this.cache.gridViewSetup('Projects', 'grvProjects').subscribe(res => {
      if (res)
        this.gridViewSetup = res;
    })
  }

  ngAfterViewInit(): void {
    this.views = [{
      id: '1',
      type: 'grid',
      sameData: false,
      active: true,
      model: {
        panelLeftRef: this.main,
        sideBarRightRef: this.sidebarRight,
        widthAsideRight: '900px'
      }
    }];
  }

  initForm() {
    this.getFormGroup(this.formName, this.gridViewName).then((item) => {
      this.addEditForm = item;
      this.isAfterRender = true;
    })
  } 

  clickButton($event, isAddMode){
    if (isAddMode == true) {
      this.isAddMode = true;
      this.openTask();
      // this.isAddMode = true;
      // this.title = 'Thêm dự án';
      // this.initFrom();
      // this.showPanel();
    }
  }

  openTask(): void {
    const t = this;
    var obj = {
      gridViewName: 'grvProjectGroups',
      formName: 'ProjectGroups',
      functionID: 'TM00633',
      entityName: 'TM_ProjectGroups',
      data: this.dataItem
    };

    this.callfc.openForm(CodxFormDynamicComponent, 'Thêm nhóm dự án', 900, 900, '', obj);
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
}
