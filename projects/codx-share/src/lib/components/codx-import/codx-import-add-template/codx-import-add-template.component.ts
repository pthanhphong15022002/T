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
import { GridComponent, SelectionSettingsModel } from '@syncfusion/ej2-angular-grids';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { AlertConfirmInputConfig, ApiHttpService, CacheService, CallFuncService, CodxGridviewComponent, CodxService, DataRequest, DataService, DialogData, DialogModel, DialogRef, NotificationsService } from 'codx-core';
import { Observable, finalize, map, of } from 'rxjs';
import { AttachmentComponent } from '../../attachment/attachment.component';
import { CodxImportAddMappingComponent } from './codx-import-add-mapping/codx-import-add-mapping.component';
import * as XLSX from 'xlsx';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'codx-import-add-template',
  templateUrl: './codx-import-add-template.component.html',
  styleUrls: ['./codx-import-add-template.component.scss'],
})
export class CodxImportAddTemplateComponent implements OnInit, OnChanges {
  active = "1";
  dialog: any;
  submitted = false;
  gridModel: any;
  formModel: any;
  recID: any
  data = {};
  grd : any;
  hideThumb = false;
  fileCount = 0;
  headerText: string = "Thêm mới template"
  columnsGrid: any;
  editSettings: any;
  dataIEConnections: any = {};
  dataIETables: any = {};
  dataIEMapping: any = {};
  sheet:any;
  mappingTemplate:any;
  importRule :any;
  importAddTmpGroup: FormGroup;
  formModels: any;
  @ViewChild('attachment') attachment: AttachmentComponent
  @ViewChild('gridView') gridView: CodxGridviewComponent
  constructor(
    private callfunc: CallFuncService,
    private cache: CacheService,
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private notifySvr: NotificationsService,
    private codxService: CodxService,
    private ref: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.formModel = dt.data?.[0];
  }
  
  
  ngOnInit(): void {
     //Tạo formGroup
     this.importAddTmpGroup = this.formBuilder.group({
      nameTmp: ['', Validators.required],
    });
    this.columnsGrid = [
      {
        headerText: "ProcessIndex",
        width: '15%',
      },
      {
        headerText: "DestinationTable",
        width: '20%',
      },
      {
        headerText: "ParentEntity",
        width: '15%',
      },
      {
        headerText: "MappingTemplate",
        width: '20%',
      },
      {
        headerText: "ImportRule",
        width: '15%',
      },
      {
        headerText: "IsSummary",
        width: '10%',
      },
    ];
    this.getDataCbb();
    
    this.editSettings = {
      allowEditing: true,
      allowAdding: true,
      allowDeleting: true,
      newRowPosition: 'Top',
    };
    this.formModels = 
    {
      formName: "IEConnections",
      gridViewName: "grvIEConnections"
    }
  }
 
