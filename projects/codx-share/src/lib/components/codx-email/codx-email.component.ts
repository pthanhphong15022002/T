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
import { NodeSelection } from '@syncfusion/ej2-angular-richtexteditor';
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

  saveIsTemplate: boolean = false;
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

  dataSource: any;

  width: any = 'auto';

  files: any; //param list file

  show = false;
  isAddNew: boolean = false;
  lstField: any;

  public cssClass: string = 'e-list-template';

  //(1)(2)(3)(4) => ưu tiên get danh sách
  cubeID: string; //Truyền vào (1) hoặc AD_EmailTemplates.CubeID (2) => get danh sách field để chọn (từ gridViewSetup)
  functionID: string; //truyền vào (3) hoặc lấy funtion nghiệp vụ (4) => get danh sách field để chọn (từ gridViewSetup)

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private codxService: CodxShareService,
    // private esService: CodxEsService,

    private callFunc: CallFuncService,
    private auth: AuthStore,
    private dmSV: CodxDMService,
    private cr: ChangeDetectorRef,
    private renderer: Renderer2,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
    this.templateID = data?.data?.templateID;
    this.isAddNew = data?.data?.isAddNew ?? true;

    this.cubeID = data?.data?.cubeID;
    this.functionID = data?.data?.functionID;

    if (!this.functionID) {
      this.functionID = window.location.pathname.split('/').pop();
    }

    console.log(data?.data);

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

  ngOnInit(): void {
    this.formModel = new FormModel();
    this.formModel.entityName = 'AD_EmailTemplates';
    this.formModel.formName = 'EmailTemplates';
    this.formModel.gridViewName = 'grvEmailTemplates';
    this.formModel.funcID = '';

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

                if (this.cubeID) {
                  //truyền cubeID
                  this.loadListFieldByCubeID(this.cubeID);
                  return;
                } else {
                  //get cubeIB by EmailTemplate
                  if (this.templateID) {
                    this.codxService
                      .getEmailTemplate(this.templateID)
                      .subscribe((res1) => {
                        if (res1 != null) {
                          console.log('getEmailTemplate', res1);

                          this.data = res1[0];
                          this.dialogETemplate.patchValue(res1[0]);
                          if (this.data.cubeID) {
                            //Load field theo cubeID của EmailTemplate
                            this.loadListFieldByCubeID(this.data.cubeIB);
                          } else {
                            this.loadListFieldByFuntion();
                          }
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
                    this.loadListFieldByFuntion();
                  }
                }
              }
            });
        });
    });
  }

  initForm() {
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
                  console.log('getEmailTemplate', res1);

                  this.data = res1[0];
                  this.dialogETemplate.patchValue(res1[0]);
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

    this.cr.detectChanges();
  }

  loadListFieldByCubeID(cubeID: string) {
    if (!cubeID) return;
    var request = new DataRequest();
    request.entityName = 'BI_Cubes';
    request.predicates = 'CubeID=@0';
    request.dataValues = cubeID;
    request.pageLoading = false;
    request.page = 1;
    this.codxService.loadData('BI', request).subscribe((res) => {
      if (res && res[1] > 0) {
        var result = [];
        var lstRes = res[0];
        lstRes.forEach((element) => {
          var obj = {
            fieldName: element['FieldName'],
            headerText: element['HeaderText'],
            data: element,
          };
          result.push(obj);
        });
        this.dataSource = result;
        this.initForm();
        this.setViewBody();
      }
    });
  }

  loadListFieldByFuntion() {
    this.cache.functionList(this.functionID).subscribe((res) => {
      if (res) {
        this.cache
          .gridViewSetup(res.formName, res.gridViewName)
          .subscribe((grvSetup) => {
            if (grvSetup) {
              var arrgv = Object.values(grvSetup) as any[];
              var result = [];
              console.log(grvSetup);
              arrgv.forEach((element) => {
                var obj = {
                  fieldName: element?.fieldName,
                  headerText: element?.headerText,
                  data: element,
                };
                result.push(obj);
              });
              this.dataSource = result;
              this.setViewBody();
              this.initForm();
            }
          });
      }
    });
  }

  setViewBody() {
    return
    if (this.dataSource && this.dialogETemplate) {
      if (!this.data.message && this.data.message == null) {
        this.data.message = '';
        this.dialogETemplate?.patchValue({ message: this.data.message });
      }
      this.dataSource?.forEach((element) => {
        this.data.message = this.data.message.replace(
          '[' + element.fieldName + ']',
          '[' + element.headerText + ']'
        );
      });
      this.dialogETemplate?.patchValue({ message: this.data.message });
      this.cr.detectChanges();
    }
  }

  setMessage(message: any) {
    return;
    if (message) {
      this.dataSource?.forEach((element) => {
        message = message.replace(
          '[' + element.headerText + ']',
          '[' + element.fieldName + ']'
        );
      });
    }
    return message;
  }

  onSaveWithTemplate(dialog: DialogRef) {
    if (this.saveIsTemplate) {
      this.callFunc.openForm(this.addTemplateName, '', 400, 250);
    } else {
      this.onSaveForm(dialog);
    }
  }

  sendEmail() {
    this.codxService.sendEmailTemplate(this.templateID).subscribe((res) => {});
  }

  onSaveForm(dialog1: DialogRef) {
    if (this.dialogETemplate.invalid) {
      this.codxService.notifyInvalid(this.dialogETemplate, this.formModel);
      return;
    }
    this.data.message = this.setMessage(this.data.message);
    this.dialogETemplate.patchValue({ message: this.data.message });
    let lstSento = [
      ...this.lstFrom,
      ...this.lstTo,
      ...this.lstCc,
      ...this.lstBcc,
    ];
    console.log(lstSento);

    if (this.saveIsTemplate) {
      //luu thành template ==> save new emailTemplate
      if (!this.isAddNew && this.templateID) {
        this.codxService
          .editEmailTemplate(this.dialogETemplate.value, lstSento)
          .subscribe((res) => {
            if (res) {
              if (this.formGroup) {
                let emailTemplates = this.formGroup.value.emailTemplates;
                //this.esService.lstTmpEmail.push(res);
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

      let oTemplate = JSON.parse(JSON.stringify(this.dialogETemplate.value));
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
            // if (this.formGroup) {
            //   let emailTemplates = this.formGroup.value.emailTemplates;
            //   this.esService.lstTmpEmail.push(res);
            //   let i = emailTemplates.findIndex(
            //     (p) => p.emailType == res.templateType
            //   );
            //   if (i >= 0) {
            //     emailTemplates[i].templateID = res.recID;

            //     if (this.attachment.fileUploadList.length > 0) {
            //       this.attachment.objectId = res.recID;
            //       console.log(this.dmSV.fileUploadList);
            //       this.attachment.saveFiles();
            //     }

            //     this.formGroup.patchValue({ emailTemplates: emailTemplates });
            //   }
            // }
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
      this.codxService
        .addEmailTemplate(this.dialogETemplate.value, lstSento)
        .subscribe((res) => {
          if (res) {
            // if (this.formGroup) {
            //   let emailTemplates = this.formGroup.value.emailTemplates;
            //   this.esService.lstTmpEmail.push(res);
            //   let i = emailTemplates.findIndex(
            //     (p) => p.emailType == res.templateType
            //   );
            //   if (i >= 0) {
            //     emailTemplates[i].templateID = res.recID;

            //     this.formGroup.patchValue({ emailTemplates: emailTemplates });
            //   }
            // }
            if (this.attachment.fileUploadList.length > 0) {
              this.attachment.objectId = res.recID;
              this.attachment.saveFiles();
            }
            this.dialog && this.dialog.close(res);
          }
        });
    } else if (this.isAddNew == false && this.templateID) {
      //chỉnh sửa
      this.codxService
        .editEmailTemplate(this.dialogETemplate.value, lstSento)
        .subscribe((res) => {
          if (res) {
            if (this.formGroup) {
              let emailTemplates = this.formGroup.value.emailTemplates;
              //this.esService.lstTmpEmail.push(res);
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
            this.codxService.getEmailTemplate(event?.data).subscribe((res1) => {
              if (res1 != null) {
                res1[0].recID = this.data?.recID;
                res1[0].id = this.data?.id;
                this.data = res1[0];
                this.setViewBody();
                this.dialogETemplate.patchValue(res1[0]);
                this.setViewBody();

                this.richtexteditor.control.angularValue = this.data?.message;

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
      console.log(this.saveSelection)
      let html =
        '<span data="' + data?.fieldName + '">[' + data?.headerText + ']</span>';
      if (data.data.referedType == '2') {
        html = '<span data="' + data?.fieldName + '|vll:' + data?.data?.referedValue + '">[' + data?.headerText + ']</span>';
      }
      else if(data.data.referedType == '3'){
        html = '<span data="' + data?.fieldName + '|cbx:' + data?.data?.referedValue + '">[' + data?.headerText + ']</span>';
      }

      this.richtexteditor.control.executeCommand('insertHTML', "&nbsp;");
      this.richtexteditor.control.executeCommand('insertHTML', html);
      this.richtexteditor.control.executeCommand('insertHTML', "&nbsp;");

      // this.richtexteditor.control.executeCommand('fontColor', 'gray');
      // this.richtexteditor.control.executeCommand(
      //   'insertText',
      //   ' [' + data?.headerText + '] '
      // );
      // this.richtexteditor.control.executeCommand('fontColor', 'black');

      this.range = this.selection.getRange(document);
      this.data.message = this.richtexteditor.control.angularValue;

      console.log(this.richtexteditor.control.angularValue);
      
      this.dialogETemplate.patchValue({ message: this.data.message });


      

      this.cr.detectChanges();
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

  keyUp(event) {
    console.log(this.richtexteditor.control.angularValue);

    this.range = this.selection.getRange(document);
  }

  onActionComplete(args: any): void {}
}
