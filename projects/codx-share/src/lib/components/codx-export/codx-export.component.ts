import {
  Component,
  Input,
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
  AuthService,
  AuthStore,
  CacheService,
  CallFuncService,
  DataRequest,
  DialogData,
  DialogModel,
  DialogRef,
  NotificationsService,
} from 'codx-core';
import { Observable, finalize, map, of } from 'rxjs';
import { CodxExportAddComponent } from './codx-export-add/codx-export-add.component';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';

@Component({
  selector: 'codx-export',
  templateUrl: './codx-export.component.html',
  styleUrls: ['./codx-export.component.scss'],
})
export class CodxExportComponent implements OnInit, OnChanges {
  submitted = false;
  active = '1';
  gridModel: any;
  recID: any;
  field: any;
  data = {};
  dataSource: string = '';
  dataEx: any;
  dataWord: any;
  dialog: any;
  formModel: any;
  exportGroup: FormGroup;
  lblExtend: string = '';
  request = new DataRequest();
  optionEx = new DataRequest();
  optionWord = new DataRequest();
  services = 'OD';
  idField = 'RecID';
  service: string = 'SYS';
  assemblyName: string = 'AD';
  className: string = 'ExcelTemplatesBusiness';
  method: string = 'GetByEntityAsync';
  show = false;
  type = 'excel';
  content = {
    excel: {
      title: 'Excel',
      subTitle:
        'Xuất dữ liệu được chọn thành file excel bao gồm các trường dữ liệu hàng ngang',
    },
    word: {
      title: 'Word',
      subTitle:
        'Xuất dữ liệu được chọn thành file word bao gồm các trường dữ liệu hàng ngang',
    },
    pdf: {
      title: 'PDF',
      subTitle:
        'Xuất dữ liệu được chọn thành file pdf bao gồm các trường dữ liệu hàng ngang',
    },
    pivot: {
      title: 'Pivot Table',
      subTitle:
        'Xuất dữ liệu được chọn thành file excel có định dạng pivot table',
    },
  };
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
  @Input() refType: any;
  @Input() refID: any;

  ////Dùng cho report
  @Input() isReport: any;
  @Input() dataReport: any;
  constructor(
    private callfunc: CallFuncService,
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private notifySvr: NotificationsService,
    private cache: CacheService,
    private auth: AuthService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.gridModel = dt.data?.[0];
    this.recID = dt.data?.[1];
    this.dataSource = dt.data?.[2];
    this.refID = dt.data?.[3];
    this.refType = dt.data?.[4];
    this.isReport = dt.data?.[5];
    this.dataReport = dt.data?.[6];
  }
  ngOnInit(): void {
    //Tạo formGroup
    this.exportGroup = this.formBuilder.group({
      dataExport: ['all', Validators.required],
      format: ['excel', Validators.required],
    });
    //Tạo formModel
    this.formModel = {
      entityName: this.gridModel?.entityName,
      entityPer: this.gridModel?.entityPermission,
      formName: this.gridModel?.formName,
      funcID: this.gridModel?.funcID,
      gridViewName: this.gridModel?.gridViewName,
    };

    //////////////////////////
    this.request.page = 0;
    this.request.pageSize = 10;
    this.request.entityName = 'AD_ExcelTemplates';
    this.request.funcID = this.formModel?.funcID;
    //////////////////////////
    this.setting();
    //Load data excel template
    this.load();
  }

  setting() {
    if (this.gridModel?.entityName) {
      var arr = this.gridModel?.entityName.split('_');
      this.services = arr[0];
      this.cache.entity(this.gridModel?.entityName).subscribe((res) => {
        if (res && res.isPK) {
          this.idField = res.isPK;
        }
      });
    }
    if (this.services) {
      if (this.services.toLowerCase() == 'ad') this.service = 'sys';
      else if (this.services.toLowerCase() == 'pr') this.service = 'hr';
    }
  }

