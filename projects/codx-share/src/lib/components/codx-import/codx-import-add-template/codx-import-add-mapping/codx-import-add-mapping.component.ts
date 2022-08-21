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
  feildImport = [];
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
    this.cache.gridViewSetup(this.formModel?.formName,this.formModel?.gridViewName).subscribe(item=>{
      if(item)
      {
       var key = Object.keys(item);
       for(var i  = 0 ; i < key.length ; i++)
       {
          if(item[key[i]]?.isImport) this.feildImport.push(item[key[i]]);

       }
      }
      
    })
  }
}
