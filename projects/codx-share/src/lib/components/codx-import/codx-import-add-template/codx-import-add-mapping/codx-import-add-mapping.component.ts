import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Injector,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Html } from '@syncfusion/ej2-angular-diagrams';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { AlertConfirmInputConfig, ApiHttpService, CacheService, CallFuncService, CodxGridviewComponent, DataRequest, DataService, DialogData, DialogModel, DialogRef, NotificationsService } from 'codx-core';
import { Observable, finalize, map, of } from 'rxjs';

@Component({
  selector: 'codx-import-add-mapping',
  templateUrl: './codx-import-add-mapping.component.html',
  styleUrls: ['./codx-import-add-mapping.component.scss'],
})
export class CodxImportAddMappingComponent implements OnInit, OnChanges {
  @ViewChild('grid') grid : GridComponent;
  active = "1";
  dialog: any;
  submitted = false;
  gridModel: any;
  formModel: any;
  formModels:any = {};
  recID: any
  data = {}
  hideThumb = false;
  fileCount = 0;
  headerText: string = "Thêm mới template"
  columnsGrid: any;
  editSettings: any;
  dataService:any={data:null};
  fieldImport = [];
  dataImport  = [];
  date=new Date();
  sessionID: any;
  mappingTemplate: any;
  dataIETable:any = {};
  dataIEMapping:any = {};
  addMappingForm :any;
  @ViewChild('gridView') gridView: CodxGridviewComponent
  constructor(
    private callfunc: CallFuncService,
    private cache: CacheService,
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private notifySvr: NotificationsService,
    private ref: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    debugger;
    this.dialog = dialog;
    this.formModel = dt.data?.[0];
    this.dataIETable = dt.data?.[1];
    this.dataIEMapping = dt.data?.[2];
    this.sessionID =  this.dataIETable?.recID;
    this.mappingTemplate = this.dataIEMapping?.recID;
    this.addMappingForm = this.formBuilder.group({
      mappingName: [this.dataIEMapping?.mappingName],
      processIndex: [this.dataIETable?.processIndex],
      destinationTable: [this.dataIETable?.destinationTable],
      parentEntity:[this.dataIETable?.parentEntity],
      importRule: [this.dataIETable?.importRule],
      isSummary: [this.dataIETable?.isSummary]
    });
  }
  
  ngOnInit(): void {
    this.formModels = {
      formName: 'IETables',
      gridViewName : 'grvIETables'
    }
    this.getGridViewSetup();
  }
 
  ngOnChanges(changes: SimpleChanges) { }
 
  fileAdded(event: any) {
    if (event?.data) this.hideThumb = true;
  }
  getfileCount(e: any) {
    this.fileCount = e.data.length;
  }
  onSave()
  {
    this.addMappingForm.value.parentEntity = this.addMappingForm.value?.parentEntity[0];
    this.dataIETable.mappingName = this.addMappingForm.value?.mappingName;
    this.dataIETable.processIndex = this.addMappingForm.value?.processIndex;
    this.dataIETable.destinationTable = this.addMappingForm.value?.destinationTable;
    this.dataIETable.parentEntity = this.addMappingForm.value?.parentEntity;
    this.dataIETable.importRule = this.addMappingForm.value?.importRule;
    this.dataIETable.isSummary = this.addMappingForm.value?.isSummary;
    this.dialog.close([this.dataIETable , this.dataImport]);
  }
  addItem()
  {
    this.gridView.addRow();
  }
  getGridViewSetup()
  {
    debugger;
    this.cache.gridViewSetup(this.formModel?.formName,this.formModel?.gridViewName).subscribe(item=>{
      if(item)
      {
       var key = Object.keys(item);
       for(var i  = 0 ; i < key.length ; i++)
       {
          if(item[key[i]]?.isImport) 
          {
            var obj = {
              "headerText": "destinationField",
              "data": key[i],
            }
            this.fieldImport.push("destinationField");
            this.dataImport.push(obj);
          }
       }
       this.cache.gridViewSetup(this.formModels.formName,this.formModels.gridViewName).subscribe(item=>{
        if(item)
        {
          var key = Object.keys(item);
          for(var i  = 0 ; i < key.length ; i++)
          {
             if(item[key[i]]?.isVisible)
             {
              debugger;
              this.fieldImport.push(item[key[i]]);
              for(var x = 0 ; x< this.dataImport.length; x++)
              {
                var obj = 
                {
                  headerText : key[i],
                  data : ""
                }
                if(item[key[i]]?.controlType == "CheckBox") 
                {
                  obj.data = "false";
                }
                this.dataImport[x].push(obj);
                
              }
              
             } 
          }
          this.dataImport = [...this.dataImport,[]]
        }
      })
      }
    })
  }
  changeValueText(item:any,field:any,data:any)
  {
    item[field] = data?.data;
    if(data?.component)
    {
      var value = data?.component?.dataSource.filter(x=>x.value == data?.data);
      item[field] = value[0].text
    }
  }
  changeValueCBB(data:any , field:any, check=false)
  {
    debugger;
    this.addMappingForm.get(field).setValue(data?.data);
    if(data?.component?.itemsSelected && check)
      this.addMappingForm.get("destinationTable").setValue(data?.component?.itemsSelected[0]?.TableName);
  }
  clicktest()
  {
    debugger;
   
    var a = this.dataImport;
  }
  html()
  {
    const child = document.createElement('td');
    let html = `<codx-input type="text"></codx-input>`;
    child.innerHTML = html;
  
  }
}
