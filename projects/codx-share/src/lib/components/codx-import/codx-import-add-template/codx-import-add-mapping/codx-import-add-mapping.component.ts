import {
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
import { AlertConfirmInputConfig, ApiHttpService, CacheService, CallFuncService, CodxGridviewComponent, DataRequest, DataService, DialogData, DialogModel, DialogRef, NotificationsService } from 'codx-core';
import { Observable, finalize, map, of } from 'rxjs';

@Component({
  selector: 'codx-import-add-mapping',
  templateUrl: './codx-import-add-mapping.component.html',
  styleUrls: ['./codx-import-add-mapping.component.scss'],
})
export class CodxImportAddMappingComponent implements OnInit, OnChanges {
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
  dataService:any={data:null};
  @ViewChild('gridView') gridView: CodxGridviewComponent
  constructor(
    private callfunc: CallFuncService,
    private cache: CacheService,
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private notifySvr: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.formModel = dt.data?.[0];
  }
  
  ngOnInit(): void {

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
    if (event?.data) this.hideThumb = true;
  }
  getfileCount(e: any) {
    this.fileCount = e.data.length;
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
        this.columnsGrid = [
          {
            field: "ProcessIndex",
            headerText: item["ProcessIndex"]?.headerText,
            width: '10%',
            type:'number'
          },
          {
            field: "DestinationTable",
            headerText: item["DestinationTable"]?.headerText,
            width: '20%',
            type:'text'
          },
          {
            field: "ParentEntity",
            headerText: item["ParentEntity"]?.headerText,
            width: '15%',
            type:'text'
          },
          {
            field: "MappingTemplate",
            headerText: item["MappingTemplate"]?.headerText,
            width: '20%',
            type:'text'
          },
          {
            field: "ImportRule",
            headerText: item["ImportRule"]?.headerText,
            width: '15%',
            type:'text'
          },
          {
            field: "IsSummary",
            headerText: item["IsSummary"]?.headerText,
            width: '15%',
            type:'switch'
          },
        ];
        var sdata = 
        {
          recID : '11111',
          processIndex : 0,
          destinationTable : "a",
          parentEntity: 'a',
          mappingTemplate: 'aaaa',
          importRule : 1,
          isSummary: true
        }
        this.gridView.dataService.data.push(sdata);
        this.gridView.addHandler(sdata,true,"recID")
      }
      
    })
  }
}
