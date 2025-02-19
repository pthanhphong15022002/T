import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  AuthService,
  AuthStore,
  CacheService,
  CallFuncService,
  CodxFormComponent,
  CRUDService,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  SidebarModel,
} from 'codx-core';
import { CodxViewApprovalStepComponent } from 'projects/codx-share/src/lib/components/codx-view-approval-step/codx-view-approval-step.component';
import { CodxApproveStepsComponent } from 'projects/codx-share/src/lib/components/codx-approve-steps/codx-approve-steps.component';
import { CodxEsService } from '../../../codx-es.service';
//import { ApprovalStepComponent } from '../../approval-step/approval-step.component';
import { PopupAddAutoNumberComponent } from '../popup-add-auto-number/popup-add-auto-number.component';
import { PopupAddSignFileComponent } from '../../../sign-file/popup-add-sign-file/popup-add-sign-file.component';
@Component({
  selector: 'popup-add-category',
  templateUrl: './popup-add-category.component.html',
  styleUrls: ['./popup-add-category.component.scss'],
})
export class PopupAddCategoryComponent implements OnInit, AfterViewInit {
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('editApprovalStep') editApprovalStep: TemplateRef<any>;

  @ViewChild('approvalStep') approvalStep: CodxViewApprovalStepComponent;

  isAfterRender: boolean = false;
  viewAutoNumber = '';

  isAdd: boolean = false;
  isSaved = false;
  isAddAutoNumber = true;
  isClose = true;
  transID: String = '';
  disableCategoryID: string;

  headerText = '';
  subHeaderText = '';
  dialog: DialogRef;
  data: any;

  autoNumber: any;

  formModel: FormModel;
  lstApproval: any = null;
  grvSetup: any;
  settingDataValue: any;
  //havaESign: boolean = false;

  type: string;
  parentRecID: string;
  oldRecID: string;
  isES = false;
  //test to update signtype for all step
  isChangeSignatureType: boolean = false;
  signatureType: string;

  oUpdate: any = null; //update item in grid

