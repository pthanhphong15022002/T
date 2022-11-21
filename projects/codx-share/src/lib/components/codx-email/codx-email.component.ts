import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  Optional,
  Renderer2,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import {
  NodeSelection,
  RichTextEditorComponent,
} from '@syncfusion/ej2-angular-richtexteditor';
import { DataManager, Query } from '@syncfusion/ej2-data';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  CodxInputComponent,
  DataRequest,
  DialogData,
  DialogRef,
  FormModel,
} from 'codx-core';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { EmailSendTo } from 'projects/codx-es/src/lib/codx-es.model';
import { CodxEsService } from 'projects/codx-es/src/lib/codx-es.service';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxShareService } from '../../codx-share.service';

@Component({
  selector: 'lib-codx-email',
  templateUrl: './codx-email.component.html',
  styleUrls: ['./codx-email.component.scss'],
})
export class CodxEmailComponent implements OnInit {
  @ViewChild('addTemplateName') addTemplateName: TemplateRef<any>;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('dataView', { static: false }) dataView: ElementRef;
  @ViewChild('textarea', { static: false }) textarea: ElementRef;
  @ViewChild('richtexteditor', { static: false })
  richtexteditor: CodxInputComponent;

  @ViewChild('listviewInstance', { static: false })
  public listviewInstance: any;

  @ViewChild('textbox', { static: false }) textboxEle: any;

  headerText: string = 'Thiết lập Email';
  subHeaderText: string = '';
  dialog: DialogRef;
  formModel: FormModel;
  date: any;
  templateID: string = '';

  isTemplate: boolean = false;
  // email: any;
  dialogETemplate: FormGroup;
  isAfterRender = false;
  showIsTemplate = true;
  showIsPublish = true;
  showSendLater = true;
  showFrom = true;

  formGroup: FormGroup;
  showCC = false;
  showBCC = false;

  data: any = {};

  vllShare = 'ES014';
  container: HTMLElement;

  sendType = 'to';
  lstFrom = [];
  lstTo = [];
  lstCc = [];
  lstBcc = [];

  dataSource: any = {};

  width: any = 'auto';

  files: any; //param list file

  show = false;
  isAddNew: boolean = false;
  viewBody: string = '';

  public cssClass: string = 'e-list-template';

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private codxService: CodxShareService,
    private esService: CodxEsService,

    private callFunc: CallFuncService,
    private auth: AuthStore,
    private dmSV: CodxDMService,
    private cr: ChangeDetectorRef,
    private renderer: Renderer2,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
    this.formGroup = data?.data?.formGroup;
    this.templateID = data?.data?.templateID;
    this.isAddNew = data?.data?.isAddNew ?? true;
    console.log(this.templateID);

    this.cache.valueList('ES014').subscribe((res) => {
      console.log('vll', res);
    });

    this.showIsPublish = data.data?.showIsPublish ?? true;
    this.showIsTemplate = data.data?.showIsTemplate ?? true;
    this.showSendLater = data.data?.showSendLater ?? true;
    this.showFrom = data.data?.showFrom ?? true;

    this.isAddNew = data.data?.isAddNew ?? false;
    this.files = data?.data?.files;

