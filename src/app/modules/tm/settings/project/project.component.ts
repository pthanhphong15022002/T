import { Subject } from 'rxjs';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ViewModel } from 'codx-core/lib/layout/views/view-model';
import { AuthStore, CacheService, ViewsComponent } from 'codx-core';
import { FormBuilder, FormGroup } from '@angular/forms';

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

  views: Array<ViewModel> = [];

  columnsGrid = [];
  formName = "";
  gridViewName = "";
  isAfterRender = false;
  gridViewSetup: any;

  constructor( private cache: CacheService, private auth: AuthStore, private fb: FormBuilder,) { }

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

  initFrom(){
    this.getFormGroup(this.formName, this.gridViewName).then((item) => {
      this.isAfterRender = true;
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
  
}