  hasModuleES: boolean = false;
  dataType = ''; //Anh Thao thêm để lấy data khi không có dataService --sau nay nếu sửa thì báo anh Thảo với!! Thank - Huế ngày 14/04/2023
  signFileFM: FormModel;
  curUser: any;
  sfTemplates = [];
  vllShare = null; //vll list Approver
  tabInfo = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'tabGeneralInfo',
    },
    {
      icon: 'icon-person_outline',
      text: 'Quy trình xét duyệt',
      name: 'tabApprovalStep',
    },
    
  ];
  sfModel: any;
  templateRefType: any;
  templateRefID: any;
  //CRM
  disableESign = false;
  showTemplateTab=true;

  constructor(
    private esService: CodxEsService,
    private cache: CacheService,
    private cfService: CallFuncService,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private callfunc: CallFuncService,
    private authService: AuthService,
    private authStore: AuthStore,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.curUser = authStore.get();
    this.dialog = dialog;
    this.dataType = data?.data?.dataType;
    if (this.dataType != 'auto') {
      this.data = JSON.parse(JSON.stringify(dialog?.dataService?.dataSelected));
    } else this.data = JSON.parse(JSON.stringify(data?.data?.data));
    if(this.data?.eSign){
      this.data.editApprovers = true ;
    }
    this.signatureType = dialog?.dataService?.dataSelected?.signatureType;
    this.isAdd = data?.data?.isAdd;
    this.isES = data?.data?.isES;
    this.formModel = this.dialog.formModel;
    this.headerText = data?.data?.headerText;
    this.type = data?.data?.type;
    this.oldRecID = data?.data?.oldRecID;
    this.disableCategoryID = data?.data?.disableCategoryID ?? '0';
    this.vllShare = data?.data?.vllShare ?? null;
    this.templateRefID = data?.data?.templateRefID;
    this.templateRefType = data?.data?.templateRefType;
    //NV CRM
    this.disableESign = data?.data?.disableESign ?? this.disableESign; //disable nút ký số
    this.showTemplateTab = data?.data?.showTemplateTab ?? this.showTemplateTab;
    if(this.showTemplateTab){
      this.tabInfo.push({
        icon: 'icon-layers',
        text: 'Mẫu thiết lập',
        name: 'tabTemplate',
      });
    }
  }

  ngAfterViewInit(): void {
    this.dialog.closed.subscribe((res) => {
      if (res.event == null && this.oUpdate != null) {
        //update gridView dont use btb Save when close form
        this.dialog.dataService.update(this.oUpdate).subscribe();
      }
      this.esService.setLstDeleteStep(null);
      this.esService.setApprovalStep(null);
      if (this.isSaved) {
        this.esService.deleteCategory(this.data.categoryID);
      }
      if (this.type == 'copy' && !this.isSaved) {
        this.esService.deleteStepByTransID(this.data?.recID).subscribe();
      }
      if (!this.isSaved && this.isAddAutoNumber) {
        //delete autoNumer đã thiết lập
        this.esService
          .deleteAutoNumber(this.data.categoryID ?? this.data.recID)
          .subscribe((resDelete) => {});

        //delete EmailTemplate da thiet lap
        this.esService.deleteEmailTemplate().subscribe((res1) => {
          if (res1) {
            this.esService.lstTmpEmail = [];
          }
        });
      }
    });
  }

  ngOnInit(): void {
    this.esService.getFormModel('EST011').then((res) => {
      if (res) {
        this.signFileFM = res;
      }
    });
    let predicate = 'RefModule=@0 and FormName=@1';
    let dataValue = 'SYS;System';
    this.esService
      .getSettingByPredicate(predicate, dataValue)
      .subscribe((res) => {
        if (res?.dataValue) {
          let item = JSON.parse(res?.dataValue);
          if (item?.ES1 == true) {
            this.hasModuleES = true;
            this.cr.detectChanges();
          }
        }
      });
    //copy
    if (this.type == 'copy') {
      //New list step
      this.esService
        .copyApprovalStep(this.oldRecID, this.data.recID)
        .subscribe((res) => {});
    }
    this.cache
      .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
      .subscribe((grv) => {
        if (grv) this.grvSetup = grv;
        this.cr.detectChanges();
      });

    // this.cache.functionList('ES').subscribe((res) => {
    //   if (res) this.havaESign = true;
    //   if (this.isAdd == true) {
    //     this.data.eSign = this.havaESign;
    //     this.cr.detectChanges();
    //   }
    // });
    this.getSFTemplate();
    this.getNewSFModel();
    if (this.isAdd) {
      this.data.countStep = 0;

      this.esService
        .getSettingByPredicate(
          'FormName=@0 and Category=@1',
          'ESParameters;' + 1
        )
        .subscribe((setting) => {
          if (setting?.dataValue) {
            this.settingDataValue = JSON.parse(setting.dataValue);
            if (this.settingDataValue) {
              let lstTrueFalse = ['AllowEditAreas', 'allowEditAreas'];
              for (const key in this.settingDataValue) {
                let fieldName = key.charAt(0).toLowerCase() + key.slice(1);
                this.data[fieldName] = this.settingDataValue[key];

                if (lstTrueFalse.includes(key)) {
                  this.data[fieldName] =
                    this.settingDataValue[key] == '0' ? false : true;
                  if (key == 'AreaControl') {
                  }
                } else {
                  this.data[fieldName] = this.settingDataValue[key];
                }
                //this.data[fieldName] = this.settingDataValue[key];
                this.form.formGroup.patchValue({
                  fieldName: this.data[fieldName],
                });
              }
              this.cr.detectChanges();
            }
          }
          this.esService
            .getAutoNumber(this.data.autoNumber)
            .subscribe((res) => {
              if (res != null) {
                this.autoNumber = res;
                if (res.autoNoCode != null) {
                  this.setViewAutoNumber(this.autoNumber);
                  this.isAddAutoNumber = false;
                }
              }
            });
        });
    } else {
    }
    this.form?.formGroup?.addControl(
      'countStep',
      new FormControl(this.data.countStep ?? 0)
    );

    if (!this.isAdd) {
      if (!this.form?.formGroup) {
        this.esService
          .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
          .then((fg) => {
            if (fg) {
              this.form.formGroup = fg;
              this.form?.formGroup.patchValue(this.data);
              this.cr.detectChanges;
            }
          });
      } else {
        this.form?.formGroup.patchValue(this.data);
        this.cr.detectChanges;
      }
      this.esService.getFormModel('EST04').then((res) => {
        if (res && this.data.countStep > 0) {
          //let fmApprovalStep = res;
          // let gridModels = new GridModels();
          // gridModels.dataValue = this.data.recID;
          // gridModels.predicate = 'TransID=@0';
          // gridModels.funcID = fmApprovalStep.funcID;
          // gridModels.entityName = fmApprovalStep.entityName;
          // gridModels.gridViewName = fmApprovalStep.gridViewName;
          // gridModels.pageSize = 20;
        }
      });

      //get Autonumber
      this.esService.getAutoNumber(this.data?.autoNumber).subscribe((res) => {
        if (res != null) {
          this.autoNumber = res;
          if (res.autoNoCode != null) {
            this.setViewAutoNumber(this.autoNumber);
            this.isAddAutoNumber = false;
          }
        }
      });
      this.cr.detectChanges;
    }
  }

  valueChange(event) {
    if (event?.field && event?.component) {
      let fieldName =
        event.field.charAt(0).toUpperCase() + event.field.slice(1);
      switch (event?.field) {
        case 'autoNumberControl':
        case 'areaControl': {
          this.data[event['field']] = event?.data == true ? '1' : '0';
          this.form?.formGroup?.patchValue({
            [event['field']]: this.data[event['field']],
          });
          break;
        }
        case 'confirmControl': {
          if (this.data?.countStep > 0) {
            this.notify.alertCode('ES023').subscribe((x) => {
              //open popup confirm
              let lastValue = JSON.parse(
                JSON.stringify(this.data.confirmControl)
              );

              if (x.event?.status == 'Y') {
                this.data.confirmControl = event?.data ? '1' : '0';
                this.form?.formGroup?.patchValue({
                  [event['field']]: event.data,
                });
                this.esService
                  .updateFieldApprovalStepAsync(
                    this.data.recID,
                    fieldName,
                    event.data
                  )
                  .subscribe();

                this.esService.updateCategory(this.data).subscribe((res) => {
                  if (res) {
                    this.oUpdate = res;
                  }
                });
              } else {
                // back data
                this.data.confirmControl = event?.data ? '1' : '0';
                this.data.confirmControl = lastValue == '1' ? true : false;
                this.cr.detectChanges();
              }
            });
          } else {
            this.data[event['field']] = event.data ? '1' : '0';
            this.form?.formGroup?.patchValue({
              [event['field']]: this.data[event['field']],
            });
          }
          break;
        }
        case 'signatureType': {
          if (this.data?.countStep > 0) {
            this.notify.alertCode('ES023').subscribe((x) => {
              //open popup confirm
              let lastValue = JSON.parse(
                JSON.stringify(this.data.signatureType)
              );

              if (x.event?.status == 'Y') {
                this.data[event['field']] = event.data;
                this.form?.formGroup?.patchValue({
                  [event['field']]: event.data,
                });
                this.esService
                  .updateFieldApprovalStepAsync(
                    this.data.recID,
                    fieldName,
                    event.data
                  )
                  .subscribe();

                this.esService.updateCategory(this.data).subscribe((res) => {
                  if (res) {
                    this.oUpdate = res;
                  }
                });
              } else {
                this.data[event['field']] = event.data;
                this.cr.detectChanges();
                this.data.signatureType = lastValue;
                this.cr.detectChanges();
              }
            });
          } else {
            this.data[event['field']] = event.data;
            this.form?.formGroup?.patchValue({ [event['field']]: event.data });
          }
          break;
        }
        
        default: {
          
          this.data[event['field']] = event.data;
          this.form?.formGroup?.patchValue({ [event['field']]: event.data });
          if(this.data?.eSign){
            this.data.editApprovers = true ;
          }
        }
      }
    }
    this.cr.detectChanges();
  }

  beforeSave(option: RequestOption) {
    let itemData = this.data;

    if (this.isAdd && this.isSaved == false) {
      option.methodName = 'AddNewAsync';
    } else {
      if (this.isSaved == false && this.type == 'copy') {
        option.methodName = 'AddNewAsync';
      } else option.methodName = 'EditCategoryAsync';
    }
    option.data = [itemData];
    return true;
  }

  onSaveForm(isClose: boolean) {
    if (this.form?.formGroup.invalid == true) {
      this.esService.notifyInvalid(this.form?.formGroup, this.formModel);
      return;
    }
    if (this.data.eSign && this.viewAutoNumber == '') {
      let headerText = this.grvSetup['AutoNumber']?.headerText ?? 'AutoNumber';
      this.notify.notifyCode('SYS009', 0, '"' + headerText + '"');
      return;
    }

    if (this.dataType != 'auto')
      this.dialog.dataService.dataSelected = this.data;
    if (
      (this.isAdd && this.isSaved == false) ||
      (this.isSaved == false && this.type == 'copy')
    ) {
      this.esService.addNewCategory(this.data).subscribe((res) => {
        if (res) {
          this.isSaved = true;
          if (isClose) {
            this.notify.notifyCode('SYS006');
            if (this.dialog?.dataService)
              (this.dialog?.dataService as CRUDService).add(res).subscribe();
            this.dialog && this.dialog.close(res);
          }
        }
      });
    } else {
      this.esService.updateCategory(this.data).subscribe((res) => {
        if (res) {
          this.isSaved = true;
          if (isClose) {
            this.notify.notifyCode('SYS007');
            this.dialog && this.dialog.close(res);
          }
        }
      });
    }
  }
  getSFTemplate() {
    this.esService
      .getSFTemplate(this.data.categoryID, this.data.category)
      .subscribe((res) => {
        if (res) {
          this.sfTemplates = res;
          this.cr.detectChanges();
        }
      });
  }
  getNewSFModel() {
    this.esService.getTemplateOfCategory(null).subscribe((res) => {
      if (res) {
        this.sfModel = res;
        this.cr.detectChanges();
      }
    });
  }
  openAutoNumPopup() {
    if (
      this.dialog.dataService.keyField != 'CategoryID' &&
      (this.data.categoryID == '' || this.data.categoryID == null)
    ) {
      let headerText = this.grvSetup['CategoryID']?.headerText ?? 'CategoryID';
      this.notify.notifyCode('SYS009', 0, '"' + headerText + '"');
      return;
    }
    if (this.data.autoNumber != this.data.categoryID) {
      //save new autoNumber
      let popupAutoNum = this.cfService.openForm(
        PopupAddAutoNumberComponent,
        '',
        1000,
        (screen.width * 40) / 100,
        '',
        {
          formModel: this.dialog.formModel,
          autoNoCode: this.data?.autoNumber,
          description: this.formModel?.entityName,
          newAutoNoCode: this.data.categoryID ?? this.data.recID,
          isAdd: true,
          isSaveNew: '1',
          //disableAssignRule: true,
          autoAssignRule: this.data?.autoAssignRule,
        },
        '',
        { isFull: true } as any
      );
      popupAutoNum.closed.subscribe((res) => {
        if (res?.event) {
          this.isAddAutoNumber = true;
          this.setViewAutoNumber(res.event);
          this.data.autoNumber = this.data.categoryID ?? this.data.recID;
          this.data.autoAssignRule =
            res?.event?.autoAssignRule != null
              ? res?.event?.autoAssignRule
              : this.data.autoAssignRule;
          this.form.formGroup.patchValue({
            autoNumber: this.data.autoNumber,
            autoAssignRule: this.data.autoAssignRule,
          });
        }
      });
    } else {
      //cap nhật
      let popupAutoNum = this.cfService.openForm(
        PopupAddAutoNumberComponent,
        '',
        1000,
        (screen.width * 40) / 100,
        '',
        {
          formModel: this.dialog.formModel,
          autoNoCode: this.data?.autoNumber,
          isAdd: false,
          description: this.formModel?.entityName,
          //disableAssignRule: true,
          autoAssignRule: this.data?.autoAssignRule,
        }
      );
      popupAutoNum.closed.subscribe((res) => {
        if (res?.event) {
          this.setViewAutoNumber(res.event);
          this.data.autoNumber = this.data.categoryID;
          this.data.autoAssignRule =
            res?.event?.autoAssignRule != null
              ? res?.event?.autoAssignRule
              : this.data.autoAssignRule;
          this.form.formGroup.patchValue({
            autoNumber: this.data.autoNumber,
            autoAssignRule: this.data.autoAssignRule,
          });
        }
      });
    }
  }

  openPopupApproval() {
    if (this.form?.formGroup.invalid == true) {
      this.esService.notifyInvalid(this.form?.formGroup, this.formModel);
      return;
    }
    if (
      this.dataType != 'auto' &&
      this.dialog.dataService?.keyField != 'CategoryID' &&
      (this.data.categoryID == '' || this.data.categoryID == null)
    ) {
      let headerText = this.grvSetup['CategoryID']?.headerText ?? 'CategoryID';
      this.notify.notifyCode('SYS009', 0, '"' + headerText + '"');
      return;
    }
    if (this.data.eSign && this.viewAutoNumber == '') {
      let headerText = this.grvSetup['AutoNumber']?.headerText ?? 'AutoNumber';
      this.notify.notifyCode('SYS009', 0, '"' + headerText + '"');
      return;
    }
    if ((this.isAdd || this.type == 'copy') && !this.isSaved) {
      this.esService.addNewCategory(this.data).subscribe((res) => {
        if (res) {
          //update data
          this.data = res;

          if (this.form.formGroup.value.categoryID == null) {
            this.form.formGroup.patchValue({
              categoryID: this.data.categoryID,
              autoNumber: this.data.autoNumber,
            });
            this.cr.detectChanges();
          }
          if (this.dialog?.dataService)
            (this.dialog?.dataService as CRUDService)
              .add(this.data)
              .subscribe();
          this.isSaved = true;

          //openForm add process
          let transID = this.data.recID;
          let data = {
            type: '0',
            transID: transID,
            model: this.form?.formGroup,
            data: this.data,
            isAddNew: !this.isSaved,
            vllShare: this.vllShare,
          };

          let dialogModel = new DialogModel();
          dialogModel.IsFull = true;

          let popupeStep = this.cfService.openForm(
            CodxApproveStepsComponent,
            '',
            screen.width,
            screen.height,
            '',
            data,
            '',
            dialogModel
          );

          popupeStep.closed.subscribe((res) => {
            if (res.event) {
              this.approvalStep?.initForm();
            }
          });
        }
      });
    } else {
      //openForm add process
      this.esService.updateCategory(this.data).subscribe((res) => {
        if (res) {
          this.data = res;

          let transID = this.data.recID;
          let data = {
            type: '0',
            transID: transID,
            model: this.form?.formGroup,
            data: this.data,
            isAddNew: !this.isSaved,
          };

          let dialogModel = new DialogModel();
          dialogModel.IsFull = true;

          let popupeStep = this.cfService.openForm(
            CodxApproveStepsComponent,
            '',
            screen.width,
            screen.height,
            '',
            data,
            '',
            dialogModel
          );

          popupeStep.closed.subscribe((res) => {
            if (res.event) {
              this.approvalStep?.initForm();
            }
          });
        }
      });
    }
  }
  openPopupAddSFTemplate() {
    if (this.form?.formGroup.invalid == true) {
      this.esService.notifyInvalid(this.form?.formGroup, this.formModel);
      return;
    }
    if (
      this.dataType != 'auto' &&
      this.dialog.dataService?.keyField != 'CategoryID' &&
      (this.data.categoryID == '' || this.data.categoryID == null)
    ) {
      let headerText = this.grvSetup['CategoryID']?.headerText ?? 'CategoryID';
      this.notify.notifyCode('SYS009', 0, '"' + headerText + '"');
      return;
    }
    if (this.data.eSign && this.viewAutoNumber == '') {
      let headerText = this.grvSetup['AutoNumber']?.headerText ?? 'AutoNumber';
      this.notify.notifyCode('SYS009', 0, '"' + headerText + '"');
      return;
    }
    if ((this.isAdd || this.type == 'copy') && !this.isSaved) {
      this.esService.addNewCategory(this.data).subscribe((res) => {
        if (res) {
          //update data
          this.data = res;
          if (this.form.formGroup.value.categoryID == null) {
            this.form.formGroup.patchValue({
              categoryID: this.data.categoryID,
              autoNumber: this.data.autoNumber,
            });
            this.cr.detectChanges();
          }
          if (this.dialog?.dataService)
            (this.dialog?.dataService as CRUDService)
              .add(this.data)
              .subscribe();
          this.isSaved = true;
          this.addSFTemplate();
        }
      });
    } else {
      //openForm add process
      this.esService.updateCategory(this.data).subscribe((res) => {
        if (res) {
          this.data = res;
          this.addSFTemplate();
        }
      });
    }
  }
  addSFTemplate() {
    let option = new SidebarModel();
    option.FormModel = this.signFileFM;
    let sfDialog = new DialogModel();
    sfDialog.IsFull = true;
    let isAdd = true;
    let title = 'Thêm mới';
    let sfData = { ...this.sfModel };
    this.getNewSFModel(); //Lấy model cho lần thêm mới tiếp theo
    sfData.category = this.data.category;
    sfData.categoryID = this.data.categoryID;
    sfData.title = this.data?.categoryName;
    sfData.refType = this.isES ? 'ES_SignFiles' : this.data?.category;
    sfData.owner = this.authService?.userValue?.userID;
    sfData.isTemplate = true;
    sfData.processID = this.data?.recID;
    sfData.approveControl = '3';
    sfData.buid = this.curUser?.buid;
    sfData.createdBy = this.authService?.userValue?.userID;
    sfData.createdOn = new Date();

    this.cr.detectChanges();
    let dialogSF = this.callfunc.openForm(
      PopupAddSignFileComponent,
      title,
      700,
      650,
      this.signFileFM.funcID,
      {
        data: sfData,
        isAddNew: isAdd,
        formModel: this.signFileFM,
        option: option,
        disableCateID: true,
        cateName: this.data?.categoryName,
        showCateNameOnly: true,
        isTemplate: true,
        refType: sfData?.refType,
        templateRefID: this.templateRefID,
        templateRefType: this.templateRefType,
      },
      '',
      sfDialog
    );
    dialogSF.closed.subscribe((res) => {
      this.getSFTemplate();
    });
  }

  closePopup() {
    this.dialog && this.dialog.close();
  }
  templateMF(mfType: string, data: any) {
    if (mfType != null && data != null) {
      switch (mfType) {
        case 'delete':
          this.esService.deleteSignFile(data?.recID).subscribe((res) => {
            if (res) {
              this.sfTemplates = this.sfTemplates.filter(
                (x) => x.recID != data?.recID
              );
              this.notify.notifyCode('SYS008');
              this.cr.detectChanges();
            } else {
              this.notify.notifyCode('SYS022');
              return;
            }
          });
          break;
        case 'edit':
          let option = new SidebarModel();
          option.FormModel = this.signFileFM;
          let sfDialog = new DialogModel();
          sfDialog.IsFull = true;
          let isAdd = false;
          let title = 'Chỉnh sửa';
          let sfData = { ...data };
          this.cr.detectChanges();
          let dialogSF = this.callfunc.openForm(
            PopupAddSignFileComponent,
            title,
            700,
            650,
            this.signFileFM.funcID,
            {
              data: sfData,
              isAddNew: isAdd,
              formModel: this.signFileFM,
              option: option,
              disableCateID: true,
              cateName: this.data?.categoryName,
              showCateNameOnly: true,
              isTemplate: true,
              refType: sfData?.refType,
              templateRefID: this.templateRefID,
              templateRefType: this.templateRefType,
            },
            '',
            sfDialog
          );
          dialogSF.closed.subscribe((res) => {
            this.getSFTemplate();
          });
          break;
      }
    } else {
      this.notify.notifyCode('SYS001');
      return;
    }
  }

  setViewAutoNumber(modelAutoNumber) {
    let vllDateFormat;
    let vllStringFormat;
    this.cache.valueList('L0088').subscribe((vllDFormat) => {
      vllDateFormat = vllDFormat.datas;
      this.cache.valueList('L0089').subscribe((vllSFormat) => {
        vllStringFormat = vllSFormat.datas;
        if (vllStringFormat && vllDateFormat && modelAutoNumber) {
          let dateFormat = '';
          if (modelAutoNumber?.dateFormat != '0') {
            dateFormat =
              vllDateFormat.filter(
                (p) => p.value == modelAutoNumber?.dateFormat
              )[0]?.text ?? '';
          }

          let lengthNumber = 0;
          let strNumber = '';

          switch (modelAutoNumber?.stringFormat) {
            // {value: '0', text: 'Chuỗi & Ngày - Số', default: 'Chuỗi & Ngày - Số', color: null, textColor: null, …}
            case '0': {
              this.viewAutoNumber =
                modelAutoNumber?.fixedString +
                dateFormat +
                modelAutoNumber?.separator;
              lengthNumber =
                modelAutoNumber?.maxLength - this.viewAutoNumber.length;
              strNumber = '#'.repeat(lengthNumber);
              this.viewAutoNumber =
                modelAutoNumber?.fixedString +
                dateFormat +
                modelAutoNumber?.separator +
                strNumber;
              break;
            }
            // {value: '1', text: 'Chuỗi & Số - Ngày', default: 'Chuỗi & Số - Ngày', color: null, textColor: null, …}
            case '1': {
              this.viewAutoNumber =
                modelAutoNumber?.fixedString +
                modelAutoNumber?.separator +
                dateFormat;
              lengthNumber =
                modelAutoNumber?.maxLength - this.viewAutoNumber.length;
              strNumber = '#'.repeat(lengthNumber);
              this.viewAutoNumber =
                modelAutoNumber?.fixedString +
                strNumber +
                modelAutoNumber?.separator +
                dateFormat;
              break;
            }
            // {value: '2', text: 'Số - Chuỗi & Ngày', default: 'Số - Chuỗi & Ngày', color: null, textColor: null, …}
            case '2': {
              this.viewAutoNumber =
                modelAutoNumber?.fixedString +
                modelAutoNumber?.separator +
                dateFormat;
              lengthNumber =
                modelAutoNumber?.maxLength - this.viewAutoNumber.length;
              strNumber = '#'.repeat(lengthNumber);
              this.viewAutoNumber =
                strNumber +
                modelAutoNumber?.separator +
                modelAutoNumber?.fixedString +
                dateFormat;
              break;
            }
            // {value: '3', text: 'Số - Ngày & Chuỗi', default: 'Số - Ngày & Chuỗi', color: null, textColor: null, …}
            case '3': {
              this.viewAutoNumber =
                modelAutoNumber?.fixedString +
                modelAutoNumber?.separator +
                dateFormat;
              lengthNumber =
                modelAutoNumber?.maxLength - this.viewAutoNumber.length;
              strNumber = '#'.repeat(lengthNumber);
              this.viewAutoNumber =
                strNumber +
                modelAutoNumber?.separator +
                dateFormat +
                modelAutoNumber?.fixedString;
              break;
            }
            // {value: '4', text: 'Ngày - Số & Chuỗi', default: 'Ngày - Số & Chuỗi', color: null, textColor: null, …}
            case '4': {
              this.viewAutoNumber =
                modelAutoNumber?.fixedString +
                modelAutoNumber?.separator +
                dateFormat;
              lengthNumber =
                modelAutoNumber?.maxLength - this.viewAutoNumber.length;
              strNumber = '#'.repeat(lengthNumber);
              this.viewAutoNumber =
                dateFormat +
                modelAutoNumber?.separator +
                strNumber +
                modelAutoNumber?.fixedString;
              break;
            }
            // {value: '5', text: 'Ngày & Chuỗi & Số', default: 'Ngày & Chuỗi & Số', color: null, textColor: null, …}
            case '5': {
              this.viewAutoNumber = modelAutoNumber?.fixedString + dateFormat;
              lengthNumber =
                modelAutoNumber?.maxLength - this.viewAutoNumber.length;
              strNumber = '#'.repeat(lengthNumber);
              this.viewAutoNumber =
                dateFormat + modelAutoNumber?.fixedString + strNumber;
              break;
            }
            // {value: '6', text: 'Chuỗi - Ngày', default: 'Chuỗi - Ngày', color: null, textColor: null, …}
            case '6': {
              this.viewAutoNumber =
                modelAutoNumber?.fixedString +
                modelAutoNumber?.separator +
                dateFormat;
              break;
            }
            // {value: '7', text: 'Ngày - Chuỗi', default: 'Ngày - Chuỗi', color: null, textColor: null, …}
            case '7': {
              this.viewAutoNumber =
                dateFormat +
                modelAutoNumber?.separator +
                modelAutoNumber?.fixedString;
              break;
            }
          }
          this.cr.detectChanges();
        }

        // vllStringFormat = vllSFormat.datas;
        // let indexStrF = vllStringFormat.findIndex(
        //   (p) => p.value == modelAutoNumber?.stringFormat
        // );
        // let indexDF = vllDateFormat.findIndex(
        //   (p) => p.value == modelAutoNumber?.dateFormat
        // );
        // let stringFormat = '';
        // let dateFormat = '';
        // if (indexStrF >= 0) {
        //   stringFormat = vllStringFormat[indexStrF].text;
        //   stringFormat = stringFormat.replace(/&/g, '-').replace(/\s/g, '');
        // }

        // // replace chuỗi và dấu phân cách
        // stringFormat = stringFormat
        //   .replace(
        //     /-/g,
        //     modelAutoNumber?.separator == null ? '' : modelAutoNumber?.separator
        //   )
        //   .replace(
        //     'Chuỗi',
        //     modelAutoNumber?.fixedString == null
        //       ? ''
        //       : modelAutoNumber?.fixedString
        //   );

        // //replace ngày
        // if (indexDF >= 0) {
        //   dateFormat =
        //     vllDateFormat[indexDF].text == 'None'
        //       ? ''
        //       : vllDateFormat[indexDF].text;
        // }
        // stringFormat = stringFormat.replace('Ngày', dateFormat);

        // //replace số và set chiều dài
        // let lengthNumber = modelAutoNumber?.maxLength - stringFormat.length + 2;
        // if (lengthNumber < 0) {
        //   stringFormat = stringFormat.replace('Số', '');
        //   stringFormat = stringFormat.substring(0, modelAutoNumber?.maxLength);
        // } else if (lengthNumber == 0) {
        //   stringFormat = stringFormat.replace('Số', '');
        // } else {
        //   let strNumber = '#'.repeat(lengthNumber);
        //   stringFormat = stringFormat.replace('Số', strNumber);
        // }
        // this.viewAutoNumber = stringFormat;
        // this.cr.detectChanges();
      });
    });
  }
}
