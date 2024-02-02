import { E } from '@angular/cdk/keycodes';
import {
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
import { DataManager, Query } from '@syncfusion/ej2-data';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  CodxInputComponent,
  CodxService,
  DataRequest,
  DialogData,
  DialogRef,
  FormModel,
  Util,
} from 'codx-core';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { EmailSendTo } from 'projects/codx-es/src/lib/codx-es.model';
import { CodxShareService } from '../../codx-share.service';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import axios from 'axios';

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
  @ViewChild('richtexteditor') richtexteditor: CodxInputComponent;
  @ViewChild('defaultRTE')
  public defaultRTE: RichTextEditorComponent;

  @ViewChild('listviewInstance', { static: false })
  public listviewInstance: any;

  @ViewChild('textbox', { static: false }) textboxEle: any;

  headerText: string = 'Email';
  subHeaderText: string = '';
  dialog: DialogRef;
  formModel: FormModel;
  date: any;
  templateID: string = '';
  type: string = 'AlertRules';
  templateType: string = '';

  saveIsTemplate: boolean = false;
  notSendMail = false; //nvthuan khong cho phep gui mail chỉ tao temp
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
  lstCubes: any = {};

  vllShare = 'ES014';
  container: HTMLElement;

  sendType = 'to';
  lstFrom = [];
  lstTo = [];
  lstCc = [];
  lstBcc = [];

  dataSource: any;

  width: any = 'auto';

  files: any; //param list file

  show = false;
  isAddNew: boolean = false;
  lstField: any;

  email?: email;
  option?: option;
  dataAI:any;
  public cssClass: string = 'e-list-template';

  //(1)(2)(3)(4) => ưu tiên get danh sách
  //cubeID: string; //Truyền vào (1) hoặc AD_EmailTemplates.CubeID (2) => get danh sách field để chọn (từ gridViewSetup)
  functionID: string; //truyền vào (3) hoặc lấy funtion nghiệp vụ (4) => get danh sách field để chọn (từ gridViewSetup)
  vllShareData: any;
  showAI = false;
  isLoadingAI = false;
  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private codxService: CodxShareService,
    // private esService: CodxEsService,

    private callFunc: CallFuncService,
    private auth: AuthStore,
    private dmSV: CodxDMService,
    private mainService: CodxService,
    private cr: ChangeDetectorRef,
    private renderer: Renderer2,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    debugger
    this.dialog = dialog;

    if (data?.data) {
      this.templateID = data.data.templateID;
      if (data.data.type) this.type = data.data.type;
      this.email = data.data.email as email;
      this.option = data.data.option as option;
      this.functionID = data.data.functionID;
    }

    if (!this.functionID) {
      this.functionID = window.location.pathname.split('/').pop();
    }

    console.log(data?.data);

    this.cache.valueList('ES014').subscribe((res) => {
      this.vllShareData = res;
      console.log('vll', res);
    });

    this.showIsPublish = data.data?.showIsPublish ?? true;
    this.showIsTemplate = data.data?.showIsTemplate ?? true;
    this.showSendLater = data.data?.showSendLater ?? true;
    this.showFrom = data.data?.showFrom ?? true;

    this.isAddNew = data.data?.isAddNew ?? false;
    this.files = data?.data?.files;
    this.saveIsTemplate = data?.data?.saveIsTemplate ?? false;
    this.notSendMail = data?.data?.notSendMail ?? false;

    this.renderer.listen('window', 'click', (e: Event) => {
      if (this.isInside == false && this.show == true) {
        this.show = false;
      }
      this.isInside = false;
    });
  }
  ngAfterViewInit(): void {
    // this.richtexteditor.control.angularValue = this.data?.message;
  }

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

  ngOnInit(): void {
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
          } else if (this.templateType) {
          } else {
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

  onSaveWithTemplate(dialog: DialogRef) {
    if (this.saveIsTemplate) {
      this.callFunc.openForm(this.addTemplateName, '', 400, 250);
    } else {
      this.onSaveForm(dialog);
    }
  }

  sendEmail() {
    let lstSento = [
      ...this.lstFrom,
      ...this.lstTo,
      ...this.lstCc,
      ...this.lstBcc,
    ];

    this.codxService
      .sendEmail(this.data, lstSento, this.option)
      .subscribe((res) => {
        if (res) {
          this.dialog &&
            this.dialog.close({ isSendMail: res, data: this.data });
        }
      });
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

  closePopup(dialog: DialogRef) {
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

  fileAdded(event) {}

  openFormUploadFile() {
    this.attachment.uploadFile();
  }

  getfileCount(e: any) {}

  public selection: NodeSelection = new NodeSelection();
  //public range: Range;
  //public saveSelection: NodeSelection;

  getPosition() {
    //this.range = this.selection.getRange(document);
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

  isInside: boolean = false;

  clickDataView(event = null) {
    this.richtexteditor.control.angularValue = this.data?.message;
    this.isInside = true;
    this.show = !this.show;
    this.cr.detectChanges();
  }

  clickItem(item) {
    console.log('clickItem', item);
    if (item) {
      this.insert(item);
    }
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

  valueChangeContentEmail(e:any)
  {
    this.dataAI = {
      content : e?.data,
    };
  }
  // Gợi ý nội dung email bằng AI 
  createContentEmail()
  {
    this.isLoadingAI = true;
    let prompt = `Mẫu promt (tiếng Việt): Bạn hãy tạo email dạng html theo nội dung ${this.dataAI.content}.`;
    this.fetch(this.dataAI,prompt).then((res:any) => 
      {
        this.data.message = res.data.Data;
        this.isLoadingAI = false;
      }).catch((err)=> {
    });
  }

  fetch(data:any,prompt:any)
  {
    let url = "https://api.trogiupluat.vn/api/OpenAI/v1/get-gpt-action";
    return axios.post(
      url,
      {
        'Prompt': prompt,
        'openAIKey': '',
        'SourceText': JSON.stringify(data).replace(/\"/g,"'")
      },
      {
        headers: 
        {
          'api_key': "OTcNmUMmYxNDQzNJmMWQMDgxMTAMWJiMDYYTUZjANWUxZTgwOTBiNzQyNGYNMOGIOTENGFhNg",
          'Content-Type': 'multipart/form-data'
        }
      })
  }

  showHide()
  {
    this.showAI = !this.showAI
  }
}

class email {
  subject?: string;
  message?: string;
}

class option {
  service?: string;
  assembly?: string;
  className?: string;
  method?: string;
  data?: string;
}
