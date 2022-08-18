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
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { AlertConfirmInputConfig, ApiHttpService, CacheService, CallFuncService, CodxGridviewComponent, CodxService, DataRequest, DataService, DialogData, DialogModel, DialogRef, NotificationsService } from 'codx-core';
import { Observable, finalize, map, of } from 'rxjs';
import { AttachmentComponent } from '../../attachment/attachment.component';
import { CodxImportAddMappingComponent } from './codx-import-add-mapping/codx-import-add-mapping.component';
import * as XLSX from 'xlsx';
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
  data = {}
  hideThumb = false;
  fileCount = 0;
  headerText: string = "Thêm mới template"
  columnsGrid: any;
  editSettings: any;
  dataIEConnecttions: any;
  sheet:any;
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
    this.columnsGrid = [
      {
        headerText: "ProcessIndex",
        width: '10%',
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
        width: '15%',
      },
    ];
    this.getGridViewSetup();
   
   
    this.editSettings = {
      allowEditing: true,
      allowAdding: true,
      allowDeleting: true,
      newRowPosition: 'Top',
    };
  }
 
  ngOnChanges(changes: SimpleChanges) { }
 
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
    
  }
  addItem()
  {
    this.gridView.addRow();
  }
  getGridViewSetup()
  {
    this.cache.gridViewSetup("IETables","grvIETables").subscribe(item=>{
      if(item)
      {
        this.codxService
        .getAutoNumber(this.formModel?.funcID, this.formModel?.entityName, "recID")
        .subscribe((dt: any) => {
          this.columnsGrid = [
            {
              headerText: item["ProcessIndex"]?.headerText,
              width: '10%',
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
              headerText: item["MappingTemplate"]?.headerText,
              width: '20%',
            },
            {
              headerText: item["ImportRule"]?.headerText,
              width: '15%',
            },
            {
              headerText: item["IsSummary"]?.headerText,
              width: '15%',
            },
          ];
          this.dataIEConnecttions = 
          {
            processIndex : 0,
            destinationTable : "Chưa có cbb",
            parentEntity: '',
            mappingTemplate: dt,
            importRule : "Chưa có cbb",
            isSummary: false,
            formName: this.formModel.formName,
            gridViewName: this.formModel.gridViewName,

          }
          var dataIEMapping = {};
          var dataIEFieldMapping = {};
          this.gridView.dataService.data.push(this.dataIEConnecttions,this.dataIEConnecttions);
        });
       
        //this.gridView.addHandler(sdata,true,"recID")
      }
      
    })
  }
 
  openFormUploadFile() {
    this.attachment.uploadFile();
  }
  openFormAddTemplate()
  {
    this.callfunc.openForm(CodxImportAddMappingComponent,null,900,800,"",[this.formModel],null);
  }
}
