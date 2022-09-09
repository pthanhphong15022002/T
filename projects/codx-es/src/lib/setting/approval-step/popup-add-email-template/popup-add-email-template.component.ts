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
import {
  NodeSelection,
  RichTextEditorComponent,
} from '@syncfusion/ej2-angular-richtexteditor';
import {
  ApiHttpService,
  AuthStore,
  CallFuncService,
  CodxInputComponent,
  DialogData,
  DialogRef,
  FormModel,
} from 'codx-core';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { DocumentRegistryBucketKey } from 'typescript';
import { CodxEsService } from '../../../codx-es.service';

@Component({
  selector: 'lib-popup-add-email-template',
  templateUrl: './popup-add-email-template.component.html',
  styleUrls: ['./popup-add-email-template.component.scss'],
})
export class PopupAddEmailTemplateComponent implements OnInit, AfterViewInit {
  @ViewChild('addTemplateName') addTemplateName: TemplateRef<any>;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('dataView', { static: false }) dataView: ElementRef;
  @ViewChild('textarea', { static: false }) textarea: ElementRef;
  @ViewChild('richtexteditor', { static: false })
  richtexteditor: CodxInputComponent;

  headerText: string = 'Thiết lập Email';
  subHeaderText: string = '';
  dialog: DialogRef;
  formModel: FormModel;
  date: any;
  email: any;
  dialogETemplate: FormGroup;
  isAfterRender = false;
  showIsTemplate = true;
  showIsPublish = true;
  showSendLater = true;
  formGroup: FormGroup;
  showCC = false;
  showBCC = false;

  vllShare = 'ES014';
  container: HTMLElement;

  sendType = 'to';
  lstFrom = [];
  lstTo = [];
  lstCc = [];
  lstBcc = [];

  width: any = 'auto';

  constructor(
    private api: ApiHttpService,
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
    this.formGroup = data?.data.formGroup;
    this.email = data?.data.dialogEmail;
    this.showIsPublish = data.data?.showIsPublish;
    this.showIsTemplate = data.data?.showIsTemplate;
    this.showSendLater = data.data.showSendLater;

    this.renderer.listen('window', 'click', (e: Event) => {
      if (
        this.dataView &&
        e.target !== this.dataView?.nativeElement &&
        this.textarea &&
        this.isFocus == false
      ) {
        this.width = (this.textarea.nativeElement as HTMLElement).offsetWidth;
        this.cr.detectChanges();
      }
      this.isFocus = false;
    });
  }

