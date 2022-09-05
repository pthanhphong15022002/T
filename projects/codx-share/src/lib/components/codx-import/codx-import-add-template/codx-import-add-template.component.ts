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
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  GridComponent,
  SelectionSettingsModel,
} from '@syncfusion/ej2-angular-grids';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxGridviewComponent,
  CodxService,
  DataRequest,
  DataService,
  DialogData,
  DialogModel,
  DialogRef,
  NotificationsService,
} from 'codx-core';
import { Observable, finalize, map, of } from 'rxjs';
import { AttachmentComponent } from '../../attachment/attachment.component';
import { CodxImportAddMappingComponent } from './codx-import-add-mapping/codx-import-add-mapping.component';
import * as XLSX from 'xlsx';
import { IETables } from '../models/import.model';

@Component({
  selector: 'codx-import-add-template',
  templateUrl: './codx-import-add-template.component.html',
  styleUrls: ['./codx-import-add-template.component.scss'],
})
export class CodxImportAddTemplateComponent implements OnInit, OnChanges {
  type = "add";
  active = "1";
  dialog: any;
  submitted = false;
  gridModel: any;
  formModel: any;
  recID: any;
  data = {};
  grd: any;
  hideThumb = false;
  fileCount = 0;
  headerText: string = 'Thêm mới template';
  columnsGrid: any;
  editSettings: any;
  dataIEConnections: any = {};
  dataIETables: any = {};
  dataIEMapping: any = {};
  sheet: any;
  mappingTemplate: any;
  importRule: any;
  importAddTmpGroup: FormGroup;
  formModels: any;
  dataSave = 
  {
    dataIEMapping:[],
    dataIEFieldMapping:[],
  }

