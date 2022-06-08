import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DataRequest, CacheService, AuthStore } from 'codx-core';
import { ViewModel } from 'codx-core/lib/layout/views/view-model';

@Component({
  selector: 'app-statistical-project',
  templateUrl: './statistical-project.component.html',
  styleUrls: ['./statistical-project.component.scss']
})
export class StatisticalProjectComponent implements OnInit {

  @ViewChild("itemOwner", { static: true }) itemOwner: TemplateRef<any>;
  @ViewChild("buttonPupop", { static: true }) buttonPupop: TemplateRef<any>;
  @ViewChild('main') main: TemplateRef<any>;


  constructor(private cache: CacheService, private auth: AuthStore, private fb: FormBuilder) { }
  model= new DataRequest();
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

  views: Array<ViewModel> = [];

  ngOnInit(): void {
    this.columnsGrid = [
      { field: 'projectName', headerText: 'Danh sách dự án' },
      { field: 'owner', headerText: 'Nguồn lực', template: this.itemOwner },
      { field: 'totalTask', headerText: 'Tổng số công việc'},
      { field: 'totalDoneTask', headerText: 'Đã hoàn tất' },
      { field: 'taskUnCompelete', headerText: 'Chưa thực hiện' },
      { field: 'rateDone', headerText: 'Tỉ lệ hoàn thành' },
      { field: 'active', headerText: 'Tỉ lệ hoàn thành đúng hạn'},
      { field: '', headerText: '', template: this.buttonPupop }
    ];
    this.cache.gridViewSetup('Tasks', 'grvTasks').subscribe(res => {
      if (res)
        this.gridViewSetup = res
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
        widthAsideRight: '900px'
      }
    },
    ];
  }

  initForm(){
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