    this.renderer.listen('window', 'click', (e: Event) => {
      if (this.isInside == false && this.show == true) {
        this.show = false;
      }
      this.isInside = false;
    });
  }
  ngAfterViewInit(): void {}

  click() {
    this.isInside = true;
  }

  staticWidth: number = 0;
  AfterViewInit(): void {
    if (this.textarea && this.staticWidth != 0)
      this.staticWidth = (
        this.textarea.nativeElement as HTMLElement
      ).offsetWidth;
  }

  initForm() {
    this.formModel = new FormModel();
    this.formModel.entityName = 'AD_EmailTemplates';
    this.formModel.formName = 'EmailTemplates';
    this.formModel.gridViewName = 'grvEmailTemplates';
    this.formModel.funcID = '';

    var request = new DataRequest();
    let service = 'BI';
    request.comboboxName = 'DataViewItems';
    request.page = 1;
    request.pageSize = 10;
    this.codxService.loadDataCbx(service, request).subscribe((cbx) => {
      console.log(cbx);
      if (cbx) {
        var item = JSON.parse(cbx[0]);
        var result = [];
        item.forEach((element) => {
          var obj = {
            fieldName: element['FieldName'],
            headerText: element['HeaderText'],
          };
          result.push(obj);
        });
        this.dataSource = result;
        this.cr.detectChanges();
      }
    });
    this.cache.gridView(this.formModel.gridViewName).subscribe((gridView) => {
      this.cache.setGridView(this.formModel.gridViewName, gridView);
      this.cache
        .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
        .subscribe((gridViewSetup) => {
          this.cache.setGridViewSetup(
            this.formModel.formName,
            this.formModel.gridViewName,
            gridViewSetup
          );
          this.codxService
            .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
            .then((res) => {
              if (res) {
                this.dialogETemplate = res;

                if (this.templateID) {
                  this.codxService
                    .getEmailTemplate(this.templateID)
                    .subscribe((res1) => {
                      if (res1 != null) {
                        this.data = res1[0];
                        this.dialogETemplate.patchValue(res1[0]);
                        this.viewBody = res1[0]?.message ?? '';
                        this.setViewBody();
                        this.dialogETemplate.addControl(
                          'recID',
                          new FormControl(res1[0].recID)
                        );

                        // if (res[0].isTemplate) {
                        //   this.methodEdit = true;
                        // }

                        let lstUser = res1[1];
                        if (lstUser && lstUser.length > 0) {
                          console.log(lstUser);

                          lstUser.forEach((element) => {
                            switch (element.sendType) {
                              case '1':
                                this.lstFrom.push(element);
                                break;
                              case '2':
                                this.lstTo.push(element);
                                break;
                              case '3':
                                this.lstCc.push(element);
                                break;
                              case '4':
                                this.lstBcc.push(element);
                                break;
                            }
                          });
                        }
                        this.formModel.currentData = this.data;
                        this.isAfterRender = true;
                      }
                      this.cr.detectChanges();
                    });
                } else {
                  this.codxService.getDataDefault().subscribe((res) => {
                    if (res) {
                      this.setViewBody();

                      this.data = res;
                      this.dialogETemplate.patchValue(this.data);
                      this.dialogETemplate.addControl(
                        'recID',
                        new FormControl(this.data.recID)
                      );
                      this.formModel.currentData = this.data;
                      this.isAfterRender = true;
                      this.cr.detectChanges();
                    }
                  });
                }
              }
            });
        });
    });
  }

  setViewBody() {
    if (this.dataSource) {
      if (!this.viewBody) this.viewBody = '';
      this.dataSource.forEach((element) => {
        this.viewBody = this.viewBody.replace(
          '[' + element.fieldName + ']',
          '[' + element.headerText + ']'
        );
      });
      this.cr.detectChanges();
    }
  }

  setMessage() {
    if (this.dataSource) {
      let stringBody = this.viewBody;
      if (!stringBody) stringBody = '';
      this.dataSource.forEach((element) => {
        stringBody = stringBody.replace(
          '[' + element.headerText + ']',
          '[' + element.fieldName + ']'
        );
      });
      this.dialogETemplate.patchValue({ message: stringBody });
      this.cr.detectChanges();
    }
  }

  ngOnInit(): void {
    this.initForm();
  }

  onSaveWithTemplate(dialog: DialogRef) {
    if (this.isTemplate) {
      this.callFunc.openForm(this.addTemplateName, '', 400, 250);
    } else {
      this.onSaveForm(dialog);
    }
  }

  sendEmail() {
    this.codxService.sendEmailTemplate(this.templateID).subscribe((res) => {});
  }

  onSaveForm(dialog1: DialogRef) {
    this.setMessage();
    let lstSento = [
      ...this.lstFrom,
      ...this.lstTo,
      ...this.lstCc,
      ...this.lstBcc,
    ];
    console.log(lstSento);

    if (this.isTemplate) {
      this.codxService
        .addEmailTemplate(this.dialogETemplate.value, lstSento)
        .subscribe((res) => {
          console.log(res);
          if (res) {
            console.log(res);
            if (this.formGroup) {
              let emailTemplates = this.formGroup.value.emailTemplates;
              this.esService.lstTmpEmail.push(res);
              let i = emailTemplates.findIndex(
                (p) => p.emailType == res.templateType
              );
              if (i >= 0) {
                emailTemplates[i].templateID = res.recID;

                if (this.attachment.fileUploadList.length > 0) {
                  this.attachment.objectId = res.recID;
                  console.log(this.dmSV.fileUploadList);
                  this.attachment.saveFiles();
                }

                this.formGroup.patchValue({ emailTemplates: emailTemplates });
              }
            }
            dialog1 && dialog1.close();
            this.dialog && this.dialog.close();
          }
        });
    } else if (this.isAddNew == false && this.templateID) {
      this.codxService
        .editEmailTemplate(this.dialogETemplate.value, lstSento)
        .subscribe((res) => {
          if (res) {
            if (this.formGroup) {
              let emailTemplates = this.formGroup.value.emailTemplates;
              this.esService.lstTmpEmail.push(res);
              let i = emailTemplates.findIndex(
                (p) => p.emailType == res.templateType
              );
              if (i >= 0) {
                emailTemplates[i].templateID = res.recID;

                if (this.attachment.fileUploadList.length > 0) {
                  this.attachment.objectId = res.recID;
                  this.attachment.saveFiles();
                }

                this.formGroup.patchValue({ emailTemplates: emailTemplates });
              }
            }
            this.dialog && this.dialog.close(res);
          }
        });
    } else if (this.isAddNew) {
      this.codxService
        .addEmailTemplate(this.dialogETemplate.value, lstSento)
        .subscribe((res) => {
          if (res) {
            if (this.formGroup) {
              let emailTemplates = this.formGroup.value.emailTemplates;
              this.esService.lstTmpEmail.push(res);
              let i = emailTemplates.findIndex(
                (p) => p.emailType == res.templateType
              );
              if (i >= 0) {
                emailTemplates[i].templateID = res.recID;

                if (this.attachment.fileUploadList.length > 0) {
                  this.attachment.objectId = res.recID;
                  this.attachment.saveFiles();
                }

                this.formGroup.patchValue({ emailTemplates: emailTemplates });
              }
            }
            this.dialog && this.dialog.close(res);
          }
        });
    }
  }

  valueChange(event) {
    if (event?.field && event.component) {
      switch (event.field) {
        case 'isTemplate': {
          this.isTemplate = event?.data;
          break;
        }
        case 'sendTime': {
          this.dialogETemplate.patchValue({
            [event['field']]: event.data.fromDate,
          });
          break;
        }
        case 'template': {
          console.log(event);

          if (event?.data != '') {
            this.codxService.getEmailTemplate(event?.data).subscribe((res1) => {
              if (res1 != null) {
                res1[0].recID = this.data?.recID;
                res1[0].id = this.data?.id;
                this.data = res1[0];
                this.dialogETemplate.patchValue(res1[0]);
                this.viewBody = res1[0]?.message ?? '';
                this.setViewBody();

                let lstUser = res1[1];
                this.lstFrom = [];
                this.lstTo = [];
                this.lstCc = [];
                this.lstBcc = [];
                if (lstUser && lstUser.length > 0) {
                  console.log(lstUser);

                  lstUser.forEach((element) => {
                    delete element.id;
                    delete element.recID;
                    element.transID = this.dialogETemplate.value.recID;
                    switch (element.sendType) {
                      case '1':
                        this.lstFrom.push(element);
                        break;
                      case '2':
                        this.lstTo.push(element);
                        break;
                      case '3':
                        this.lstCc.push(element);
                        break;
                      case '4':
                        this.lstBcc.push(element);
                        break;
                    }
                  });
                }
              }
              this.cr.detectChanges();
            });
          }
          break;
        }
        default: {
          this.dialogETemplate.patchValue({ [event['field']]: event.data });
        }
      }
    }
    this.cr.detectChanges();
  }

  valueSentoChange(event, sendType) {
    if (event?.field && event.component) {
      switch (event.field) {
        case 'from':
          event.data?.forEach((element) => {
            let index = this.lstFrom.findIndex((p) => p.objectID == element.id);

            if (this.lstFrom.length == 0 || index < 0) {
              let item = new EmailSendTo();
              item.objectID = element.id;
              item.objectType = element.objectType;
              item.text = element.text;
              item.sendType = sendType;
              this.lstFrom.push(item);
            }
          });
          break;
        case 'to':
          event.data?.forEach((element) => {
            let index = this.lstTo.findIndex((p) => p.objectID == element.id);
            if (this.lstTo.length == 0 || index < 0) {
              let item = new EmailSendTo();
              item.objectID = element.id;
              item.objectType = element.objectType;
              item.text = element.text;
              item.sendType = sendType;
              this.lstTo.push(item);
            }
          });
          break;
        case 'cc':
          event.data?.forEach((element) => {
            let index = this.lstCc.findIndex((p) => p.objectID == element.id);

            if (this.lstCc.length == 0 || index < 0) {
              let item = new EmailSendTo();
              item.objectID = element.id;
              item.objectType = element.objectType;
              item.text = element.text;
              item.sendType = sendType;
              this.lstCc.push(item);
            }
          });
          break;
        case 'bcc':
          event.data?.forEach((element) => {
            let index = this.lstTo.findIndex((p) => p.objectID == element.id);

            if (this.lstCc.length == 0 || index < 0) {
              let item = new EmailSendTo();
              item.objectID = element.id;
              item.objectType = element.objectType;
              item.text = element.text;
              item.sendType = sendType;
              this.lstBcc.push(item);
            }
          });
          break;
      }
    }
  }

  deleteItem(data, sendType) {
    // var i = -1;
    switch (sendType) {
      case 1:
        var index = this.lstFrom.indexOf(data);
        if (index >= 0) {
          this.lstFrom.splice(index, 1);
        }
        break;
      case 2:
        var index = this.lstTo.indexOf(data);
        if (index >= 0) {
          this.lstTo.splice(index, 1);
        }
        break;
      case 3:
        var index = this.lstCc.indexOf(data);
        if (index >= 0) {
          this.lstCc.splice(index, 1);
        }
        break;
      case 4:
        var index = this.lstBcc.indexOf(data);
        if (index >= 0) {
          this.lstBcc.splice(index, 1);
        }
        break;
    }
  }

  changeSendType(sendType) {
    if (sendType == 'cc') {
      this.showCC = !this.showCC;
    } else if (sendType == 'bcc') {
      this.showBCC = !this.showBCC;
    }
  }

  close2(dialog: DialogRef) {
    dialog.close();
  }

  testdata(share) {
    this.callFunc.openForm(share, '', 420, window.innerHeight);
  }

  applyShare(event, sendType) {
    if (event) {
      let lst = [];
      event.forEach((element) => {
        if (element.objectType == 'A' || element.objectType == 'S') {
          let isExist = this.isExist(element?.objectType, sendType);
          if (isExist == false) {
            let appr = new EmailSendTo();
            appr.objectID = element?.objectType;
            appr.text = element?.objectName;
            appr.objectType = element?.objectType;
            appr.sendType = sendType.toString();
            appr.icon = sendType.icon;
            lst.push(appr);
          }
        } else if (element.objectType.length == 1) {
          let lstID = element?.id.split(';');
          let lstUserName = element?.text.split(';');

          for (let i = 0; i < lstID?.length; i++) {
            let isExist = this.isExist(element?.objectType, sendType);
            if (lstID[i].toString() != '' && isExist == false) {
              let appr = new EmailSendTo();
              appr.objectType = element.objectType;
              appr.text = lstUserName[i];
              appr.objectID = lstID[i];
              appr.sendType = sendType.toString();
              lst.push(appr);
            }
          }
        } else {
          let isExist = this.isExist(element?.objectType, sendType);
          if (isExist == false) {
            let appr = new EmailSendTo();
            appr.objectID = element?.objectType;
            appr.text = element?.objectName;
            appr.objectType = element?.objectType;
            appr.sendType = sendType.toString();
            appr.icon = sendType.icon;
            lst.push(appr);
          }
        }
      });

      switch (sendType) {
        case 1:
          this.lstFrom.push(...lst);
          break;
        case 2:
          this.lstTo.push(...lst);
          break;
        case 3:
          this.lstCc.push(...lst);
          break;
        case 4:
          this.lstBcc.push(...lst);
          break;
      }
    }
  }

  isExist(objectID, sendType) {
    let index = -1;
    switch (sendType) {
      case 1:
        index = this.lstFrom.findIndex((p) => p.objectID == objectID);
        break;
      case 2:
        index = this.lstFrom.findIndex((p) => p.objectID == objectID);
        break;
      case 3:
        index = this.lstFrom.findIndex((p) => p.objectID == objectID);
        break;
      case 4:
        index = this.lstFrom.findIndex((p) => p.objectID == objectID);
        break;
    }

    if (index == -1) return false;
    else return true;
  }

  fileAdded(event) {}

  openFormUploadFile() {
    this.attachment.uploadFile();
  }

  getfileCount(e: any) {}

  public selection: NodeSelection = new NodeSelection();
  public range: Range;
  public saveSelection: NodeSelection;

  getPosition() {
    this.range = this.selection.getRange(document);
  }

  insert(data: any) {
    if (data && data != null) {
      this.saveSelection = this.selection.save(this.range, document);
      this.saveSelection.restore();

      let html =
        '<span style="color: gray; text-decoration: inherit" id="' +
        data?.fieldName +
        '"> [' +
        data?.headerText +
        '] </span>';
      this.richtexteditor.control.executeCommand('insertHTML', html);

      // this.richtexteditor.control.executeCommand('fontColor', 'gray');
      // this.richtexteditor.control.executeCommand(
      //   'insertText',
      //   ' [' + data + '] '
      // );
      this.richtexteditor.control.executeCommand('fontColor', 'black');

      this.range = this.selection.getRange(document);
      this.viewBody = this.richtexteditor.control.angularValue;
    }
  }

  isInside: boolean = false;

  clickDataView(event = null) {
    this.isInside = true;
    this.show = !this.show;
    // let crrWidth = (this.textarea.nativeElement as HTMLElement).offsetWidth;
    // console.log('width', crrWidth);

    // if (this.width == crrWidth || this.width == 'auto') {
    //   this.width =
    //     (this.textarea.nativeElement as HTMLElement).offsetWidth -
    //     (this.dataView.nativeElement as HTMLElement).offsetWidth -
    //     5;
    // }

    // this.isInside = true;
    // this.width = (this.dataView.nativeElement as HTMLElement).offsetWidth + 5;
    this.cr.detectChanges();
  }

  clickItem(item) {
    if (item) {
      this.insert(item);
    }
  }

  onkeyup(event) {
    let value = this.textboxEle.nativeElement.value;
    let data = new DataManager(this.dataSource).executeLocal(
      new Query().where('headerText', 'startswith', value, true)
    );
    if (!value) {
      this.listviewInstance.dataSource = this.dataSource.slice();
    } else {
      this.listviewInstance.dataSource = data;
    }
    this.listviewInstance.dataBind();
  }

  keyUp(event) {
    this.range = this.selection.getRange(document);
  }

  onActionComplete(args: any): void {}
}
