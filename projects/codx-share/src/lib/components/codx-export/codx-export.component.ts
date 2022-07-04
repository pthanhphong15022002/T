import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { ApiHttpService, CallFuncService, DataRequest, DataService, DialogData, DialogModel, DialogRef } from 'codx-core';
import { CodxExportAddComponent } from './codx-export-add/codx-export-add.component';

@Component({
  selector: 'codx-export',
  templateUrl: './codx-export.component.html',
  styleUrls: ['./codx-export.component.scss'],
})
export class CodxExportComponent implements OnInit, OnChanges
{
  submitted = false;
  gridModel : any;
  recID :any
  data = {}
  dataEx: any;
  dialog: any;
  formModel : any;
  exportGroup : FormGroup;
  lblExtend: string = '';
  request = new DataRequest();
  constructor(
    private callfunc: CallFuncService,
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    this.dialog = dialog;
    this.gridModel = dt.data?.[0];
    this.recID = dt.data?.[1];
  }
  ngOnInit(): void {
    //Tạo formGroup
    this.exportGroup = this.formBuilder.group({
      dataExport : ['' ,  Validators.required],
      format : ['' ,  Validators.required]
    });
    //Tạo formModel
    this.formModel = 
    {
      entityName: this.gridModel?.entityName,
      entityPer: this.gridModel?.entityPermission,
      formName: this.gridModel?.formName,
      funcID: this.gridModel?.funcID,
      gridViewName: this.gridModel?.gridViewName
    }
    //Load data excel template
    this.load();
  }
  get f(): { [key: string]: AbstractControl } {
    return this.exportGroup.controls;
  }
  ngOnChanges(changes: SimpleChanges) {}
  load()
  {
    var option = new DataRequest();
    option.page=0;
    option.pageSize=10;
    option.entityName = 'AD_ExcelTemplates';
    option.funcID = "ODT3";
    this.api.execSv<any>(
      'SYS',
      'AD', 
      'ExcelTemplatesBusiness', 
      'GetByEntityAsync', 
      option
    ).subscribe(item=>
    {
      if(item[0])
        this.dataEx = item[0]
      })
  }
  openForm(val:any,data:any)
  {
    switch(val)
    {
      case 'add' : case 'edit' :
        {
          var option = new DialogModel();
          option.FormModel = this.formModel;
          option.DataService = data;
          
          this.callfunc.openForm(CodxExportAddComponent,null,null,800,null, {type:val}, "", option)
          .closed.subscribe(item=>
          {
            if(item.event == true) this.load();
          })
          break;
        }
      case "edit":
        {
          console.log(data);
          break;
        }
      case "delete":
        {
          break;
        }
    }
  }
  onSave()
  {
    this.submitted = true;
    if(this.exportGroup.invalid) return;
    var dt = this.exportGroup.value;
    switch(dt.format)
    {
      case "excel":
        {
          if(dt.dataExport == "all")
          {
            this.gridModel.page=0;
            this.gridModel.pageSize=10000;
          }
          else if(dt.dataExport == "selected")
          {
            this.gridModel.predicates = this.gridModel.predicate+"&&RecID=@1"
            this.gridModel.dataValues = [this.gridModel.dataValue,this.recID].join(";");
          }
          break;
        }
    }
    
    this.api.execSv<any>("OD",'CM', 'CMBusiness', 'ExportExcelAsync', this.gridModel).subscribe(item=>
    {
      if(item)
      {
        this.downloadFile(item);
      }
      
    }) 
      
  }
  downloadFile(data: any) {
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url= window.URL.createObjectURL(blob);
    window.open(url);
  }
}
