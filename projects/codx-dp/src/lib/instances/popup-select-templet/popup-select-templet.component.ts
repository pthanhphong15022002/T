import { Component, OnInit, Optional } from '@angular/core';
import {
  ApiHttpService,
  DataRequest,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { Observable, finalize, map } from 'rxjs';
import { CodxDpService } from '../../codx-dp.service';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';

@Component({
  selector: 'lib-popup-select-templet',
  templateUrl: './popup-select-templet.component.html',
  styleUrls: ['./popup-select-templet.component.css'],
})
export class PopupSelectTempletComponent implements OnInit {
  isFormExport = true;
  isLockButton = true;
  formModel: FormModel;
  titleAction = '';
  data: any;
  idTemp = '';
  nameTemp = '';
  dialog: DialogRef;

  type = 'excel';
  requestTemp = new DataRequest();
  optionEx = new DataRequest();
  optionWord = new DataRequest();
  services = 'DP';
  idFieldTemp = 'RecID';
  serviceTemp: string = 'SYS';
  assemblyNameTemp: string = 'AD';
  classNameTemp: string = 'ExcelTemplatesBusiness';
  methodTemp: string = 'GetByEntityAsync';
  dataEx = [];
  dataWord = [];
  refID = '';
  refType = 'DP_Processes';
  esCategory: any;
  loaded = false;

  constructor(
    private codxDpService: CodxDpService,
    private notificationsService: NotificationsService,
    private codxCommonService: CodxCommonService,
    private codxShareService: CodxShareService,
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = dt?.data?.data;
    this.formModel = dt?.data?.formModel;
    this.isFormExport = dt?.data?.isFormExport;
    this.refID = dt?.data?.refID;
    this.refType = dt?.data?.refType ?? this.refType;
    this.esCategory = dt?.data?.esCategory;
    this.titleAction = dt?.data?.titleAction;
    this.loaded = dt?.data?.loaded;
    this.dataEx = dt?.data?.dataEx;
    this.dataWord = dt?.data?.dataWord;
    if (!this.loaded) {
      this.loadEx();
      this.loadWord();
    }
  }
  ngOnInit(): void {}

  //load Data
  loadEx() {
    this.requestTemp.predicate = 'RefID=@0 && RefType=@1';
    this.requestTemp.dataValue = this.refID + ';' + this.refType;
    this.requestTemp.entityName = 'AD_ExcelTemplates';
    this.classNameTemp = 'ExcelTemplatesBusiness';
    this.fetch().subscribe((item) => {
      this.dataEx = item;
      this.loaded = true;
    });
  }
  loadWord() {
    this.requestTemp.predicate = 'RefID=@0 && RefType=@1';
    this.requestTemp.dataValue = this.refID + ';' + this.refType;
    this.requestTemp.entityName = 'AD_WordTemplates';
    this.classNameTemp = 'WordTemplatesBusiness';
    this.fetch().subscribe((item) => {
      this.dataWord = item;
      // this.loaded =true ;  //tam thoi tắt
    });
  }
  private fetch(): Observable<any[]> {
    return this.api
      .execSv<Array<any>>(
        this.serviceTemp,
        this.assemblyNameTemp,
        this.classNameTemp,
        this.methodTemp,
        this.requestTemp
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
  //Xét duyệt
  selectTemp(recID, nameTemp) {
    if (recID) {
      this.isLockButton = false;
      this.idTemp = recID;
      this.nameTemp = nameTemp;
    } else this.isLockButton = true;
  }
  exportFileDynamic() {
    if (!this.data.datas) return;

    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.Core',
        'CMBusiness',
        'ExportExcelDataAsync',
        [this.data.datas, this.idTemp]
      )
      .subscribe((res) => {
        if (res) {
          this.downloadFile(res);
        }
      });
  }
  downloadFile(data: any) {
    var sampleArr = this.base64ToArrayBuffer(data[0]);
    this.saveByteArray(
      'DP_Instances_' + this.data.title + '_' + this.nameTemp || 'excel',
      sampleArr
    );
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

  documentApproval() {
    // this.api
    //   .execSv(
    //     'ES',
    //     'ES',
    //     'ApprovalTransBusiness',
    //     'GetCategoryByProcessIDAsync',
    //     this.esCategory?.processID
    //   )
    //   .subscribe((res2: any) => {
    let dialogModel = new DialogModel();
    dialogModel.IsFull = true;
    //trình ký
    if (this.esCategory?.eSign == true) {
    } else if (this.esCategory?.eSign == false)
      //xét duyệt
      this.release(this.data, this.esCategory);
    // });
  }
  //Gửi duyệt
  release(data: any, category: any) {
    this.codxCommonService.codxReleaseDynamic(
      'DP',
      data,
      category,
      this.formModel.entityName,
      this.formModel.funcID,
      data?.title,
      this.releaseCallback.bind(this)
    );
  }
  //call Back
  releaseCallback(res: any, t: any = null) {
    if (res?.msgCodeError) this.notificationsService.notify(res?.msgCodeError);
    else {
      this.data.approveStatus = '3';
      this.codxDpService
        .updateApproverStatusInstance([this.data?.recID, '3'])
        .subscribe();
      this.dialog.close(this.data);
      // this.notificationsService.notifyCode('ES007');
    }
  }
}
