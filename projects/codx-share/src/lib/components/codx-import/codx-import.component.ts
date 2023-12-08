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
  AlertConfirmInputConfig,
  ApiHttpService,
  CallFuncService,
  DataRequest,
  DialogData,
  DialogRef,
  NotificationsService,
  RealHub,
  RealHubService,
  Util,
} from 'codx-core';
import { Observable, finalize, map } from 'rxjs';
import { CodxImportAddTemplateComponent } from './codx-import-add-template/codx-import-add-template.component';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { AddTemplateComponent } from './add-template/add-template.component';
import { AddImportDetailsComponent } from './add-template/add-import-details/add-import-details.component';
import { AnimationModel } from '@syncfusion/ej2-progressbar';
import {
  ILoadedEventArgs,
  ProgressBar,
  ProgressTheme,
} from '@syncfusion/ej2-angular-progressbar';

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
  valueProgress = 0;
  valueProgressp = 0;
  session: any;
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
  @ViewChild('linear') public linear: ProgressBar;
  public animation: AnimationModel = { enable: true, duration: 2000, delay: 0 };

  constructor(
    private callfunc: CallFuncService,
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private notifySvr: NotificationsService,
    private realHub: RealHubService,
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

  load(args: ILoadedEventArgs): void {
    let selectedTheme: string = location.hash.split('/')[1];
    selectedTheme = selectedTheme ? selectedTheme : 'Material';
    args.progressBar.theme = <ProgressTheme>(
      (selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1))
        .replace(/-dark/i, 'Dark')
        .replace(/contrast/i, 'Contrast')
    );
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
    let total = 0;
    this.realHub.start(this.service).then((x: RealHub) => {
      if (x) {
        x.$subjectReal.asObservable().subscribe((z) => {
          if (
            (z.event == 'StartImport' || z.event == 'ImportSingle') &&
            z?.data?.session == this.session
          ) {
            if (z.event == 'StartImport') total = z?.data?.total;
            else {
              console.log('total: ', total);
              console.log('total 2 nè: ', z?.data?.total);
              console.log('Index nè: ', z?.data?.index);
              if (z?.data?.index == total) {
                this.notifySvr.notifyCode('SYS006');
                (this.dialog as DialogRef).close();
              }
              this.linear.value = this.valueProgress =
                (z?.data?.index / total) * 100;
              this.valueProgressp = this.linear.value + 5;
            }
          }
        });
      }
    });
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
    this.session = Util.uid();
    this.api
      .execSv(this.service, 'Core', 'CMBusiness', 'ImportAsync', [
        this.binaryString,
        this.fileName,
        this.importGroup.value.dataImport,
        this.formModel?.entityName,
        this.formModel?.funcID,
        this.session,
        '',
        '',
      ])
      .subscribe((item) => {
        if (item && this.dialog) {
          this.notifySvr.notifyCode('SYS006');
          (this.dialog as DialogRef).close();
        }
      });
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
    let popup = this.callfunc.openForm(
      AddTemplateComponent,
      null,
      1200,
      800,
      '',
      ['add', this.formModel],
      null
    );
    popup.closed.subscribe((res) => {
      if (res?.event) this.dt_AD_IEConnections.push(res?.event);
    });
  }
  openForm(val: any, data: any, type: any, index: any = null) {
    switch (val) {
      case 'edit': {
        this.callfunc.openForm(
          AddTemplateComponent,
          null,
          1200,
          800,
          '',
          ['edit', this.formModel, data],
          null
        );
        break;
      }
      case 'delete': {
        var config = new AlertConfirmInputConfig();
        config.type = 'YesNo';
        this.notifySvr.alertCode('SYS003', config).subscribe((x) => {
          if (x.event.status == 'Y') {
            if (data?.recID) {
              this.api
                .execSv<any>(
                  'SYS',
                  'AD',
                  'IEConnectionsBusiness',
                  'DeleteItemAsync',
                  data?.recID
                )
                .subscribe((item) => {
                  if (item) {
                    this.dt_AD_IEConnections = this.dt_AD_IEConnections.filter(
                      (x) => x.recID != data?.recID
                    );
                    this.notifySvr.notifyCode('SYS008');
                  } else this.notifySvr.notifyCode('SYS022');
                });
            }
          }
        });
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