  staticWidth: number = 0;
  ngAfterViewInit(): void {
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

    this.esService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((res) => {
        if (res) {
          this.dialogETemplate = res;

          this.esService
            .getEmailTemplate(this.email.templateID)
            .subscribe((res1) => {
              if (res1 != null) {
                this.dialogETemplate.patchValue(res1[0]);
                this.dialogETemplate.addControl(
                  'recID',
                  new FormControl(res1[0].recID)
                );

                let lstUser = res1[1];
                if (lstUser.length > 0) {
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

                if (this.lstFrom.length == 0) {
                  const user = this.auth.get();
                  let defaultFrom = new EmailSendTo();
                  defaultFrom.objectType = 'U';
                  defaultFrom.objetID = user.userID;
                  defaultFrom.text = user.userName;

                  this.lstFrom.push(defaultFrom);
                }
                this.isAfterRender = true;
              }
              this.cr.detectChanges();
            });
        }
      });
  }

  ngOnInit(): void {
    this.initForm();
  }

  onSaveWithTemplate(dialog: DialogRef) {
    if (this.dialogETemplate.value.isTemplate) {
      this.callFunc.openForm(this.addTemplateName, 'Nhập tên', 400, 250);
    } else {
      this.onSaveForm1(dialog);
    }
  }

  onSaveForm1(dialog1: DialogRef) {
    let lstSento = [
      ...this.lstFrom,
      ...this.lstTo,
      ...this.lstCc,
      ...this.lstBcc,
    ];
    console.log(lstSento);

    this.esService
      .addEmailTemplate(this.dialogETemplate.value, lstSento)
      .subscribe((res) => {
        console.log(res);
        if (res) {
          console.log(res);
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
          dialog1 && dialog1.close();
          this.dialog && this.dialog.close();
        }
      });
  }

  valueChange(event) {
    debugger;
    if (event?.field && event.component) {
      if (event.field == 'sendTime') {
        this.insert(null);
        this.dialogETemplate.patchValue({
          [event['field']]: event.data.fromDate,
        });
      } else if (event.data instanceof Object) {
        this.dialogETemplate.patchValue({
          [event['field']]: event.data,
        });
      } else {
        this.dialogETemplate.patchValue({ [event['field']]: event.data });
      }
    }
  }

  valueSentoChange(event, sendType) {
    if (event?.field && event.component) {
      switch (event.field) {
        case 'from':
          event.data?.forEach((element) => {
            let index = this.lstFrom.findIndex((p) => p.objetID == element.id);

            if (this.lstFrom.length == 0 || index < 0) {
              let item = new EmailSendTo();
              item.objetID = element.id;
              item.objectType = element.objectType;
              item.text = element.text;
              item.sendType = sendType;
              this.lstFrom.push(item);
            }
          });
          console.log(this.lstFrom);

          break;
        case 'to':
          event.data?.forEach((element) => {
            let index = this.lstTo.findIndex((p) => p.objetID == element.id);
            if (this.lstTo.length == 0 || index < 0) {
              let item = new EmailSendTo();
              item.objetID = element.id;
              item.objectType = element.objectType;
              item.text = element.text;
              item.sendType = sendType;
              this.lstTo.push(item);
            }
          });
          break;
        case 'cc':
          event.data?.forEach((element) => {
            let index = this.lstCc.findIndex((p) => p.objetID == element.id);

            if (this.lstCc.length == 0 || index < 0) {
              let item = new EmailSendTo();
              item.objetID = element.id;
              item.objectType = element.objectType;
              item.text = element.text;
              item.sendType = sendType;
              this.lstCc.push(item);
            }
          });
          break;
        case 'bcc':
          event.data?.forEach((element) => {
            let index = this.lstTo.findIndex((p) => p.objetID == element.id);

            if (this.lstCc.length == 0 || index < 0) {
              let item = new EmailSendTo();
              item.objetID = element.id;
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
        if (element.objectType.length == 1) {
          let lstID = element?.id.split(';');
          let lstUserName = element?.text.split(';');

          for (let i = 0; i < lstID?.length; i++) {
            let isExist = this.isExist(element?.objectType, sendType);
            if (lstID[i].toString() != '' && isExist == false) {
              let appr = new EmailSendTo();
              appr.objectType = element.objectType;
              appr.text = lstUserName[i];
              appr.objetID = lstID[i];
              appr.sendType = sendType.toString();
              lst.push(appr);
            }
          }
        } else {
          let isExist = this.isExist(element?.objectType, sendType);
          if (isExist == false) {
            let appr = new EmailSendTo();
            appr.objetID = element?.objectType;
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

  isExist(objetID, sendType) {
    let index = -1;
    switch (sendType) {
      case 1:
        index = this.lstFrom.findIndex((p) => p.objetID == objetID);
        break;
      case 2:
        index = this.lstFrom.findIndex((p) => p.objetID == objetID);
        break;
      case 3:
        index = this.lstFrom.findIndex((p) => p.objetID == objetID);
        break;
      case 4:
        index = this.lstFrom.findIndex((p) => p.objetID == objetID);
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

  insert(evt: any) {
    this.saveSelection = this.selection.save(this.range, document);
    this.saveSelection.restore();
    // this.richtexteditor.control.executeCommand('fontColor', 'gray');
    // this.richtexteditor.control.executeCommand('insertText', ' [TEST] ');
  }

  isFocus: boolean = false;
  focusCombobox(event = null) {
    let crrWidth = (this.textarea.nativeElement as HTMLElement).offsetWidth;
    console.log('width', crrWidth);

    if (this.width == crrWidth || this.width == 'auto') {
      this.width =
        (this.textarea.nativeElement as HTMLElement).offsetWidth -
        (this.dataView.nativeElement as HTMLElement).offsetWidth -
        5;
    }

    this.isFocus = true;
    this.cr.detectChanges();

    // const childTwoElement =
    //   this.textarea.nativeElement.getElementsByClassName('message')[0];
    // if (childTwoElement) {
    //   let width =
    //     (this.textarea.nativeElement as HTMLElement).offsetWidth -
    //     (this.dataView.nativeElement as HTMLElement).offsetWidth;
    //   this.renderer.setStyle(childTwoElement, 'width', `${width - 5}px`);
    // }
  }
}

export class EmailSendTo {
  transID: string;
  sendType: string;
  objectType: string;
  objetID: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
  text: string;
  icon: string = null;
}