  ngOnChanges(changes: SimpleChanges) { }
  get f(): { [key: string]: AbstractControl } {
    return this.importAddTmpGroup.controls;
  }
  fileAdded(event: any) {
    if (event?.data)
    {
      debugger;
    };
  }
  getfileCount(e: any) {
    this.fileCount = e.data.length;
    
  }
  getfilePrimitive(e:any)
  {
    var dt = e[0]?.rawFile;
    if(dt)
    {
      const reader: FileReader = new FileReader();
      reader.readAsBinaryString(dt);
      reader.onload = (e: any) => {
        /* create workbook */
        const binarystr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: 'binary' });
        this.sheet = wb.SheetNames;
      };
    }
  }
  onSave()
  {
    var a = this.dataIEConnections;
    var b = this.dataIEMapping;
    var c = this.dataIETables;
    debugger;
  }
  getGridViewSetup()
  {
    this.cache.gridViewSetup("IETables","grvIETables").subscribe(item=>{
      if(item)
      {
        this.grd = item;
        this.columnsGrid = [
          {
            headerText: item["ProcessIndex"]?.headerText,
            width: '15%',
          },
          {
            headerText: item["DestinationTable"]?.headerText,
            width: '20%',
          },
          {
            headerText: item["ParentEntity"]?.headerText,
            width: '15%',
          },
          {
            headerText: 'MappingName',
            width: '20%',
          },
          {
            headerText: item["ImportRule"]?.headerText,
            width: '15%',
          },
          {
            headerText: item["IsSummary"]?.headerText,
            width: '10%',
          },
        ];
        var recIDIEConnections = crypto.randomUUID();
        var mappingTemplate = crypto.randomUUID();
        var objConnections = 
        {
          recID : recIDIEConnections,
          processIndex : 1,
          destinationTable : this.mappingTemplate?.TableName,
          parentEntity: '',
          mappingTemplate: mappingTemplate,
          importRule : this.importRule[0]?.value,
          isSummary: false,
          formName: this.formModel.formName,
          gridViewName: this.formModel.gridViewName,

        };
        this.dataIEConnections = {...objConnections , ...this.dataIEConnections}
        var recIDIETables = crypto.randomUUID();
        var objIETables = 
        {
          recID : recIDIETables,
          sessionID : this.dataIEConnections.recID,
          sourceTable : 'tự thêm vào',
          destinationTable : this.mappingTemplate?.TableName,
          mappingTemplate: this.dataIEConnections.mappingTemplate,
          firstRowHeader: true,
          firstCell: 1,
          importRule: this.importRule[0]?.value,
          processIndex: 1,
          isSummary: false,
        }
        this.dataIETables = {...objIETables , ...this.dataIETables}
        var objIEMapping = 
        {
          recID : this.dataIEConnections.mappingTemplate,
          tableName : this.mappingTemplate?.TableName,
          importRule: this.importRule[0]?.value,
          addBatchLink: false
        }
        this.dataIEMapping = {...objIEMapping , ...this.dataIEMapping}
        this.gridView.dataService.data.push(this.dataIETables);
        //this.gridView.addHandler(sdata,true,"recID")
      }
      
    })
  }
  getDataCbb()
  {
    var request = new DataRequest();
    request.comboboxName = "MappingTemplate";
    request.page=1;
    request.pageSize = 5;
    this.api
    .execSv('SYS', 'CM', 'DataBusiness', 'LoadDataCbxAsync', request).subscribe(item=>{
      if(item[0])
      {
        var data = JSON.parse(item[0]);
        this.mappingTemplate = data[0];
        this.importAddTmpGroup.controls['nameTmp'].setValue(this.mappingTemplate?.MappingName);
        this.dataIEConnections.mappingName = this.mappingTemplate?.RecID;
        this.dataIEMapping.mappingName = this.mappingTemplate?.RecID;
        this.getGridViewSetup();
      }
    })
   /*  request.comboboxName = "EntityImport";
    this.api
    .execSv('SYS', 'CM', 'DataBusiness', 'LoadDataCbxAsync', request).subscribe(item=>{
      if(item[0])
      {
       debugger;
      }
        
    }) */
    this.cache.valueList("SYS010").subscribe((item) => {
      if (item) {
       this.importRule = item.datas
      }
    });
  }
  openFormUploadFile() {
    this.attachment.uploadFile();
  }
  openFormAddTemplate()
  {
    this.callfunc.openForm(CodxImportAddMappingComponent,null,1000,800,"",[this.formModel,{recID:this.dataIETables?.recID},null],null).closed.subscribe(item=>{
      debugger;
      if(item?.event)
      {
        var result0 = item?.event[0];
        if(result0)
        {
          var recIDIETables = crypto.randomUUID();
          var IETables = {
            recID : recIDIETables,
            sessionID : this.dataIEConnections.recID,
            sourceTable : 'tự thêm vào',
            destinationTable : result0.destinationTable,
            mappingTemplate: this.dataIEConnections.mappingTemplate,
            firstRowHeader: true,
            firstCell: 1,
            importRule: result0.importRule,
            processIndex: result0.processIndex,
            parentEntity: result0.parentEntity,
            isSummary: result0.isSummary,
            mappingName: result0.mappingName
          }
          this.gridView.dataService.data = [IETables,...this.gridView.dataService.data]
          this.ref.detectChanges();
        }
      }
    });
  }
  getTextImportRule(id:any)
  {
    var data = this.importRule.filter(x=>x.value == id);
    if(data) return data[0].text;
    return "";
  }
  edit(data:any)
  {
    this.callfunc.openForm(CodxImportAddMappingComponent,null,1000,800,"",[this.formModel,data,this.dataIEMapping],null).closed.subscribe(item=>{
      if(item?.event)
      {
        debugger;
      }
    });
  }
}