  //////////////////////
  service = 'SYS'
  /////////////////////
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
    debugger;
    this.dialog = dialog;
    if(dt.data[0]) this.type = dt.data[0];
    this.formModel = dt.data?.[1];
    if(dt.data?.[2])
      this.recID=dt.data?.[2];
  }

  ngOnInit(): void {
    //Tạo formGroup
    this.importAddTmpGroup = this.formBuilder.group({
      nameTmp: ['', Validators.required],
      sheetImport: '',
    });
    this.columnsGrid = [
      {
        headerText: 'ProcessIndex',
        width: '15%',
      },
      {
        headerText: 'DestinationTable',
        width: '20%',
      },
      {
        headerText: 'ParentEntity',
        width: '15%',
      },
      {
        headerText: 'MappingTemplate',
        width: '20%',
      },
      {
        headerText: 'ImportRule',
        width: '15%',
      },
      {
        headerText: 'IsSummary',
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

    if(this.recID) this.getDataEdit();
  }
  getDataEdit()
  {
    var request = new DataRequest();
    request.page = 0;
    request.pageSize = 20;
    this.api.execSv<any>(this.service,"AD","IETablesBusiness","GetItemByIEConnectionAsync",[request,this.recID]).subscribe(item=>{
      if(item && item[0])
      {
        this.gridView.dataService.data = item[0]
      }
      // if(item) this.notifySvr.notifyCode('OD008');
      // else this.notifySvr.notifyCode('SYS021');
    })
  }
  ngOnChanges(changes: SimpleChanges) { }
  get f(): { [key: string]: AbstractControl } {
    return this.importAddTmpGroup.controls;
  }
  fileAdded(event: any) {
    if (event?.data && event?.data[0]) this.dataIEConnections.fileName = event?.data[0].fileName;
  }
  getfileCount(e: any) {
    this.fileCount = e.data.length;
  }
  getfilePrimitive(e: any) {
    var dt = e[0]?.rawFile;
    if (dt) {
      const reader: FileReader = new FileReader();
      reader.readAsBinaryString(dt);
      reader.onload = (e: any) => {
        /* create workbook */
        const binarystr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: 'binary' });
        this.sheet = wb.SheetNames;
        this.importAddTmpGroup.controls['sheetImport'].setValue(this.sheet[0]);
        this.dataIETables.sourceTable = this.sheet[0];
      };
    }
  }
  onSave()
  {
    this.attachment.objectId = this.dataIEConnections.recID;
    for(var i =0 ; i< this.gridView.dataService.data.length ; i++)
    {
      delete this.gridView.dataService.data[i].mappingName;
    }
    this.dataIEConnections.description = this.importAddTmpGroup.value.nameTmp;
   
    this.attachment.saveFilesObservable().subscribe((item:any)=>{
      if(item?.status == 0)
      {
        //Lưu IEConnections
        this.api.execSv<any>("SYS","AD","IEConnectionsBusiness","AddItemAsync",this.dataIEConnections).subscribe(item=>{
          debugger;
          // if(item) this.notifySvr.notifyCode('OD008');
          // else this.notifySvr.notifyCode('SYS021');
        })
        this.api.execSv<any>("SYS","AD","IETablesBusiness","AddItemAsync",JSON.stringify(this.gridView.dataService.data)).subscribe(item=>{
          debugger;
          // if(item) this.notifySvr.notifyCode('OD008');
          // else this.notifySvr.notifyCode('SYS021');
        })
        this.api.execSv<any>("SYS","AD","IEMappingsBusiness","AddItemAsync",JSON.stringify(this.dataSave.dataIEMapping)).subscribe(item=>{
          debugger;
          // if(item) this.notifySvr.notifyCode('OD008');
          // else this.notifySvr.notifyCode('SYS021');
        })
        if(this.dataSave.dataIEFieldMapping.length>0)
        {
          this.api.execSv<any>("SYS","AD","IEFieldMappingBusiness","AddItemAsync",this.dataSave.dataIEFieldMapping).subscribe(item=>{
            debugger;
            // if(item) this.notifySvr.notifyCode('OD008');
            // else this.notifySvr.notifyCode('SYS021');
          })
        }
        //
      }
      else this.notifySvr.notify("Vui lòng đính kèm file");
    })
   
  }
  changeSheetImport(e:any)
  {
    this.importAddTmpGroup.controls["sheetImport"].setValue(e);
    
  }
  getGridViewSetup()
  {
    this.cache.gridViewSetup("IETables","grvIETables").subscribe(item=>{
      if(item)
      {
        this.grd = item;
        if(this.type == "add") this.defaultData();
      }
      
    })
  }
  defaultData()
  {
    this.columnsGrid = [
      {
        headerText: this.grd["ProcessIndex"]?.headerText,
        width: '15%',
      },
      {
        headerText: this.grd["DestinationTable"]?.headerText,
        width: '20%',
      },
      {
        headerText: this.grd["ParentEntity"]?.headerText,
        width: '15%',
      },
      {
        headerText: 'MappingName',
        width: '20%',
      },
      {
        headerText: this.grd["ImportRule"]?.headerText,
        width: '15%',
      },
      {
        headerText: this.grd["IsSummary"]?.headerText,
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
      formName: "PurchaseInvoices",
      gridViewName: "grvPurchaseInvoices",

    };
    this.dataIEConnections = {...objConnections , ...this.dataIEConnections}
    var objIETables = new IETables();
    objIETables.recID = crypto.randomUUID(),
    objIETables.sessionID = this.dataIEConnections.recID,
    objIETables.sourceTable = "",
    objIETables.destinationTable = this.mappingTemplate?.TableName,
    objIETables.mappingTemplate= this.dataIEConnections.mappingTemplate,
    objIETables.firstRowHeader= true;
    objIETables.firstCell = "1",
    objIETables.importRule = this.importRule[0]?.value,
    objIETables.processIndex = 1,
    objIETables.isSummary = false,
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
    this.dataSave.dataIEMapping.push(this.dataIEMapping);
    //this.gridView.addHandler(sdata,true,"recID")
  }
  getDataCbb() {
    var request = new DataRequest();
    request.comboboxName = 'MappingTemplate';
    request.page = 1;
    request.pageSize = 5;
    this.api
    .execSv('SYS', 'CM', 'DataBusiness', 'LoadDataCbxAsync', request).subscribe(item=>{
      if(item[0])
      {
        var data = JSON.parse(item[0]);
        //Nhớ sửa lại lấy cái đầu tiên
        this.mappingTemplate = data[1];
        this.importAddTmpGroup.controls['nameTmp'].setValue(this.mappingTemplate?.MappingName);
        this.dataIEConnections.mappingName = this.mappingTemplate?.MappingName;
        this.dataIEMapping.mappingName = this.mappingTemplate?.MappingName;
        this.dataIETables.mappingName = this.mappingTemplate?.MappingName;
        this.getGridViewSetup();
      }
    })
   /*  request.comboboxName = "EntityImport";
    this.api
    .execSv('SYS', 'CM', 'DataBusiness', 'LoadDataCbxAsync', request).subscribe(item=>{
      if(item[0])
      {
       
      }
        
    }) */
    this.cache.valueList('SYS010').subscribe((item) => {
      if (item) {
        this.importRule = item.datas;
      }
    });
  }
  openFormUploadFile() {
    this.attachment.uploadFile();
  }
  //Thêm mới template
  openFormAddTemplate()
  {
    if(!this.importAddTmpGroup.value.sheetImport) return this.notifySvr.notify("sheet import không được trống");
    this.dataIETables.sourceTable = this.importAddTmpGroup.value.sheetImport;
    this.callfunc.openForm(CodxImportAddMappingComponent,null,1000,800,"",[this.formModel,this.dataIEConnections,null,null,"new"],null).closed.subscribe(item=>{
      if(item?.event)
      {
        var dataTable = item?.event[0] as IETables;
        dataTable.sourceTable = this.dataIETables.sourceTable;
        this.dataSave.dataIEMapping.push(item?.event[1]);
        this.dataSave.dataIEFieldMapping.push(item?.event[2]);
        item?.event[0]
        this.gridView.dataService.data = [item?.event[0],...this.gridView.dataService.data]
      }
    });
  }
  getTextImportRule(id: any) {
    var data = this.importRule.filter((x) => x.value == id);
    if (data) return data[0].text;
    return '';
  }
  edit(data: any) {
    this.callfunc
      .openForm(
        CodxImportAddMappingComponent,
        null,
        1000,
        800,
        '',
        [
          this.formModel,
          this.dataIEConnections,
          this.dataIETables,
          this.dataIEMapping,
          'edit',
        ],
        null
      )
      .closed.subscribe((item) => {
        if (item?.event) {
        }
      });
  }
}
