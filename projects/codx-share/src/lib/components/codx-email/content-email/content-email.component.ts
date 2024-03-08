import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { RichTextEditorComponent } from '@syncfusion/ej2-angular-richtexteditor';
import { DataManager, Query } from '@syncfusion/ej2-data';
import axios from 'axios';
import {
  CacheService,
  CallFuncService,
  CodxInputComponent,
  CodxService,
  DialogRef,
  FormModel,
  Util,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { CodxShareService } from '../../../codx-share.service';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { EmailSendTo } from 'projects/codx-es/src/lib/codx-es.model';

@Component({
  selector: 'lib-content-email',
  templateUrl: './content-email.component.html',
  styleUrls: ['./content-email.component.css'],
})
export class ContentEmailComponent {
  @Input() showFrom: boolean = true;
  @Input() lstTo: any[] = [];
  @Input() lstFrom = [];
  @Input() lstCc = [];
  @Input() lstBcc = [];
  @Input() vllShare: string = 'ES014';
  @Input() showCC: boolean = false;
  @Input() showBCC: boolean = false;
  @Input() data: any = {};
  @Input() showAI = false;
  @Input() isLoadingAI = false;
  @Input() isInside: boolean = false;
  @Input() show: boolean = false;
  @Input() formModel: FormModel = new FormModel();
  @Input() dialogETemplate: FormGroup;
  @Input() dataAI: any;
  @Input() dataSource: any;
  @Input() saveIsTemplate: boolean = false;
  @Input() isAddNew: boolean = false;
  @Input() templateID: string = '';
  @Input() dialog: DialogRef;
  @Input() functionID: string = '';
  @Input() isAfterRender = false;
  @Input() showFooter = true;
  @Input() showAttachment = true;
  @Input() email?: email;

  @ViewChild('addTemplateName') addTemplateName: TemplateRef<any>;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('dataView', { static: false }) dataView: ElementRef;
  @ViewChild('textarea', { static: false }) textarea: ElementRef;
  @ViewChild('richtexteditor') richtexteditor: CodxInputComponent;
  @ViewChild('defaultRTE')
  public defaultRTE: RichTextEditorComponent;

  @ViewChild('listviewInstance', { static: false })
  public listviewInstance: any;

  @ViewChild('textbox', { static: false }) textboxEle: any;

  vllShareData: any;
  public cssClass: string = 'e-list-template';
  constructor(
    private callFunc: CallFuncService,
    private cr: ChangeDetectorRef,
    private codxService: CodxShareService,
    private dmSV: CodxDMService,
    private cache: CacheService,
    private mainService: CodxService
  ) {
    this.cache.valueList('ES014').subscribe((res) => {
      this.vllShareData = res;
      console.log('vll', res);
    });
  }

  ngOnInit(): void {
    if (!this.formModel.entityName) {
      this.formModel = new FormModel();
      this.formModel.entityName = 'AD_EmailTemplates';
      this.formModel.formName = 'EmailTemplates';
      this.formModel.gridViewName = 'grvEmailTemplates';
      this.formModel.funcID = '';

      this.cache.gridView(this.formModel.gridViewName).subscribe((gridView) => {
        // this.cache.setGridView(this.formModel.gridViewName, gridView);
        this.cache
          .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
          .subscribe((gridViewSetup) => {
            // this.cache.setGridViewSetup(
            //   this.formModel.formName,
            //   this.formModel.gridViewName,
            //   gridViewSetup
            // );
            this.dialogETemplate = this.mainService.buildFormGroup(
              this.formModel.formName,
              this.formModel.gridViewName,
              ''
            );

            if (this.templateID) {
              this.codxService
                .getEmailTemplate(this.templateID)
                .subscribe((res1) => {
                  if (res1 != null) {
                    console.log('getEmailTemplate', res1);
                    this.data = res1[0];
                    this.dialogETemplate.patchValue(this.data);
                    if (this.data?.gridviewName) {
                      //Load field theo cubeID của EmailTemplate
                      this.loadListFieldByGridViewName(
                        this.data?.gridviewName,
                        this.data?.formName
                      );
                    } else {
                      this.loadListFieldByFuntion();
                    }
                    // this.setViewBody();
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

                    if (res1.length > 1 && res1[2]) {
                      let lstCube = res1[2] as any[];
                      this.dataSource = [...this.dataSource, ...lstCube];
                    }
                    this.formModel.currentData = this.data =
                      this.dialogETemplate.value;
                    this.isAfterRender = true;
                  }
                  //this.cr.detectChanges();
                });
            }
            // else if (this.templateType) {
            // }
            else {
              this.codxService
                .getDataDefault(this.functionID)
                .subscribe((res) => {
                  if (res) {
                    //this.setViewBody();

                    this.data = res;
                    this.dialogETemplate.patchValue(this.data);
                    if (this.email) this.dialogETemplate.patchValue(this.email);
                    this.dialogETemplate.addControl(
                      'recID',
                      new FormControl(this.data.recID)
                    );
                    this.loadListFieldByFuntion();
                    this.formModel.currentData = this.data =
                      this.dialogETemplate.value;
                    this.isAfterRender = true;
                    //this.cr.detectChanges();
                  }
                });
            }
          });
      });
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

  toChange(evt: any, sendType: string) {
    let value = evt?.currentTarget?.value;
    let r = this.validateEmail(value);
    if (!r) return;
    let o: any = {};
    o['sendType'] = sendType;
    o['objectType'] = 'Email';
    o['objectID'] = value;
    if (sendType == '2') {
      if (
        !this.lstTo.find(
          (x) =>
            x.objectID.toLowerCase() == value.toLowerCase() &&
            x.objectType == 'Email'
        )
      )
        this.lstTo.push(o);
    } else if (sendType == '3') {
      if (
        !this.lstCc.find((x) => x.objectID == value && x.objectType == 'Email')
      )
        this.lstCc.push(o);
    } else if (sendType == '4') {
      if (
        !this.lstBcc.find(
          (x) => x.objectID.toLo == value.to && x.objectType == 'Email'
        )
      )
        this.lstBcc.push(o);
    }
    evt.currentTarget.value = '';
  }

  onKeydown(evt: KeyboardEvent, sendType: string) {
    const key = evt.code;
    let value = (evt.currentTarget as any).value;
    if (value) return;
    if (key === 'Backspace') {
      if (sendType == '2') {
        if (this.lstTo.length > 0) this.lstTo = this.lstTo.slice(0, -1);
      } else if (sendType == '3') {
        if (this.lstCc.length > 0) this.lstCc = this.lstCc.slice(0, -1);
      } else if (sendType == '4') {
        if (this.lstBcc.length > 0) this.lstBcc = this.lstBcc.slice(0, -1);
      }
    }
  }

  validateEmail(inputText: string): boolean {
    if (!inputText) return false;
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (inputText.match(mailformat)) {
      return true;
    } else {
      return false;
    }
  }

  changeSendType(sendType) {
    if (sendType == 'cc') {
      this.showCC = !this.showCC;
    } else if (sendType == 'bcc') {
      this.showBCC = !this.showBCC;
    }
  }

  testdata(share) {
    this.callFunc.openForm(share, '', 420, window.innerHeight);
  }

  valueChange(event) {
    if (event?.field && event.component) {
      switch (event.field) {
        case 'isTemplate': {
          this.saveIsTemplate = event?.data;
          break;
        }
        case 'sendTime': {
          this.data[event.field] = event.data.fromDate;
          this.dialogETemplate.patchValue({
            [event['field']]: event.data.fromDate,
          });
          break;
        }
        case 'template': {
          if (event?.data != '') {
            this.templateID = event?.data;
            this.codxService
              .getEmailTemplate(this.templateID)
              .subscribe((res1) => {
                if (res1 != null) {
                  console.log('getEmailTemplate', res1);
                  this.data = res1[0];
                  this.dialogETemplate.patchValue(this.data);
                  if (this.data?.gridviewName) {
                    //Load field theo cubeID của EmailTemplate
                    this.loadListFieldByGridViewName(
                      this.data?.gridviewName,
                      this.data?.formName
                    );
                  } else {
                    this.loadListFieldByFuntion();
                  }
                  this.dialogETemplate.addControl(
                    'recID',
                    new FormControl(res1[0].recID)
                  );

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
                //this.cr.detectChanges();
              });
          }
          break;
        }
        default: {
          this.data[event.field] = event.data;
          this.dialogETemplate.patchValue({ [event['field']]: event.data });
        }
      }
    }
    this.cr.detectChanges();
  }

  loadListFieldByGridViewName(gridViewName, formName) {
    this.cache.gridViewSetup(formName, gridViewName).subscribe((grvSetup) => {
      if (grvSetup) {
        var arrgv = Object.values(grvSetup) as any[];
        var result = [];
        console.log(grvSetup);
        arrgv.forEach((element) => {
          if (element.isVisible) {
            var obj = {
              fieldName: element?.fieldName,
              headerText: element?.headerText,
              data: element,
            };
            result.push(obj);
          }
        });
        this.dataSource = result;
        //this.setViewBody();
        // this.initForm();
      }
    });
  }

  loadListFieldByFuntion() {
    this.cache.functionList(this.functionID).subscribe((res) => {
      if (res) {
        this.loadListFieldByGridViewName(res.formName, res.gridViewName);
      }
    });
  }

  showHide() {
    this.showAI = !this.showAI;
  }

  valueChangeContentEmail(e: any) {
    this.dataAI = {
      content: e?.data,
    };
  }

  openFormUploadFile() {
    this.attachment.uploadFile();
  }

  fileAdded(event) {}

  getfileCount(e: any) {}

  clickDataView(event = null) {
    this.richtexteditor.control.angularValue = this.data?.message;
    this.isInside = true;
    this.show = !this.show;
    this.cr.detectChanges();
  }

  click() {
    this.isInside = true;
  }

  onkeyup(event) {
    console.log(this.richtexteditor.control.angularValue);

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

  onActionComplete(args: any): void {}

  clickItem(item) {
    console.log('clickItem', item);
    if (item) {
      this.insert(item);
    }
  }

  insert(data: any) {
    const tempElem: HTMLElement = this.richtexteditor.control.createElement(
      this.richtexteditor.control.enterKey
    );

    console.log('message', this.data.message);
    console.log(
      'before angularvalue',
      this.richtexteditor.control.angularValue
    );
    if (data && data != null) {
      // this.saveSelection = this.selection.save(this.range, document);
      // this.saveSelection.restore();
      //console.log(this.saveSelection);
      let html =
        '<span contenteditable="false" class="e-mention-chip" ><span class="e-success" codx-data="{0}">#{1}</span></span>';
      if (data.data.referedType == '2') {
        var key = data?.fieldName + '|vll:' + data?.data?.referedValue;
        var value = data?.headerText;
        html = Util.stringFormat(html, key, value);
      } else if (data.data.referedType == '3') {
        var key = data?.fieldName + '|cbx:' + data?.data?.referedValue;
        var value = data?.headerText;
        html = Util.stringFormat(html, key, value);
      } else {
        var key = data?.fieldName + '';
        var value = data?.headerText;
        html = Util.stringFormat(html, key, value);
      }

      this.richtexteditor.control.executeCommand('insertHTML', html);
      this.data.message =
        this.richtexteditor?.control?.contentModule?.editableElement?.innerHTML;
      this.dialogETemplate.patchValue({ message: this.data.message });

      this.cr.detectChanges();
    }
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
            appr.objectID =
              element?.objectType == 'SYS061'
                ? element?.id
                : element?.objectType;
            appr.text =
              element?.objectType == 'SYS061'
                ? element?.text
                : element?.objectName;
            appr.objectType =
              element?.objectType == 'SYS061'
                ? element?.id
                : element?.objectType;
            appr.sendType = sendType.toString();
            appr.icon = element?.icon ?? element?.dataSelected?.icon;
            if (element?.objectType == 'SYS061' && !appr.icon) {
              appr.icon = this.vllShareData?.datas?.find(
                (x) => x.value == 'SYS061'
              )?.icon;
            }
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

  closePopup(dialog: DialogRef) {
    dialog.close();
  }

  onSaveForm(dialog1: DialogRef) {
    if (this.dialogETemplate.invalid) {
      this.codxService.notifyInvalid(this.dialogETemplate, this.formModel);
      return;
    }
    let lstSento = [
      ...this.lstFrom,
      ...this.lstTo,
      ...this.lstCc,
      ...this.lstBcc,
    ];
    console.log(lstSento);

    if (this.saveIsTemplate) {
      //lưu thành template ==> save new emailTemplate
      if (!this.isAddNew && this.templateID) {
        this.codxService
          .editEmailTemplate(this.data, lstSento)
          .subscribe((res) => {
            if (res) {
              this.dialog && this.dialog.close(res);
            }
          });
      }

      let oTemplate = JSON.parse(JSON.stringify(this.data));
      if (oTemplate && oTemplate.recID) {
        delete oTemplate.recID;
        oTemplate.isTemplate = true;
      }
      let lstSendToTemplate = JSON.parse(JSON.stringify(lstSento));
      if (lstSendToTemplate && lstSendToTemplate?.length > 0) {
        lstSendToTemplate.forEach((element) => {
          delete element.recID;
        });
      }
      this.codxService
        .addEmailTemplate(oTemplate, lstSendToTemplate)
        .subscribe((res) => {
          console.log(res);
          if (res) {
            console.log(res);
            if (this.attachment.fileUploadList.length > 0) {
              this.attachment.objectId = res.recID;
              console.log(this.dmSV.fileUploadList);
              this.attachment.saveFiles();
            }
            dialog1 && dialog1.close();
            this.dialog && this.dialog.close(res);
          }
        });
    } else if (this.isAddNew) {
      // lưu mới
      if (this.data && this.data.recID) {
        delete this.data.recID;
      }

      if (lstSento && lstSento?.length > 0) {
        lstSento.forEach((element) => {
          delete element.recID;
        });
      }
      this.codxService
        .addEmailTemplate(this.data, lstSento)
        .subscribe((res) => {
          if (res) {
            if (this.attachment.fileUploadList.length > 0) {
              this.attachment.objectId = res.recID;
              this.attachment.saveFiles();
            }
            this.data.recID = res.recID;
            this.dialog && this.dialog.close(res);
          }
        });
    } else if (this.isAddNew == false && this.templateID) {
      //chỉnh sửa
      this.codxService
        .editEmailTemplate(this.data, lstSento)
        .subscribe((res) => {
          if (res) {
            this.dialog && this.dialog.close(res);
          }
        });
    }
  }

  createContentEmail() {
    this.isLoadingAI = true;
    let prompt = `Mẫu promt (tiếng Việt): Bạn hãy tạo email dạng html theo nội dung ${this.dataAI.content}.`;
    this.fetch(this.dataAI, prompt)
      .then((res: any) => {
        this.data.message = res.data.Data;
        this.isLoadingAI = false;
      })
      .catch((err) => {});
  }

  fetch(data: any, prompt: any) {
    let url = 'https://api.trogiupluat.vn/api/OpenAI/v1/get-gpt-action';
    return axios.post(
      url,
      {
        Prompt: prompt,
        openAIKey: '',
        SourceText: JSON.stringify(data).replace(/\"/g, "'"),
      },
      {
        headers: {
          api_key:
            'OTcNmUMmYxNDQzNJmMWQMDgxMTAMWJiMDYYTUZjANWUxZTgwOTBiNzQyNGYNMOGIOTENGFhNg',
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  }
}

class email {
  subject?: string;
  message?: string;
}