  get f(): { [key: string]: AbstractControl } {
    return this.exportGroup.controls;
  }
  ngOnChanges(changes: SimpleChanges) {}
  load() {
    if (this.type == 'word') this.loadWord();
    else this.loadEx();
  }
  loadEx() {
    this.request.entityName = 'AD_ExcelTemplates';
    this.request.dataValue =
      this.refID + ';' + this.refType || this.formModel.entityName;
    this.className = 'ExcelTemplatesBusiness';
    this.fetch().subscribe((item) => {
      this.dataEx = item;
    });
  }
  loadWord() {
    this.request.entityName = 'AD_WordTemplates';
    this.request.dataValue =
      this.refID + ';' + this.refType || this.formModel.entityName;
    this.className = 'WordTemplatesBusiness';
    this.fetch().subscribe((item) => {
      this.dataWord = item;
    });
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
          if (response) return response[0];
        })
      );
  }

  openForm(val: any, data: any) {
    switch (val) {
      case 'add':
      case 'edit': {
        var option = new DialogModel();
        option.FormModel = this.formModel;
        if (this.type == 'word') option.IsFull = true;
        this.callfunc
          .openForm(
            CodxExportAddComponent,
            null,
            1100,
            800,
            null,
            {
              action: val,
              type: this.type,
              refType: this.refType,
              refID: this.refID,
              formModel: this.formModel,
              data: data,
            },
            '',
            option
          )
          .closed.subscribe((item) => {
            if (item.event && item.event.length > 0) {
              var typeR = item.event[1];
              if (typeR == 'excel') {
                if (val == 'add') this.loadEx();
                else if (val == 'edit') {
                  var index = this.dataEx.findIndex(
                    (x) => x.recID == item.event[0]?.recID
                  );
                  if (index >= 0) {
                    this.dataEx[index] = item.event[0];
                  }
                }
              } else if (typeR == 'word') {
                if (val == 'add') this.loadWord();
                else if (val == 'edit') {
                  var index = this.dataWord.findIndex(
                    (x) => x.recID == item.event[0]?.recID
                  );
                  if (index >= 0) {
                    this.dataWord[index] = item.event[0];
                  }
                }
              }
            }
          });
        break;
      }
      case 'delete': {
        var config = new AlertConfirmInputConfig();
        config.type = 'YesNo';
        //SYS003
        this.notifySvr
          .alert('Thông báo', 'Bạn có chắc chắn muốn xóa ?', config)
          .closed.subscribe((x) => {
            if (x.event.status == 'Y') {
              var className =
                this.type == 'excel'
                  ? 'ExcelTemplatesBusiness'
                  : 'WordTemplatesBusiness';
              this.api
                .execSv(
                  this.service,
                  'AD',
                  className,
                  'DeleteIDAsync',
                  data.recID
                )
                .subscribe((item) => {
                  if (item) {
                    this.notifySvr.notifyCode('RS002');
                    if (this.type == 'excel')
                      this.dataEx = this.dataEx.filter(
                        (x) => x.recID != data.recID
                      );
                    else if (this.type == 'word')
                      this.dataWord = this.dataWord.filter(
                        (x) => x.recID != data.recID
                      );
                  } else {
                    this.notifySvr.notifyCode('SYS022');
                  }
                });
            }
          });
        break;
      }
    }
  }
  onSave() {
    this.submitted = true;
    if (this.exportGroup.invalid) return;
    var idTemp = null;
    var value = this.exportGroup.value;
    var splitFormat = value?.format.split('_');
    if (splitFormat.length > 1 && splitFormat[1]) idTemp = splitFormat[1];
    switch (splitFormat[0]) {
      case 'excel':
      case 'excelTemp':
        //this.data.report.service,"Codx.RptBusiness","ReportBusiness","GetReportSourceAsync",[this.data.report,this.data.parameters]
        if (this.isReport) {
          this.api
            .execSv<any>(
              this.dataReport.report.service,
              'Codx.RptBusiness',
              'ReportBusiness',
              'ExportExcelReportAsync',
              [this.dataReport.report, this.dataReport.parameters, idTemp]
            )
            .subscribe((item) => {
              if (item) {
                this.downloadFile(item);
              }
            });
        } else {
          if (value?.dataExport == 'all') {
            this.gridModel.page = 1;
            this.gridModel.pageSize = -1;
            this.gridModel.pageLoading = false;
            this.gridModel.predicates = null;
            this.gridModel.dataValues = null;
          } else if (value?.dataExport == 'selected') {
            this.gridModel.predicates = this.idField + '=@0';
            this.gridModel.dataValues = [this.recID].join(';');
          }

          if (!this.dataSource || !this.show) {
            this.api
              .execSv<any>(
                this.services,
                'Core',
                'CMBusiness',
                'ExportExcelAsync',
                [this.gridModel, idTemp]
              )
              .subscribe((item) => {
                if (item) {
                  this.downloadFile(item);
                }
              });
          } else {
            this.api
              .execSv<any>(
                this.services,
                'Core',
                'CMBusiness',
                'ExportExcelDataAsync',
                [this.dataSource, idTemp]
              )
              .subscribe((item) => {
                if (item) {
                  this.downloadFile(item);
                }
              });
          }
        }

        break;
      case 'wordTemp':
        if (value?.dataExport == 'all') {
          this.gridModel.page = 1;
          this.gridModel.pageSize = -1;
          this.gridModel.pageLoading = false;
          this.gridModel.predicates = null;
          this.gridModel.dataValues = null;
        } else if (value?.dataExport == 'selected') {
          this.gridModel.predicates = this.idField + '=@0';
          this.gridModel.dataValues = [this.recID].join(';');
        }
        if (!this.dataSource) {
          this.api
            .execSv<any>(
              this.services,
              'Core',
              'ExportWordBusiness',
              'ExportWordTemplateAsync',
              [
                this.gridModel,
                idTemp,
                null,
                this.formModel?.entityName,
                this.formModel?.formName,
                this.formModel?.gridViewName,
              ]
            )
            .subscribe((item) => {
              if (item) {
                this.downloadFile(item);
              }
            });
        } else {
          this.api
            .execSv<any>(
              this.services,
              'Core',
              'ExportWordBusiness',
              'ExportWordTemplateAsync',
              [
                null,
                idTemp,
                this.dataSource,
                this.formModel?.entityName,
                this.formModel?.formName,
                this.formModel?.gridViewName,
              ]
            )
            .subscribe((item) => {
              if (item) {
                this.downloadFile(item);
              }
            });
        }

        break;
    }

    /*    */
  }
  onClose() {
    this.submitted = true;
    let temlateRecID = null;
    let value = this.exportGroup.value;
    let splitFormat = value?.format.split('_');
    let templateType = '';
    let templateInfo = [];
    if (splitFormat.length > 1 && splitFormat[1]) temlateRecID = splitFormat[1];
    switch (splitFormat[0]) {
      case 'excelTemp':
        templateType = 'AD_ExcelTemplates';
        let templateEX = this.dataEx.filter((x) => x.recID == temlateRecID);
        if (templateEX?.length > 0) templateInfo = templateEX[0];
        break;
      case 'wordTemp':
        templateType = 'AD_WordTemplates';
        let templateW = this.dataWord.filter((x) => x.recID == temlateRecID);
        if (templateW?.length > 0) templateInfo = templateW[0];
        break;
    }

    this.dialog &&
      this.dialog.close({
        templateType: templateType,
        templateInfo: templateInfo,
      });
  }
  downloadFile(data: any) {
    // const blob = new Blob([data], {
    //   type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // });
    // const url = window.URL.createObjectURL(blob);
    // window.open(url);
    var sampleArr = this.base64ToArrayBuffer(data[0]);
    this.saveByteArray(this.gridModel?.entityName || 'excel', sampleArr);
  }

  base64ToArrayBuffer(base64) {
    var binaryString = window.atob(base64);
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
      var ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes;
  }

  saveByteArray(reportName, byte) {
    var dataType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (this.type == 'word') dataType = 'application/msword';
    var blob = new Blob([byte], {
      type: dataType,
    });
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    var fileName = reportName;
    link.download = fileName;
    link.click();
  }

  openFormUploadFile() {
    this.attachment.uploadFile();
  }
  onScroll(e: any) {
    const dcScroll = e.srcElement;
    if (dcScroll.scrollTop + dcScroll.clientHeight == dcScroll.scrollHeight) {
      var data = this.optionEx;
      //alert("a");
    }
  }
  navChanged(e: any) {
    this.show = false;
    var id;

    switch (e?.nextId) {
      case '1':
        this.type = 'excel';
        id = 'excel';
        break;

      case '2':
        this.type = '';
        //id= "word";
        break;

      case '3':
        this.type = 'word';
        id = 'word';
        break;

      case '4':
        this.type = '';
        id = 'pdf';
        break;

      case '5':
        this.type = 'excel';
        this.show = true;
        this.load();
        break;

      case '6':
        this.type = 'word';
        this.show = true;
        this.load();
        break;
    }

    var dataExport = 'all';
    if (e?.nextId == '3' || e?.nextId == '6') dataExport = 'selected';
    this.exportGroup.controls['dataExport'].setValue(dataExport);
    this.exportGroup.controls['format'].setValue(id);
  }
}
