import { TM_Tasks } from './../../models/TM_Tasks.model';
import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DataRequest, CacheService, AuthStore, ApiHttpService, CallFuncService, ViewModel, ViewType } from 'codx-core';

import { ProjectChartComponent } from './project-chart/project-chart.component';

@Component({
  selector: 'app-statistical-project',
  templateUrl: './statistical-project.component.html',
  styleUrls: ['./statistical-project.component.scss']
})
export class StatisticalProjectComponent implements OnInit {

  @ViewChild("itemOwner", { static: true }) itemOwner: TemplateRef<any>;
  @ViewChild("buttonPupop", { static: true }) buttonPupop: TemplateRef<any>;
  @ViewChild('main') main: TemplateRef<any>;
  @Input() data = [];

  constructor(private cache: CacheService, private auth: AuthStore, private fb: FormBuilder, private api: ApiHttpService, private callfc: CallFuncService,) { }
  model = new DataRequest();
  @Input() report = new TM_Tasks();

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
  gridViewSetup: any;
  formName = "";
  gridViewName = "";
  functionID = "";
  entity = "";
  isAfterRender = false;
  lstOwner = [];

  views: Array<ViewModel> = [];

  ngOnInit(): void {
    this.loadData();

    // this.columnsGrid = [
    //   { field: 'projectName', headerText: 'Danh sách dự án' },
    //   { field: 'owner', headerText: 'Nguồn lực', template: this.itemOwner },
    //   { field: 'totalTask', headerText: 'Tổng số công việc' },
    //   { field: 'totalDoneTask', headerText: 'Đã hoàn tất' },
    //   { field: 'taskUnCompelete', headerText: 'Chưa thực hiện' },
    //   { field: 'rateTaskDone', headerText: 'Tỉ lệ hoàn thành' },
    //   { field: 'rateTaskDoneTime', headerText: 'Tỉ lệ hoàn thành đúng hạn' },
    //   { field: '', headerText: '', template: this.buttonPupop }
    // ];
    // this.cache.gridViewSetup('Tasks', 'grvTasks').subscribe(res => {
    //   if (res)
    //     this.gridViewSetup = res
    // })
  }
  ngAfterViewInit(): void {
    this.views = [{
      id: '1',
      type: ViewType.grid,
      sameData: false,
      active: true,
      model: {
        panelLeftRef: this.main,

        // widthAsideRight: '900px'
      }
    },
    ];
  }

  loadData() {
    let model = new DataRequest();
    model.formName = 'Tasks';
    model.gridViewName = 'grvTasks';
    model.entityName = 'TM_Tasks';
    model.page = 1;
    model.pageSize = 100;
    this.api.execSv<any>("TM", "TM", "ReportBusiness", "ListReportProjectAsync", model).subscribe((res) => {
      if (res) {
        this.data = res[0];
        //   this.lstOwner = res[0];
      }
    })
  }

  openPopup(item: any) {
    this.callfc.openForm(ProjectChartComponent, 'ERM_Phát triển nội bộ', 1500, 800, '', item);
  }

  initForm() {
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
