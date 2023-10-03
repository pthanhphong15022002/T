import {
  AfterViewInit,
  Component,
  OnChanges,
  OnInit,
  Optional,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  ApiHttpService,
  CallFuncService,
  DataRequest,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';
import { Observable, finalize, map } from 'rxjs';
import { CodxImportAddTemplateComponent } from './codx-import-add-template/codx-import-add-template.component';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';

@Component({
  selector: 'codx-import',
  templateUrl: './codx-import.component.html',
  styleUrls: ['./codx-import.component.scss'],
})
export class CodxImportComponent implements OnInit, OnChanges, AfterViewInit {
  active = '1';
  dialog: any;
  submitted = false;
  gridModel: any;
  formModel: any;
  recID: any;
  data = {};
  hideThumb = false;
  fileCount = 0;
  hScroll = 0;
  headerText: string = 'Import File';
  service: string = 'SYS';
  assemblyName: string = 'AD';
  className: string = 'IEConnectionsBusiness';
  method: string = 'GetItemAsync';
  dt_AD_IEConnections: any;
  request = new DataRequest();
  importGroup: FormGroup;
  binaryString: any;
  fileName: any;
  moreFunction = [
    {
      id: 'edit',
      icon: 'icon-edit',
      text: 'Chỉnh sửa',
      textColor: '#307CD2',
    },
    {
      id: 'delete',
      icon: 'icon-delete',
      text: 'Xóa',
      textColor: '#F54E60',
    },
  ];
  @ViewChild('attachment') attachment: AttachmentComponent;
  constructor(
    private callfunc: CallFuncService,
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private notifySvr: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.formModel = dt.data;
    if (this.formModel?.entityName) {
      let entityName = this.formModel?.entityName;
      var arObj = entityName.split('_');
      this.service = arObj[0];
      if (this.service) {
        switch (this.service.toLocaleLowerCase()) {
          case 'ad':
            this.service = 'sys';
            break;
          case 'pr':
            this.service = 'hr';
            break;
        }
      }
    }
    //this.recID = dt.data?.[1];
  }

  ngAfterViewInit(): void {
    this.getHeight();
  }
  ngOnInit(): void {
    //Tạo formGroup
    this.importGroup = this.formBuilder.group({
      dataImport: ['', Validators.required],
    });
    this.request.page = 0;
    this.request.pageSize = 10;
    this.request.formName = this.formModel.formName;
    this.request.gridViewName = this.formModel.gridViewName;
    this.request.funcID = this.formModel?.funcID;
    this.getData();
  }
  get f(): { [key: string]: AbstractControl } {
    return this.importGroup.controls;
  }
  ngOnChanges(changes: SimpleChanges) {}

  getFunctionList() {}
  fileAdded(event: any) {
    if (event?.data) this.hideThumb = true;
  }
  getfileCount(e: any) {
    this.fileCount = e.data.length;
  }
  onSave() {
    if (this.fileCount <= 0) return this.notifySvr.notifyCode('OD022');
    this.submitted = true;
    if (this.importGroup.invalid) return;
    this.api
      .execSv(this.service, 'Core', 'CMBusiness', 'ImportAsync', [
        this.binaryString,
        this.fileName,
        this.importGroup.value.dataImport,
        this.formModel?.entityName,
        '',
        '',
      ])
      .subscribe((item) => {});
  }
  getData() {
    this.fetch().subscribe((item) => {
      this.dt_AD_IEConnections = item;
      this.importGroup
        .get('dataImport')
        .setValue(this.dt_AD_IEConnections[0].recID);
    });
  }
  private fetch(): Observable<any[]> {
    return this.api
      .execSv<Array<any>>(
        'SYS',
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
  openFormAddTemplate() {
    this.callfunc.openForm(
      CodxImportAddTemplateComponent,
      null,
      900,
      800,
      '',
      ['add', this.formModel],
      null
    );
  }
  openForm(val: any, data: any, type: any) {
    switch (val) {
      case 'add':
      case 'edit': {
        this.callfunc.openForm(
          CodxImportAddTemplateComponent,
          null,
          900,
          800,
          '',
          ['edit', this.formModel, data.recID, data],
          null
        );
        break;
      }
      case 'delete': {
        break;
      }
    }
  }
  getfilePrimitive(e: any) {
    let that = this;
    var dt = e[0]?.rawFile;
    that.fileName = dt?.name;
    if (dt) {
      const reader: FileReader = new FileReader();
      reader.readAsDataURL(dt);
      reader.onload = function () {
        that.binaryString = reader.result;
      };
    }
  }
  getHeight() {
    var heightP = (
      document.getElementsByClassName('tab-content')[0] as HTMLElement
    ).offsetHeight;
    var height = (document.getElementsByClassName('tab-pane')[0] as HTMLElement)
      .offsetHeight;
    this.hScroll = heightP - height;
  }
}
