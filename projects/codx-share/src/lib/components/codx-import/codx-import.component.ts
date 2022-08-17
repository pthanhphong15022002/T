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
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { AlertConfirmInputConfig, ApiHttpService, CallFuncService, DataRequest, DataService, DialogData, DialogModel, DialogRef, NotificationsService } from 'codx-core';
import { Observable, finalize, map, of } from 'rxjs';
import { AttachmentComponent } from '../attachment/attachment.component';
import { CodxImportAddTemplateComponent } from './codx-import-add-template/codx-import-add-template.component';

@Component({
  selector: 'codx-import',
  templateUrl: './codx-import.component.html',
  styleUrls: ['./codx-import.component.scss'],
})
export class CodxImportComponent implements OnInit, OnChanges {
  active = "1";
  dialog: any;
  submitted = false;
  gridModel: any;
  formModel: any;
  recID: any
  data = {}
  hideThumb = false;
  fileCount = 0;
  headerText: string = "Import File";
  service: string = 'SYS';
  assemblyName: string = 'AD';
  className: string = 'IEConnectionsBusiness';
  method: string = 'GetItemAsync';
  dt_AD_IEConnections: any;
  request = new DataRequest();
  importGroup: FormGroup;
  moreFunction = 
  [
    {
      id: "edit",
      icon: "icon-edit",
      text: "Chỉnh sửa",
      textColor : "#307CD2"
    },
    {
      id: "delete",
      icon: "icon-delete",
      text: "Xóa",
      textColor: "#F54E60"
    }
  ]
  @ViewChild('attachment') attachment: AttachmentComponent
  constructor(
    private callfunc: CallFuncService,
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private notifySvr: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.gridModel = dt.data?.[0];
    this.recID = dt.data?.[1];
  }
  ngOnInit(): void {
    //Tạo formGroup
    this.importGroup = this.formBuilder.group({
      dataImport: ['', Validators.required],
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
    this.request.page = 0;
    this.request.pageSize = 10;
    this.request.formName = 'PurchaseInvoices';
    this.request.gridViewName = 'grvPurchaseInvoices';
    this.request.funcID = this.formModel?.funcID;
    this.getData();
   
  }
  get f(): { [key: string]: AbstractControl } {
    return this.importGroup.controls;
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
  getData()
  {
    this.fetch().subscribe(item=>{
      this.dt_AD_IEConnections = item;
    })
  }
  private fetch(): Observable<any[]> {
    return this.api
      .execSv<Array<any>>(
        this.service,
        this.assemblyName,
        this.className,
        this.method,
        this.request
      )
      .pipe(
        finalize(() => {
          /*  this.onScrolling = this.loading = false;
          this.loaded = true; */
        }),
        map((response: any) => {
          return response[0];
        })
      );
  }
  openFormUploadFile() {
    this.attachment.uploadFile();
  }
  openFormAddTemplate()
  {
    this.callfunc.openForm(CodxImportAddTemplateComponent,null,900,800,"",[this.formModel],null);
  }
  openForm(val: any, data: any, type: any) {
    switch (val) {
      case 'add':
      case 'edit': {
       
        break;
      }
      case 'delete': {
       
        break;
      }
    }
  }
}
