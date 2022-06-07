import { ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthStore, CacheService, CodxGridviewComponent, DataRequest, ViewsComponent, ApiHttpService } from 'codx-core';
import { ViewModel } from 'codx-core/lib/layout/views/view-model';

@Component({
  selector: 'app-statistical-viewlist',
  templateUrl: './statistical-viewlist.component.html',
  styleUrls: ['./statistical-viewlist.component.scss']
})
export class StatisticalViewlistComponent implements OnInit {
  @ViewChild("itemDueDate", { static: true }) itemDueDate: TemplateRef<any>;
  @ViewChild("GiftIDCell", { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild("itemCreate", { static: true }) itemCreate: TemplateRef<any>;
  @ViewChild("itemOwner", { static: true }) itemOwner: TemplateRef<any>;
  @ViewChild("itemStatusVll", { static: true }) itemStatusVll: TemplateRef<any>;
  @ViewChild("itemMemo", { static: true }) itemMemo: TemplateRef<any>;
  @ViewChild("itemCompletedOn", { static: true }) itemCompletedOn: TemplateRef<any>;

  @ViewChild('main') main: TemplateRef<any>;
  @ViewChild('sidebarRight') sidebarRight: TemplateRef<any>;
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('addLines') addLines: TemplateRef<any>;
  @ViewChild("add", { static: true }) add: TemplateRef<any>;
  @ViewChild('gridView') gridView: CodxGridviewComponent;
  @Input() data=[];
  constructor(private cache: CacheService, private auth: AuthStore, private dt: ChangeDetectorRef, private fb: FormBuilder,
    private api: ApiHttpService) { }

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
    this.loadData();
    this.columnsGrid = [
      { field: 'priority', headerText: '', template: this.GiftIDCell },
      { field: 'taskName', headerText: 'Tên công việc' },
      { field: 'status', headerText: 'Tình trạng', template: this.itemStatusVll },
      { field: 'memo', headerText: 'Mổ tả công việc', template: this.itemMemo },
      { field: 'owner', headerText: 'Người thực hiện', template: this.itemOwner },
      { field: 'dueDate', headerText: 'Ngày hết hạn', template: this.itemDueDate },
      { field: 'completedOn', headerText: 'Ngày hoàn tất', template: this.itemCompletedOn },
      { field: 'taskGroupName', headerText: 'Nhóm công việc' },
      { field: 'projectName', headerText: 'Dự án' },
      { field: 'buid', headerText: 'Bộ phận người thực hiện' }
    ];
    this.cache.gridViewSetup('TaskDaily', 'grvTaskDaily').subscribe(res => {
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

  loadData(){
    let model = new DataRequest();
    model.formName = 'TaskDaily';
    model.gridViewName = 'grvTaskDaily';
    model.entityName = 'TM_sprTaskDaily';
    model.predicate = '';

    model.page = 1;
    model.pageSize = 100;
   
    const t = this;
    t.api.execSv<any>("TM","TM","ReportBusiness","ListReportTasksAsync",this.model).subscribe((res)=>{
      if(res){
        this.data = res;
      }
    })
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
