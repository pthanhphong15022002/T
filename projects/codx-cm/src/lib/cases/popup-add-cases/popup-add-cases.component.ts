import { Contact } from '../../../../../codx-sm/src/lib/models/Contact.model';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  UIComponent,
  DialogRef,
  FormModel,
  NotificationsService,
  AuthStore,
  DialogData,
  RequestOption,
} from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';
import { CM_Cases, CM_Deals, CM_Permissions } from '../../models/cm_model';
import { tmpInstances } from '../../models/tmpModel';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { ActivatedRoute } from '@angular/router';
import { Observable, firstValueFrom, map, tap } from 'rxjs';
import { CustomFieldService } from 'projects/codx-dp/src/lib/share-crm/codx-input-custom-field/custom-field.service';

@Component({
  selector: 'lib-popup-add-cases',
  templateUrl: './popup-add-cases.component.html',
  styleUrls: ['./popup-add-cases.component.scss'],
})
export class PopupAddCasesComponent
  extends UIComponent
  implements OnInit, AfterViewInit {
  // view child
  @ViewChild('tabGeneralInfoDetail') tabGeneralInfoDetail: TemplateRef<any>;
  @ViewChild('tabCustomFieldDetail') tabCustomFieldDetail: TemplateRef<any>;
  @ViewChild('attachment') attachment: AttachmentComponent;

  // setting values in system
  dialog: DialogRef;
  //type any
  formModel: FormModel;
  addFieldsControl: any = '1';
  placeHolderAutoNumber: any = '';
  // type string
  titleAction: string = '';
  action: string = '';
  autoName: string = '';
  title: string = '';

  // Data struct cases
  cases: CM_Cases = new CM_Cases();

  // array is null
  tabInfo: any[] = [];
  tabContent: any[] = [];
  listCbxProcess: any[] = [];
  listCbxCampaigns: any[] = [];
  listCbxChannels: any[] = [];
  listMemorySteps: any[] = [];
  listMemoryContact: any[] = [];
  listCustomFile: any[] = [];
  listParticipants: any[] = [];
  listOrgs: any[] = [];

  listTypeCases: any[] = [];
  listCbxContacts: any[] = [];
  listFields: any[] = [];

  // const
  readonly actionAdd: string = 'add';
  readonly actionCopy: string = 'copy';
  readonly actionEdit: string = 'edit';
  readonly fieldCbxProcess = { text: 'processName', value: 'recID' };
  readonly fieldCbxCampaigns = { text: 'campaignName', value: 'recID' };
  readonly fieldCbxParticipants = { text: 'userName', value: 'userID' };
  readonly fieldCbxChannels = { text: 'channelName', value: 'recID' };

  readonly fieldCbxContacts = { text: 'contactName', value: 'recID' };
  readonly guidEmpty: string = '00000000-0000-0000-0000-000000000000'; // for save BE
  readonly viewOwnerProcess: string = 'viewOwnerProcess';
  readonly viewOwnerDefault: string = 'viewOwnerDefault';

  // Tab control
  menuGeneralInfo = {
    icon: 'icon-info',
    text: 'Thông tin chung',
    name: 'GeneralInfo',
    subName: 'General information',
    subText: 'General information',
  };

  menuInputInfo = {
    icon: 'icon-reorder',
    text: 'Thông tin nhập liệu',
    name: 'InputInfo',
    subName: 'Input information',
    subText: 'Input information',
  };

  //type any
  gridViewSetup: any;
  listProcess: any;
  owner: any;
  dateMessage: any;
  dateMax: any;
  user: any;
  instanceRes: any;

  contactID: string = '';
  oldIdInstance: string = '';

  // model of DP
  instance: tmpInstances = new tmpInstances();
  instanceSteps: any;
  listInstanceSteps: any[] = [];
  caseType: string = '';
  applyFor: string = '';
  disabledShowInput: boolean = true;
  isExist: boolean = false;
  isHaveFile: boolean;
  showLabelAttachment: boolean;
  formModelCrr: FormModel = new FormModel();

  // load data form DP
  isLoading: boolean = false;
  processID: string = '';
  applyProcess = false;
  isBlock: boolean = true;
  isShowField: boolean = false;
  isTurnOnProcess: boolean = true;
  caseNoSetting: any;
  idxCrr: any = -1;
  //CF
  arrCaculateField: any[] = [];
  isLoadedCF = false;
  customerCategory: any;
  instanceReason: any;
  recIdMove: any;
  isShowReasonDP: boolean = false;
  isViewAll: boolean = false;
  conRef: any[] = []
  isHaveApplyDep = false;

  constructor(
    private inject: Injector,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private codxCmService: CodxCmService,
    private customFieldSV: CustomFieldService,
    private authStore: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.dialog = dialog;
    this.formModel = dialog.formModel;
    this.titleAction = dt?.data?.titleAction;
    this.action = dt?.data?.action;
    this.applyFor = dt?.data?.applyFor;
    // this.caseType = dt?.data?.caseType;
    this.gridViewSetup = dt?.data?.gridViewSetup;
    this.isLoading = dt?.data?.isLoad;
    this.processID = dt?.data?.processID;
    this.funcID = dt?.data?.funcID;
    this.cases.status = '1';

    if (this.isLoading) {
      this.formModel = dt?.data?.formMD;
      if (this.action != this.actionAdd) {
        this.cases = dt?.data?.dataCM;
        //       this.owner = this.deal.owner;
        this.customerCategory = dt?.data?.dataCM?.customerCategory;
      }
      this.instanceReason = dt?.data?.instanceReason;
      if (this.instanceReason) {
        this.cases.caseName = this.instanceReason?.title;
        this.cases.owner = this.instanceReason?.ownerMove;
        this.owner = this.instanceReason?.ownerMove;
        this.recIdMove = this.instanceReason?.recID;
        this.isShowReasonDP = true;
      }
    } else {
      this.cases =
        this.action !== this.actionAdd
          ? JSON.parse(JSON.stringify(dialog.dataService?.dataSelected))
          : this.cases;
      this.customerCategory = dt?.data?.customerCategory;
    }

    if (this.action !== this.actionAdd) {
      this.applyProcess = this.cases.applyProcess;
      this.processID = this.cases.processID;
      this.getListContacts(this.cases?.customerID);
    } else {
      this.cases.caseType = this.funcID == 'CM0401' ? '1' : '2';
    }
    if (dt?.data.processID) {
      this.cases.processID = this.processID;
      this.isViewAll = true;
    }
    if (this.action === this.actionCopy) {
      this.cases.owner = null;
      // this.cases.salespersonID = null;
      this.oldIdInstance = this.cases.refID;
    }
    // this.executeApiCalls();
  }

  async onInit(): Promise<void> {
    // this.action != this.actionEdit && !this.isLoading && (await this.getCurrentSetting());
    // this.tabInfo = this.applyProcess
    //   ? [this.menuGeneralInfo, this.menuInputInfo]
    //   : [this.menuGeneralInfo];
  }
  ngAfterViewInit(): void {
    this.executeApiCalls();
    this.tabInfo = [this.menuGeneralInfo];
    this.tabContent = [this.tabGeneralInfoDetail];
    // this.tabInfo = this.applyProcess ? [this.menuGeneralInfo, this.menuInputInfo] : [this.menuGeneralInfo];
    // this.tabContent = [this.tabGeneralInfoDetail, this.tabCustomFieldDetail];
  }
  valueChange($event) {
    if ($event) {
      this.cases[$event.field] = $event.data;
    }
  }
  valueChangeDate($event) {
    if ($event) {
      this.cases[$event.field] = $event.data.fromDate;
    }
  }
  saveCases() {
    if (!this.isBlock) return;
    if (!this.cases?.processID && this.applyProcess) {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['ProcessID']?.headerText + '"'
      );
      return;
    }
    if (!this.cases?.caseName?.trim()) {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['CaseName']?.headerText + '"'
      );
      return;
    }
    if (!this.cases?.customerID) {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['CustomerID']?.headerText + '"'
      );
      return;
    }
    if (this.checkEndDayInstance(this.cases?.endDate, this.dateMax)) {
      this.notificationsService.notifyCode(
        'DP032',
        0,
        '"' + this.gridViewSetup['EndDate']?.headerText + '"',
        '"' + this.dateMessage + '"'
      );
      return;
    }
    var ischeck = true;
    var ischeckFormat = true;
    var title = '';
    var messageCheckFormat = '';

    for (let items of this.listInstanceSteps) {
      for (let item of items.fields) {
        if (item) {
          messageCheckFormat = this.checkFormat(item);
          if (messageCheckFormat) {
            ischeckFormat = false;
            break;
          }
        }
      }
      if (!ischeck || !ischeckFormat) {
        break;
      }
    }
    if (!ischeck) {
      this.notificationsService.notifyCode('SYS009', 0, '"' + title + '"');
      return;
    }
    if (!ischeckFormat) {
      this.notificationsService.notifyCode(messageCheckFormat);
      return;
    }
    this.cases.owner = this.owner;
    if (this.applyProcess) {
      this.updateDataCases(this.instance, this.cases);
      this.convertDataInstance(this.cases, this.instance);
    }
    // if (this.action !== this.actionEdit) {
    //   this.insertInstance();
    // } else {
    //   this.editInstance();
    // }
    // //Kieerm tra dk ref cua truong tuy chinh
    // if (this.conRef?.length > 0) {
    //   this.conRef.forEach(x => {
    //     this.notificationsService.notify(x.messageText, x.messageType)
    //   })
    //   return
    // }
    if (!this.conditionRefValidate()) return;
    this.actionSaveBeforeSaveAttachment();
  }


  async actionSaveBeforeSaveAttachment() {
    if (this.attachment?.fileUploadList?.length > 0) {
      (await this.attachment.saveFilesObservable()).subscribe((res) => {
        if (res) {
          var countAttack = 0;
          countAttack = Array.isArray(res) ? res.length : 1;
          this.executeSaveData();
        }
      });
    } else {
      this.executeSaveData();
    }
  }
  cbxChange($event, field) {
    if ($event) {
      this.cases[field] = $event;
    }
  }
  cbxProcessChange($event) {
    if ($event) {
      this.cases[$event.field] = $event.data;
      if ($event.data) {
        this.action =
          this.action === this.actionCopy ? this.actionAdd : this.action;
        this.listInstanceSteps = [];
        this.listParticipants = [];
        this.owner = null;
        this.cases.permissions =
          this.cases?.permissions && this.cases?.permissions?.length > 0
            ? this.cases?.permissions.filter(
              (x) => x.roleType != 'O' && x.objectType != '1'
            )
            : this.cases?.permissions;
        let result = this.checkProcessInList($event.data);
        if (result) {
          this.listInstanceSteps = result?.steps;
          this.listParticipants = JSON.parse(
            JSON.stringify(result?.permissions)
          );
          this.setAutoNameTabFields(result?.autoNameTabFields);
          this.cases.caseNo = result?.caseNo;
          this.cases.endDate = this.HandleEndDate(
            this.listInstanceSteps,
            this.action,
            null
          );
          this.getSettingFields(result?.processSetting, this.listInstanceSteps);
          this.changeDetectorRef.detectChanges();
        } else {
          this.getListInstanceSteps($event.data);
        }
      }
    }
  }
  valueChangeCustom(event) {
    //bo event.e vì nhan dc gia trị null
    if (event && event.data) {
      let result = event.e;
      let field = event.data;
      let dependences = event?.dependences; //tham chieu dependece cua cbx

      var index = this.listInstanceSteps.findIndex(
        (x) => x.recID == field.stepID
      );
      if (index != -1) {
        if (this.listInstanceSteps[index].fields?.length > 0) {
          let idxField = this.listInstanceSteps[index].fields.findIndex(
            (x) => x.recID == event.data.recID
          );
          if (idxField != -1) {
            let valueOld =
              this.listInstanceSteps[index].fields[idxField].dataValue;
            this.listInstanceSteps[index].fields[idxField].dataValue = result;
            // //Tham chieu rang buoc
            // let crrField = this.listInstanceSteps[index].fields[idxField];
            // if (crrField.isApplyConditional && crrField?.conditionReference?.length > 0) {
            //   let check = this.customFieldSV.checkConditionalRef(this.listInstanceSteps[index].fields, crrField)
            //   this.conRef = this.conRef.filter(f => f?.id != crrField.recID);
            //   if (!check?.check && check.conditionRef?.length > 0) {
            //     let arrRef = check.conditionRef.map(x => {
            //       let obj = { ...x, id: crrField.recID }
            //       return obj
            //     })
            //     this.conRef = this.conRef.concat(arrRef)
            //   }
            // }

            this.isHaveApplyDep = this.listInstanceSteps[index].fields.some(x => x.isApplyDependences)
            if (this.isHaveApplyDep && dependences?.length > 0) this.listInstanceSteps[index].fields = this.changeRefData(dependences, this.listInstanceSteps[index].fields)
            let idxEdit = this.listCustomFile.findIndex(
              (x) =>
                x.recID == this.listInstanceSteps[index].fields[idxField].recID
            );
            if (idxEdit != -1) {
              this.listCustomFile[idxEdit] =
                this.listInstanceSteps[index].fields[idxField];
            } else
              this.listCustomFile.push(
                this.listInstanceSteps[index].fields[idxField]
              );
            if (field.dataType == 'N' && valueOld != result)
              this.caculateField();
          }
        }
      }
    }
  }
  async valueChangeOwner($event, view) {
    if (view === this.viewOwnerDefault) {
      if ($event?.data && $event?.data !== '') {
        let ownerName = '';
        this.owner = $event?.data;
        ownerName = $event?.component?.itemsSelected[0]?.UserName;
        this.searchOwner('1', 'O', '0', this.owner, ownerName);
      } else if ($event === null || $event === '' || $event === '') {
        this.deleteOwner('1', 'O', '0', this.cases.owner, 'owner');
      }
    } else if (view === this.viewOwnerProcess) {
      if ($event) {
        this.owner = $event;
        let ownerName = '';
        if (this.listParticipants.length > 0 && this.listParticipants) {
          ownerName = this.listParticipants.filter(
            (x) => x.userID === this.owner
          )[0].userName;
        }
        this.searchOwner('1', 'O', '0', this.owner, ownerName);
      } else if ($event === null || $event === '') {
        this.deleteOwner('1', 'O', '0', this.cases.owner, 'owner');
      }
    }
  }
  searchOwner(
    objectType: any,
    roleType: any,
    memberType: any,
    owner: any,
    ownerName: any
  ) {
    let index = -1;
    if (this.cases?.permissions?.length > 0 && this.cases?.permissions) {
      index = this.cases?.permissions.findIndex(
        (x) =>
          x.objectType == objectType &&
          x.roleType === roleType &&
          x.memberType == memberType
      );
      if (index != -1) {
        this.cases.permissions[index].objectID = owner;
        this.cases.permissions[index].objectName = ownerName;
        if (this.action == this.actionEdit) {
          this.cases.permissions[index].modifiedBy = this.user.userID;
          this.cases.permissions[index].modifiedOn = new Date();
        }
      }
    }
    if (index == -1) {
      if (owner) {
        this.addOwner(owner, ownerName, roleType, objectType);
      }
    }
  }
  addOwner(owner, ownerName, roleType, objectType) {
    let permission = new CM_Permissions();
    permission.objectID = owner;
    permission.objectName = ownerName;
    permission.objectType = objectType;
    permission.roleType = roleType;
    permission.memberType = '0';
    permission.full = true;
    permission.read = true;
    permission.update = true;
    permission.upload = true;
    permission.download = true;
    permission.allowUpdateStatus = '1';
    permission.full = roleType === 'O';
    permission.assign = roleType === 'O';
    permission.delete = roleType === 'O';
    permission.allowPermit = roleType === 'O';
    permission.isActive = true;
    this.cases.permissions = this.cases?.permissions
      ? this.cases.permissions
      : [];
    this.cases.permissions.push(permission);
  }
  deleteOwner(
    objectType: any,
    roleType: any,
    memberType: any,
    owner: any,
    field: any
  ) {
    let index = this.cases?.permissions.findIndex(
      (x) =>
        x.objectType == objectType &&
        x.roleType === roleType &&
        x.memberType == memberType &&
        x.objectID === owner
    );
    if (index != -1) {
      if (field === 'owner') {
        this.cases.owner = null;
        this.owner = null;
      }
      this.cases.permissions.splice(index, 1);
    }
  }
  valueChangeCustomer($event) {
    if ($event) {
      let result = this.checkContactInList($event.data);
      this.cases.customerName =
        $event.component?.itemsSelected[0]?.CustomerName;
      this.cases.shortName = $event.component?.itemsSelected[0]?.ShortName;
      this.cases.customerCategory =
        $event.component?.itemsSelected[0]?.Category;
      if (result) {
        this.listCbxContacts = result?.contacts;
        this.changeDetectorRef.detectChanges();
      } else {
        this.getListContacts($event.data);
      }
    }
  }
  onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe(async (res) => {
        if (res) {
          this.attachment?.clearData();
          this.dialog.close(res.save);
        } else this.dialog.close();
      });
  }
  onEdit() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        if (res.update) {
          this.dialog.close(res.update);
        }
      });
  }
  onAddInstance() {
    if (this.isShowReasonDP) {
      let data = [this.instance, this.listInstanceSteps, this.oldIdInstance];
      this.codxCmService.addInstance(data).subscribe((instance) => {
        if (instance) {
          this.instanceRes = instance;
          this.cases.status = instance.status;
          this.cases.datas = instance.datas;
          this.addPermission(instance?.permissions);
          let datas = [this.cases];
          this.codxCmService.addCases(datas).subscribe((cases) => {
            if (cases) {
            }
          });
          if (this.recIdMove) {
            this.codxCmService
              .updateMoveProcess([this.recIdMove, this.cases?.processID])
              .subscribe((res) => {
                if (res) {
                }
              });
          }

          this.dialog.close();
        }
      });
    } else {
      this.dialog.dataService
        .save((option: any) => this.beforeSaveInstance(option))
        .subscribe((res) => {
          if (res && res.save) {
            this.cases.status = res.save.status;
            this.cases.datas = res.save.datas;
            this.addPermission(res.save.permissions);
            this.codxCmService.addCases(this.cases).subscribe((res) => {
              if (res) {
              }
            });
            this.dialog.close(res.save);
            this.changeDetectorRef.detectChanges();
          }
        });
    }
  }
  onUpdateInstance() {
    this.dialog.dataService
      .save((option: any) => this.beforeSaveInstance(option))
      .subscribe((res) => {
        if (res.update) {
          this.cases.status = res.update?.status;
          this.cases.datas = res.update?.datas;
          this.codxCmService.editCases(this.cases).subscribe((res) => {
            if (res) {
            }
          });
          this.dialog.close(res.update);
        }
      });
  }
  beforeSave(option: RequestOption) {
    var data = this.cases;
    option.methodName =
      this.action !== this.actionEdit ? 'AddCasesAsync' : 'EditCasesAsync';
    option.className = 'CasesBusiness';
    option.data = data;
    option.service = 'CM';
    return true;
  }
  beforeSaveInstance(option: RequestOption) {
    option.service = 'DP';
    option.className = 'InstancesBusiness';
    option.assemblyName = 'ERM.Business.DP';
    if (this.action === 'add' || this.action === 'copy') {
      option.methodName = 'AddInstanceAsync';
      option.data = [this.instance, this.listInstanceSteps, this.oldIdInstance];
    } else if (this.action === 'edit') {
      option.methodName = 'EditInstanceAsync';
      option.data = [this.instance, this.listCustomFile];
    }
    return true;
  }

  async executeApiCalls() {
    this.isLoading && (await this.getGridView(this.formModel));
    if (this.action == this.actionAdd && !this.isLoading) {
      // this.itemTabs(false);

      let res = await firstValueFrom(
        this.codxCmService.getParam('CMParameters', '1')
      );
      if (res?.dataValue) {
        let dataValue = JSON.parse(res?.dataValue);
        this.applyProcess =
          this.caseType == '1'
            ? dataValue?.ProcessCase == '1'
            : dataValue?.ProcessRequest == '1';
      }
      this.cases.applyProcess = this.applyProcess;
      this.checkApplyProcess(this.cases.applyProcess);
    }
    if (this.isViewAll && this.processID && this.action === this.actionAdd) {
      this.applyProcess = true;
      this.cases.applyProcess = this.applyProcess;
      await this.getListInstanceSteps(this.processID);
    }

    if (this.action !== this.actionAdd) {
      this.applyProcess &&
        (await this.getListInstanceSteps(this.cases?.processID));
      !this.applyProcess && (await this.getAutoNumber());
    }
  }

  async executeSaveData() {
    if (this.cases.applyProcess) {
      if (this.action !== this.actionEdit) {
        await this.insertInstance();
      } else {
        await this.editInstance();
      }
    } else {
      if (this.action !== this.actionEdit) {
        await this.onAdd();
      } else {
        await this.onEdit();
      }
    }
  }

  async getGridView(formModel) {
    this.cache
      .gridViewSetup(formModel.formName, formModel.gridViewName)
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
  }

  async getListInstanceSteps(processId: any) {
    let data = [processId, this.cases?.refID, this.action, this.caseType];
    this.codxCmService.getInstanceSteps(data).subscribe(async (res) => {
      if (res && res.length > 0) {
        let obj = {
          id: processId,
          steps: res[0],
          permissions: res[1],
          caseNo: this.action !== this.actionEdit ? res[2] : this.cases.caseNo,
          processSetting: res[3],
        };
        let isExist = this.listMemorySteps.some((x) => x.id === processId);
        if (!isExist) {
          this.listMemorySteps.push(obj);
        }
        this.listInstanceSteps = res[0];
        this.getArrCaculateField();
        this.getSettingFields(res[3], this.listInstanceSteps);
        this.listParticipants = [];
        this.listParticipants = JSON.parse(JSON.stringify(obj?.permissions));
        if (this.action === this.actionEdit) {
          this.owner = this.cases.owner;
        } else {
          if (
            this.listParticipants?.length > 0 &&
            this.listParticipants &&
            !this.owner
          ) {
            let index = this.listParticipants?.findIndex(
              (x) => x.userID === this.user.userID
            );
            this.owner = index != -1 ? this.user.userID : null;
          }
          this.cases.caseNo = res[2];
        }
        this.dateMax = this.HandleEndDate(
          this.listInstanceSteps,
          this.action,
          this.action !== this.actionEdit ||
            (this.action === this.actionEdit &&
              (this.cases.status == '1' || this.cases.status == '15'))
            ? null
            : this.cases.createdOn
        );
        this.cases.endDate =
          this.action === this.actionEdit ? this.cases?.endDate : this.dateMax;
        this.changeDetectorRef.detectChanges();
      }
    });
  }
  getSettingFields(processSetting, listInstanceSteps) {
    this.isShowField = processSetting?.addFieldsControl == '1';
    this.setAutoNameTabFields(processSetting?.autoNameTabFields);
    this.itemTabsInput(this.ischeckFields(listInstanceSteps));
  }
  itemTabsInput(check: boolean): void {
    let menuInput = this.tabInfo.findIndex(
      (item) => item?.name === this.menuInputInfo?.name //Phúc gắn thêm name để nó lấy chính xác hơn.
    );
    let tabInput = this.tabContent.findIndex(
      (item) => item === this.tabCustomFieldDetail
    );
    if (this.isShowField) {
      if (check && menuInput == -1 && tabInput == -1) {
        this.tabInfo.splice(1, 0, this.menuInputInfo);
        this.tabContent.splice(1, 0, this.tabCustomFieldDetail);
      } else if (!check && menuInput != -1 && tabInput != -1) {
        this.tabInfo.splice(menuInput, 1);
        this.tabContent.splice(tabInput, 1);
      }
    } else {
      if (menuInput != -1 && tabInput != -1) {
        this.tabInfo.splice(menuInput, 1);
        this.tabContent.splice(tabInput, 1);
      }
    }
  }

  //get autoname tab fields
  setAutoNameTabFields(autoNameTabFields) {
    autoNameTabFields = autoNameTabFields;
    if (this.menuInputInfo) {
      this.menuInputInfo.text =
        autoNameTabFields && autoNameTabFields.trim() != ''
          ? autoNameTabFields
          : 'Thông tin nhập liệu';
      this.menuInputInfo.subName =
        autoNameTabFields && autoNameTabFields.trim() != ''
          ? autoNameTabFields
          : 'Input information';
      this.menuInputInfo.subText =
        autoNameTabFields && autoNameTabFields.trim() != ''
          ? autoNameTabFields
          : 'Input information';
      const menuInput = this.tabInfo.findIndex(
        (item) => item?.name === this.menuInputInfo?.name
      );
      if (menuInput != -1) {
        this.tabInfo[menuInput] = JSON.parse(
          JSON.stringify(this.menuInputInfo)
        );
      }
    }
    this.detectorRef.detectChanges();
  }
  //end

  async getListContacts(customerID: any) {
    customerID =
      this.action === this.actionCopy ? this.cases.customerID : customerID;
    var data = [customerID];
    this.codxCmService.getListContactByCustomerID(data).subscribe((res) => {
      if (res && res.length > 0) {
        var obj = {
          id: customerID,
          contacts: res[0],
        };
        var isExist = this.listMemoryContact.some((x) => x.id === customerID);
        if (!isExist) {
          this.listMemoryContact.push(obj);
        }
        this.listCbxContacts = res[0];
        if (this.action != this.actionAdd) {
          this.contactID = this.cases.contactID;
        }
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  insertInstance() {
    if (!this.isLoading) {
      let data = [this.instance, this.listInstanceSteps, this.oldIdInstance];
      this.codxCmService.addInstance(data).subscribe((instance) => {
        if (instance) {
          this.instanceRes = instance;
          this.cases.status = instance.status;
          this.cases.datas = instance.datas;
          this.addPermission(instance.permissions);
          this.onAdd();
        }
      });
    } else {
      this.onAddInstance();
    }
  }
  async editInstance() {
    if (!this.isLoading) {
      let data = [this.instance, this.listCustomFile];
      this.codxCmService.editInstance(data).subscribe((instance) => {
        if (instance) {
          this.instanceRes = instance;
          this.cases.status = instance.status;
          this.cases.datas = instance.datas;
          this.cases.permissions = this.cases?.permissions?.filter(
            (x) => x.memberType != '2'
          );
          this.addPermission(instance.permissions);
          this.onEdit();
        }
      });
    } else {
      this.onUpdateInstance();
    }
  }
  addPermission(permissionDP) {
    if (permissionDP && permissionDP?.length > 0) {
      this.cases.permissions = this.cases?.permissions
        ? this.cases.permissions
        : [];
      for (let item of permissionDP) {
        this.cases.permissions.push(this.copyPermission(item));
      }
    }
  }
  copyPermission(permissionDP: any) {
    let permission = new CM_Permissions();
    permission.objectID = permissionDP.objectID;
    permission.objectName = permissionDP.objectName;
    permission.objectType = permissionDP.objectType;
    permission.roleType = permissionDP.roleType;
    // permission.full =  permissionDP.full;
    permission.read = permissionDP.read;
    permission.update = permissionDP.update;
    permission.assign = permissionDP.assign;
    permission.delete = permissionDP.delete;
    permission.upload = permissionDP.upload;
    permission.download = permissionDP.download;
    permission.isActive = true;
    permission.create = permissionDP.create;
    permission.memberType = '2'; // Data from DP
    permission.allowPermit = permissionDP.allowPermit;
    permission.allowUpdateStatus = permissionDP.allowUpdateStatus;
    permission.createdOn = new Date();
    permission.createdBy = this.user.userID;
    return permission;
  }

  // check valid
  checkProcessInList(processId) {
    var result = this.listMemorySteps.filter((x) => x.id === processId)[0];
    if (result) {
      return result;
    }
    return null;
  }
  checkContactInList(customerID) {
    var result = this.listMemoryContact.filter((x) => x.id === customerID)[0];
    if (result) {
      return result;
    }
    return null;
  }

  // covnert data CM -> data DP

  convertDataInstance(cases: CM_Cases, instance: tmpInstances) {
    if (this.action === this.actionEdit) {
      instance.recID = cases.refID;
    }
    if (this.action !== this.actionEdit) {
      instance.startDate = null;
      instance.status = '1';
    }
    instance.title = cases?.caseName?.trim();
    instance.memo = cases?.memo?.trim();
    instance.endDate = cases.endDate;
    instance.instanceNo = cases.caseNo;
    instance.owner = this.owner;
    instance.processID = cases.processID;
    instance.stepID = cases.stepID;
  }
  updateDataCases(instance: tmpInstances, cases: CM_Cases) {
    if (this.action !== this.actionEdit) {
      cases.stepID = this.listInstanceSteps[0].stepID;
      cases.nextStep = this.listInstanceSteps[1].stepID;
      cases.status = '1';
      cases.refID = instance.recID;
      cases.startDate = null;
    }
    if (this.action === this.actionAdd) {
      cases.caseType = this.funcID == 'CM0401' ? '1' : '2';
    }
    cases.owner = this.owner;
    //  cases.salespersonID = this.owner;
  }
  checkFormat(field) {
    if (field.dataType == 'T') {
      if (field.dataFormat == 'E') {
        var validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (
          !field?.dataValue?.toLowerCase().match(validEmail) &&
          field?.dataValue
        ) {
          return 'SYS037';
        }
      }
      if (field.dataFormat == 'P') {
        var validPhone = /(((09|03|07|08|05)+([0-9]{8})|(01+([0-9]{9})))\b)/;
        if (
          !field?.dataValue?.toLowerCase().match(validPhone) &&
          field?.dataValue
        ) {
          return 'RS030';
        }
      }
    }
    return '';
  }

  HandleEndDate(listSteps: any, action: string, endDateValue: any) {
    var dateNow =
      action == 'add' || action == 'copy' ? new Date() : new Date(endDateValue);
    var endDate =
      action == 'add' || action == 'copy' ? new Date() : new Date(endDateValue);
    for (let i = 0; i < listSteps.length; i++) {
      if (!listSteps[i].isSuccessStep && !listSteps[i].isFailStep) {
        endDate.setDate(endDate.getDate() + listSteps[i].durationDay);
        endDate.setHours(endDate.getHours() + listSteps[i].durationHour);
        endDate = this.setTimeHoliday(
          dateNow,
          endDate,
          listSteps[i]?.excludeDayoff
        );
        dateNow = endDate;
      }
    }
    return endDate;
  }
  setTimeHoliday(startDay: Date, endDay: Date, dayOff: string) {
    if (!dayOff || (dayOff && (dayOff.includes('7') || dayOff.includes('8')))) {
      const isSaturday = dayOff.includes('7');
      const isSunday = dayOff.includes('8');
      let day = 0;
      for (
        let currentDate = new Date(startDay);
        currentDate <= endDay;
        currentDate.setDate(currentDate.getDate() + 1)
      ) {
        day += currentDate.getDay() === 6 && isSaturday ? 1 : 0;
        day += currentDate.getDay() === 0 && isSunday ? 1 : 0;
      }
      let isEndSaturday = endDay.getDay() === 6;
      endDay.setDate(endDay.getDate() + day);

      if (endDay.getDay() === 6 && isSaturday) {
        endDay.setDate(endDay.getDate() + 1);
      }

      if (endDay.getDay() === 0 && isSunday) {
        if (!isEndSaturday) {
          endDay.setDate(endDay.getDate() + (isSaturday ? 1 : 0));
        }
        endDay.setDate(endDay.getDate() + (isSunday ? 1 : 0));
      }
    }
    return endDay;
  }

  // async getListPermission(permissions) {
  //   this.listParticipants = permissions;
  //   return this.listParticipants != null && this.listParticipants.length > 0
  //     ? await this.codxCmService.getListUserByOrg(this.listParticipants)
  //     : this.listParticipants;
  // }

  // //#region  check RequiredDeal
  checkEndDayInstance(endDate, endDateCondition) {
    var date1 = new Date(endDate);
    var date2 = new Date(endDateCondition);
    this.dateMessage = new Date(date2).toLocaleDateString('en-AU');
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);

    return date1 < date2;
  }

  addFile(e) {
    this.attachment.uploadFile();
  }
  fileAdded(e) { }
  getfileCount(e) {
    if (e > 0 || e?.data?.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
    this.showLabelAttachment = this.isHaveFile;
  }

  // onSave(){

  // }

  // async actionSaveBeforeSaveAttachment() {
  //   if (this.attachment?.fileUploadList?.length > 0) {
  //     (await this.attachment.saveFilesObservable()).subscribe((res) => {
  //       if (res) {
  //         var countAttack = 0;
  //         countAttack = Array.isArray(res) ? res.length : 1;
  //         this.cases.attachments =
  //           this.action === this.actionEdit
  //             ? this.cases.attachments + countAttack
  //             : countAttack;
  //    //     this.selectedAction();
  //       }
  //     });
  //   } else {
  //   //  this.selectedAction();
  //   }
  // }

  //#region setDefault
  async getCurrentSetting() {
    let res = await firstValueFrom(
      this.codxCmService.getParam('CMParameters', '1')
    );
    if (res?.dataValue && this.action === this.actionAdd) {
      let dataValue = JSON.parse(res?.dataValue);
      this.applyProcess =
        this.funcID == 'CM0401'
          ? dataValue?.ProcessCase == '1'
          : dataValue?.ProcessRequest == '1';
      this.cases.applyProcess = this.applyProcess;
    }
  }

  checkApplyProcess(check: boolean) {
    if (check) {
      this.disabledShowInput = true;
    } else {
      this.getAutoNumber();
    }

    this.cases.applyProcess = check;
  }

  async getAutoNumber() {
    // kiểm tra có thiết lập tư động ko
    this.codxCmService
      .getFieldAutoNoDefault(
        this.dialog.formModel.funcID,
        this.dialog.formModel.entityName
      )
      .subscribe((res) => {
        if (res && !res.stop) {
          this.cache.message('AD019').subscribe((mes) => {
            if (mes) {
              this.placeHolderAutoNumber = mes?.customName || mes?.description;
            }
          });
          !this.caseNoSetting && this.getAutoNumberSetting();
          this.cases.caseNo = this.caseNoSetting;
          this.disabledShowInput = true;
        } else {
          this.placeHolderAutoNumber = '';
          this.cases.caseNo = null;
          this.disabledShowInput = false;
        }
      });
  }
  async getAutoNumberSetting() {
    // lấy mã tự động
    this.codxCmService
      .genAutoNumberDefault(
        this.dialog.formModel.funcID,
        this.dialog.formModel.entityName,
        'LeadID'
      )
      .subscribe((autoNum) => {
        this.caseNoSetting = autoNum;
        this.cases.caseNo = this.caseNoSetting;
      });
  }

  changeAutoNum(e) {
    if (!this.disabledShowInput && e) {
      this.cases.caseNo = e?.crrValue;
      if (this.cases.caseNo && this.cases.caseNo.includes(' ')) {
        this.notificationsService.notifyCode(
          'CM026',
          0,
          '"' + this.gridViewSetup['CaseNo'].headerText + '"'
        );
        return;
      } else if (this.cases.caseNo) {
        if (this.isExistCaseNo(this.cases.caseNo)) {
          return;
        }
      }
    }
  }
  async isExistCaseNo(caseNo) {
    this.codxCmService.isExistCaseNo([caseNo]).subscribe((res) => {
      if (res) {
        this.notificationsService.notifyCode(
          'CM003',
          0,
          '"' + this.gridViewSetup['CaseNo'].headerText + '"'
        );
        this.isExist = res;
      }
      this.isExist = res;
    });
  }
  //#endregion

  // --------------------------lOad Tabs ----------------------- //
  // itemTabs(check: boolean): void {
  //   if (check) {
  //     this.tabInfo = [this.menuGeneralInfo, this.menuInputInfo];
  //     this.tabContent = [this.tabGeneralInfoDetail, this.tabCustomFieldDetail];
  //   } else {
  //     this.tabInfo = [this.menuGeneralInfo];
  //     this.tabContent = [this.tabGeneralInfoDetail];
  //   }
  // }
  ischeckFields(liststeps: any): boolean {
    this.listFields = [];
    if (this.action !== 'edit') {
      let stepCurrent = liststeps[0];
      if (stepCurrent && stepCurrent.fields?.length > 0) {
        let filteredTasks = stepCurrent.tasks
          .filter(
            (task) => task?.fieldID !== null && task?.fieldID?.trim() !== ''
          )
          .map((task) => task.fieldID)
          .flatMap((item) => item.split(';').filter((item) => item !== ''));
        let listFields = stepCurrent.fields.filter(
          (field) =>
            !filteredTasks.includes(
              this.action === 'copy' ? field?.recID : field?.refID
            )
        );
        this.listFields = [...this.listFields, ...listFields];
      }
    } else {
      let idxCrr = liststeps.findIndex((x) => x.stepID == this.cases?.stepID);
      if (idxCrr != -1) {
        for (let i = 0; i <= idxCrr; i++) {
          let stepCurrent = liststeps[i];
          if (stepCurrent && stepCurrent.fields?.length > 0) {
            let filteredTasks = stepCurrent?.tasks
              .filter(
                (task) => task?.fieldID !== null && task?.fieldID?.trim() !== ''
              )
              .map((task) => task?.fieldID)
              .flatMap((item) => item.split(';').filter((item) => item !== ''));
            let listFields = stepCurrent?.fields.filter(
              (field) => !filteredTasks.includes(field?.recID)
            );
            this.listFields = [...this.listFields, ...listFields];
          }
        }
      }
    }
    return this.listFields != null && this.listFields?.length > 0;
  }

  checkAddField(stepCrr, idx) {
    if (stepCrr) {
      if (this.action == 'edit' && this.idxCrr != -1 && this.idxCrr >= idx) {
        return true;
      }
      if (idx == 0) return true;
      return false;
    }
    return false;
  }
  addFileCompleted(e) {
    this.isBlock = e;
  }
  //----------------------------end---------------------------//

  //----------------------CACULATE---------------------------//

  getArrCaculateField() {
    this.arrCaculateField = [];
    this.listInstanceSteps.forEach((x) => {
      if (x.fields?.length > 0) {
        let fnum = x.fields.filter((x) => x.dataType == 'CF');
        if (fnum?.length > 0)
          this.arrCaculateField = this.arrCaculateField.concat(fnum);
      }
    });
    if (this.arrCaculateField?.length > 0)
      this.arrCaculateField.sort((a, b) => {
        if (a.dataFormat.includes('[' + b.fieldName + ']')) return 1;
        else if (b.dataFormat.includes('[' + a.fieldName + ']')) return -1;
        else return 0;
      });
    this.isLoadedCF = true;
  }
  //tính toán
  caculateField() {
    if (!this.isLoadedCF) this.getArrCaculateField();
    if (!this.arrCaculateField || this.arrCaculateField?.length == 0) return;
    let fieldsNum = [];
    this.listInstanceSteps.forEach((x) => {
      if (x.fields?.length > 0) {
        let fnum = x.fields.filter((x) => x.dataType == 'N');
        if (fnum?.length > 0) fieldsNum = fieldsNum.concat(fnum);
      }
    });
    if (!fieldsNum || fieldsNum?.length == 0) return;

    this.arrCaculateField.forEach((obj) => {
      let dataFormat = obj.dataFormat;
      fieldsNum.forEach((f) => {
        if (
          f.stepID == obj.stepID &&
          dataFormat.includes('[' + f.fieldName + ']')
        ) {
          if (!f.dataValue?.toString()) return;
          let dataValue = f.dataValue;
          if (f.dataFormat == 'P') dataValue = dataValue + '/100';
          dataFormat = dataFormat.replaceAll(
            '[' + f.fieldName + ']',
            dataValue
          );
        }
      });

      this.arrCaculateField.forEach((x) => {
        if (
          x.stepID == obj.stepID &&
          dataFormat.includes('[' + x.fieldName + ']')
        ) {
          if (!x.dataValue?.toString()) return;
          let dataValue = x.dataValue;
          dataFormat = dataFormat.replaceAll(
            '[' + x.fieldName + ']',
            dataValue
          );
        }
      });

      if (!dataFormat.includes('[')) {
        //tinh toán
        obj.dataValue = this.customFieldSV.caculate(dataFormat);
        //tính toan end
        let index = this.listInstanceSteps.findIndex(
          (x) => x.recID == obj.stepID
        );
        if (index != -1) {
          if (this.listInstanceSteps[index].fields?.length > 0) {
            let idxField = this.listInstanceSteps[index].fields.findIndex(
              (x) => x.recID == obj.recID
            );
            if (idxField != -1) {
              this.listInstanceSteps[index].fields[idxField].dataValue =
                obj.dataValue;

              let idxEdit = this.listCustomFile.findIndex(
                (x) =>
                  x.recID ==
                  this.listInstanceSteps[index].fields[idxField].recID
              );
              if (idxEdit != -1) {
                this.listCustomFile[idxEdit] =
                  this.listInstanceSteps[index].fields[idxField];
              } else
                this.listCustomFile.push(
                  this.listInstanceSteps[index].fields[idxField]
                );
            }
          }
        }
        this.setElement(obj.recID, obj.dataValue, obj.dataType);
      }
    });
  }
  //------------------END_CACULATE--------------------//

  conditionRefValidate() {
    //Tham chieu rafng buoc
    var checkAll = true;
    // this.listFields.forEach(x => {
    //   let fields = this.listInstanceSteps.find(f => f.recID == x.stepID)?.fields;
    //   if (fields?.length > 0) {
    //     let fieldsApplyCondition = x.fields.filter(x => x.isApplyConditional && x.conditionReference?.length > 0);
    //     if (fieldsApplyCondition?.length > 0) {
    //       let checkOne = true
    //       fieldsApplyCondition.forEach(x => {
    //         let check = this.customFieldSV.checkConditionalRef(fields, x);
    //         if (checkOne && !check.check) checkOne = check.check;
    //       })
    //       if (!checkOne && checkAll) checkAll = checkOne;
    //     }
    //   }
    // })
    let fieldsApplyCondition = this.listFields.filter(x => x.isApplyConditional && x.conditionReference?.length > 0);
    if (fieldsApplyCondition?.length > 0) {
      fieldsApplyCondition.forEach(x => {
        let check = this.customFieldSV.checkConditionalRef(this.listFields, x);
        if (checkAll && !check.check) checkAll = check.check;
      })
    }
    return checkAll;
  }

  //-----------------Tham chiếu giá trị----------------------//
  changeRefData(dependences, fields) {
    dependences.forEach(fn => {
      let idx = fields.findIndex(x => x.fieldName == fn.fieldName);
      if (idx != -1) {
        fields[idx].dataValue = fn.dataValue
        this.setElement(fields[idx].recID, fn.dataValue, fields[idx].dataType)
        if (fields[idx].dataType == 'N') this.caculateField()
      }
    })

    return fields;
  }

  setElement(recID, value, dataType) {
    var codxinput = document.querySelectorAll(
      '.form-group codx-input[data-record="' + recID + '"]'
    );
    if (dataType == 'N' || dataType == 'CF') {
      value =
        value && value != '_'
          ? Number.parseFloat(value)?.toFixed(2).toString()
          : '';
    }

    if (codxinput?.length > 0) {
      let htmlE = codxinput[0] as HTMLElement;
      let input = htmlE.querySelector('input') as HTMLInputElement;
      if (input) {
        input.value = value;
      }
    }
  }
  //-------------------------------------------------------//
}
