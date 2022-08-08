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
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  CallFuncService,
  DataRequest,
  DataService,
  DialogData,
  DialogModel,
  DialogRef,
  NotificationsService,
} from 'codx-core';
import { Observable, finalize, map, of } from 'rxjs';
import { AttachmentComponent } from '../attachment/attachment.component';
import { CodxExportAddComponent } from './codx-export-add/codx-export-add.component';

@Component({
  selector: 'codx-export',
  templateUrl: './codx-export.component.html',
  styleUrls: ['./codx-export.component.scss'],
})
export class CodxExportComponent implements OnInit, OnChanges {
  submitted = false;
  gridModel: any;
  recID: any;
  data = {};
  dataEx: any;
  dataWord: any;
  dialog: any;
  formModel: any;
  exportGroup: FormGroup;
  lblExtend: string = '';
  request = new DataRequest();
  optionEx = new DataRequest();
  optionWord = new DataRequest();
  service: string = 'SYS';
  assemblyName: string = 'AD';
  className: string = 'ExcelTemplatesBusiness';
  method: string = 'GetByEntityAsync';
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
    this.gridModel = dt.data?.[0];
    this.recID = dt.data?.[1];
  }
  ngOnInit(): void {
    //Tạo formGroup
    this.exportGroup = this.formBuilder.group({
      dataExport: ['', Validators.required],
      format: ['', Validators.required],
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

    //Load data excel template
    this.load();
  }
  get f(): { [key: string]: AbstractControl } {
    return this.exportGroup.controls;
  }
  ngOnChanges(changes: SimpleChanges) {}
  load() {
    this.loadEx();
    //this.loadWord();
  }
  loadEx() {
    this.request.entityName = 'AD_ExcelTemplates';
    this.className = 'ExcelTemplatesBusiness';
    this.fetch().subscribe((item) => {
      this.dataEx = item;
    });
  }
  loadWord() {
    this.request.entityName = 'AD_WordTemplates';
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
          return response[0];
        })
      );
  }

  openForm(val: any, data: any, type: any) {
    switch (val) {
      case 'add':
      case 'edit': {
        var option = new DialogModel();
        option.FormModel = this.formModel;
        option.DataService = data;
        this.callfunc
          .openForm(
            CodxExportAddComponent,
            null,
            null,
            800,
            null,
            { action: val, type: type },
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
              var method =
                type == 'excel' ? 'AD_ExcelTemplates' : 'AD_WordTemplates';
              this.api
                .execActionData<any>(method, [data], 'DeleteAsync')
                .subscribe((item) => {
                  if (item[0] == true) {
                    this.notifySvr.notifyCode('RS002');
                    if (type == 'excel')
                      this.dataEx = this.dataEx.filter(
                        (x) => x.recID != item[1][0].recID
                      );
                    else if (type == 'word')
                      this.dataWord = this.dataWord.filter(
                        (x) => x.recID != item[1][0].recID
                      );
                  } else this.notifySvr.notifyCode('SYS022');
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
    var splitFormat = value.format.split('_');
    switch (splitFormat[0]) {
      case 'excel':
      case 'excelTemp': {
        if (value.dataExport == 'all') {
          this.gridModel.page = 1;
          this.gridModel.pageSize = -1;
        } else if (value.dataExport == 'selected') {
          this.gridModel.predicates = 'RecID=@0';
          this.gridModel.dataValues = [this.recID].join(';');
        }
        if (splitFormat[1]) idTemp = splitFormat[1];
        this.api
          .execSv<any>('OD', 'CM', 'CMBusiness', 'ExportExcelAsync', [
            this.gridModel,
            idTemp,
          ])
          .subscribe((item) => {
            if (item) {
              this.downloadFile(item);
            }
          });
        break;
      }
    }

    /*    */
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
    var blob = new Blob([byte], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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
}
