import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Optional,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CRUDService,
  CacheService,
  CallFuncService,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  Util,
} from 'codx-core';
import {
  Diagram,
  ConnectorEditing,
  BpmnDiagramsService,
  ComplexHierarchicalTreeService,
  ConnectorBridgingService,
  ConnectorEditingService,
  DataBindingService,
  DiagramContextMenuService,
  HierarchicalTreeService,
  LayoutAnimationService,
  MindMapService,
  PrintAndExportService,
  RadialTreeService,
  SnappingService,
  SymmetricLayoutService,
  UndoRedoService,
} from '@syncfusion/ej2-angular-diagrams';
import { environment } from 'src/environments/environment';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { CodxBpService } from '../../codx-bp.service';
import { FormAdvancedSettingsComponent } from './form-advanced-settings/form-advanced-settings.component';
import {
  BP_Processes,
  BP_Processes_Permissions,
  BP_Processes_Steps,
} from '../../models/BP_Processes.model';
import { Subject, isObservable, takeUntil } from 'rxjs';
import { ModeviewComponent } from '../../modeview/modeview.component';
import { PopupPermissionsProcessesComponent } from './popup-permissions-processes/popup-permissions-processes.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
Diagram.Inject(ConnectorEditing);
@Component({
  selector: 'lib-popup-add-process',
  templateUrl: './popup-add-process.component.html',
  styleUrls: ['./popup-add-process.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    HierarchicalTreeService,
    MindMapService,
    RadialTreeService,
    ComplexHierarchicalTreeService,
    DataBindingService,
    SnappingService,
    PrintAndExportService,
    BpmnDiagramsService,
    SymmetricLayoutService,
    ConnectorBridgingService,
    UndoRedoService,
    LayoutAnimationService,
    DiagramContextMenuService,
    ConnectorEditingService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopupAddProcessComponent {
  @ViewChild('status') status: ElementRef;

  @ViewChild('imageAvatar') imageAvatar: AttachmentComponent;
  private destroyFrom$: Subject<void> = new Subject<void>();

  dialog: any;
  data: BP_Processes;
  action = 'add';
  processTabIndex = 0; //tab bước quy trình xử lý
  currentTab = 0; //Tab hiện tại
  processTab = 0; // Tổng bước đã quua
  newNode: number; //vị trí node mới
  oldNode: number; // Vị trí node cũ
  linkAvatar = '';
  vllBP002: any;
  vllBP001: any;
  extendInfos = [];
  title = '';
  vllShare = '';
  typeShare = '';
  multiple = true;
  listCombobox = {};
  user: any;
  countValidate = 0;
  gridViewSetup: any;
  lstShowExtends = [];
  dataValueSettings: any;
  countStage=0;
  constructor(
    private detectorRef: ChangeDetectorRef,
    private callfc: CallFuncService,
    private api: ApiHttpService,
    private cache: CacheService,
    private bpSv: CodxBpService,
    private authStore: AuthStore,
    private notiSv: NotificationsService,
    private shareService: CodxShareService,
    private elementRef: ElementRef,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    if (dialog.dataService.dataSelected)
      this.data = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    this.action = dt?.data?.action;
    this.title = dt?.data?.title;
    this.user = this.authStore.get();
    this.gridViewSetup = dt?.data?.gridViewSetup;
  }

  ngOnInit(): void {
    this.genData();
    // this.bpSv.getEndDate(new Date(), '1', 4, 'STD').subscribe((res) => {});
  }

  genData() {
    if (this.action == 'add') {
      this.data.category = '';
      this.api
        .execSv<any>(
          'SYS',
          'ERM.Business.SYS',
          'SettingsBusiness',
          'GetSettingByFormAsync',
          ['BPParameters', '1']
        )
        .subscribe((st) => {
          if (st && st['1']) {
            this.dataValueSettings = JSON.stringify(st['1']);
            this.data.settings = st['1'];
          } else {
            this.data.settings = [];
          }
        });
      this.defaultAdminPermission();
    }
  }
  ngAfterViewInit(): void {
    if (this.action == 'edit') {
      this.getAvatar(this.data?.recID, this.data?.processName);
      this.extendInfos =
        this.data?.steps?.length > 0
          ? this.data?.steps?.filter((x) => x.activityType == 'Form')[0]
              ?.extendInfo
          : [];
      this.setLstExtends();
    } else {
    }
    this.getCacheCbxOrVll();
    this.getVll();
    this.detectorRef.detectChanges();
  }

  onDestroy() {
    this.destroyFrom$.next();
    this.destroyFrom$.complete();
  }

  defaultAdminPermission() {
    let perm = new BP_Processes_Permissions();
    perm.objectID = this.user?.userID;
    perm.objectName = this.user?.userName;
    perm.objectType = '1';
    perm.roleType = 'O';
    perm.create = true;
    perm.read = true;
    perm.update = true;
    perm.assign = true;
    perm.delete = true;
    perm.share = true;
    perm.download = true;
    perm.allowPermit = true;
    perm.publish = true;
    perm.isActive = true;

    let permissions = [];
    permissions.push(perm);
    this.data.permissions = permissions;
  }

  getVll() {
    let vll = this.shareService.loadValueList('BP001') as any;
    if (isObservable(vll)) {
      vll.subscribe((item) => {
        this.vllBP001 = item;
        if (this.action == 'add') this.defaultStep();
      });
    } else {
      this.vllBP001 = vll;
      if (this.action == 'add') this.defaultStep();
    }
  }
  //#region get or set default form
  getCacheCbxOrVll() {
    this.cache
      .valueList('BP002')
      .pipe(takeUntil(this.destroyFrom$))
      .subscribe((item) => {
        if (item) {
          this.vllBP002 = item;
          if (this.action == 'add') {
            this.setDefaultTitle();
            this.setLstExtends();
          }
        }
      });
  }

  setDefaultTitle() {
    const createField = (value, fieldType, isForm = false) => {
      var values = value + '_1';
      const field = {
        recID: Util.uid(),
        fieldName: this.bpSv
          .createAutoNumber(values, this.extendInfos, 'fieldName')
          .toLowerCase(),
        title: this.bpSv.createAutoNumber(value, this.extendInfos, 'title'),
        dataType: 'String',
        fieldType,
        controlType: 'TextBox',
        isRequired: true,
        defaultValue: null,
        description: '',
        columnOrder: !isForm ? 0 : 1, //parent
        columnNo: 0, //children
      };

      if (isForm) {
        field.description = field.title;
        //field.defaultValue = field.title;
      }

      return field;
    };

    const dataVllTitle = this.vllBP002?.datas?.find((x) => x.value === 'Title');
    const dataVllSubTitle = this.vllBP002?.datas?.find(
      (x) => x.value === 'SubTitle'
    );

    const titleField = createField(dataVllTitle?.text, dataVllTitle?.value);
    const lst = [titleField];

    if (dataVllSubTitle) {
      const subTitleField = createField(
        dataVllSubTitle?.text,
        dataVllSubTitle?.value,
        true
      );
      lst.push(subTitleField);
    }

    this.extendInfos = [...this.extendInfos, ...lst];
  }

  defaultStep() {
    let lstStep = [];
    var stage = new BP_Processes_Steps();
    var form = new BP_Processes_Steps();
    var vllStage = this.vllBP001.datas.filter((x) => x.value == 'Stage')[0];
    var vllForm = this.vllBP001.datas.filter((x) => x.value == 'Form')[0];

    stage.recID = Util.uid();
    stage.stepNo = 0;
    stage.activityType = 'Stage';
    stage.stepName = vllStage.text + ' 1';
    stage.reminder = this.data.reminder;
    stage.eventControl = null;
    stage.stepType = "1";
    stage.permissions = [{objectID: this.user?.userID, objectType: 'U'}]
    var processallowDrag = null;
    var processDefaultProcess = null;
    var processCompleteControl = null;
    var allowEdit = "0";
    if (this.data.settings && this.data.settings.length > 0) {
      processallowDrag = this.data.settings.filter(
        (x) => x.fieldName == 'AllowDrag'
      )[0];
      processDefaultProcess = this.data.settings.filter(
        (x) => x.fieldName == 'DefaultProcess'
      )[0];
      processCompleteControl = this.data.settings.filter(
        (x) => x.fieldName == 'CompleteControl'
      )[0];
      allowEdit = this.data.settings.filter(
        (x) => x.fieldName == 'AllowEdit'
      )[0];
    }
    form.recID = Util.uid();

    stage.settings = JSON.stringify({
      icon: 'icon-i-bar-chart-steps',
      color: '#0078FF',
      backGround: '#EAF0FF',
      allowDrag: processallowDrag?.fieldValue || null,
      defaultProcess: processDefaultProcess?.defaultProcess || null,
      completeControl: processCompleteControl?.completeControl || null,
      nextSteps: [{nextStepID:form.recID}],
      sortBy: null,
      totalControl: null,
      allowEdit: allowEdit
    });

 
    form.stepNo = 1;
    form.stepName = vllForm.text + ' 1';
    form.activityType = 'Form';
    form.stageID = stage.recID;
    form.parentID = stage.recID;
    form.extendInfo = this.extendInfos;
    form.memo = '';
    form.duration = 1;
    form.interval = '1';
    form.stepType = "1";
    form.settings = JSON.stringify({
      icon: vllForm.icon,
      color: vllForm.color,
      backGround: vllForm.textColor,
      nextSteps: null,
      sortBy: null,
      totalControl: null,
      allowEdit: allowEdit
    });
    form.permissions = [{objectID: this.user?.userID, objectType: 'U'}]
    stage.child = [form]
    lstStep.push(stage, form);
    this.data.steps = lstStep;
    this.cache.message('BP001').subscribe((item) => {
      this.data.steps[0].stepName = item?.customName;
    });
    this.cache.message('BP002').subscribe((item) => {
      this.data.steps[1].stepName = item?.customName;
    });
    this.setLstExtends();
  }

  setLstExtends() {
    let lst = [];
    if (this.extendInfos?.length > 0) {
      this.extendInfos.forEach((res) => {
        let count = 1;
        let tmp = {};
        tmp['columnOrder'] = res.columnOrder;
        const index = lst.findIndex((x) => x.columnOrder == res.columnOrder);
        if (index != -1) {
          let indxChild = lst[index]['children'].findIndex(
            (x) => x.columnNo == res.columnNo
          );
          if (indxChild != -1) {
            lst[index]['children'][indxChild] = res;
          } else {
            lst[index]['children'].push(res);
          }
          lst[index]['children'].sort((a, b) => a.columnNo - b.columnNo);
          count = lst[index]['children'].length ?? 1;
          lst[index]['width'] = (100 / count).toString();
        } else {
          count = 1;
          tmp['width'] = '100';
          let lstChild = [];
          lstChild.push(res);
          tmp['children'] = lstChild;
          lst.push(tmp);
        }
      });
    }
    this.lstShowExtends = lst;
  }

  setColumn(item) {
    let count = this.extendInfos.filter(
      (x) => x.columnOrder == item.columnOrder
    ).length;
    return count <= 1 ? '100' : (100 / count).toString();
  }
  //#endregion

  //#region setting created tab
  clickTab(tabNo: number) {
    if (this.currentTab == tabNo) return;
    let newNo = tabNo;
    let oldNo = this.currentTab;
    // if (tabNo <= this.processTab && tabNo != this.currentTab) { //cmt tạm để làm cho xong rồi bắt sau
    //Quy trình xử lý
    if (tabNo == 1) {
      this.processTab == 0 && this.processTab++;
      if (this.action == 'add') {
        if (!this.checkRequired()) return null;
        this.data = { ...this.data };
        this.action = 'edit';
        this.saveProcessStep().subscribe();
      }
    }
    this.currentTab = tabNo;
    this.updateNodeStatus(oldNo, newNo);
    // }
    this.detectorRef.detectChanges();
  }

  updateNodeStatus(oldNode: number, newNode: number) {
    let nodes = Array.from(
      (this.status.nativeElement as HTMLElement).childNodes
    );
    let newClassName = (nodes[newNode] as HTMLElement).className;
    switch (newClassName) {
      case 'stepper-item':
        (nodes[newNode] as HTMLElement).classList.add('active');

        break;
      case 'stepper-item approve-disabled':
        (nodes[newNode] as HTMLElement).classList.remove('approve-disabled');
        (nodes[newNode] as HTMLElement).classList.add('approve');
        break;
    }

    let oldClassName = (nodes[oldNode] as HTMLElement).className;
    switch (oldClassName) {
      case 'stepper-item approve':
        (nodes[oldNode] as HTMLElement).classList.remove('approve');
        break;
      case 'stepper-item active':
        (nodes[oldNode] as HTMLElement).classList.remove('active');
        break;
    }
    if (
      oldNode > newNode &&
      this.currentTab == this.processTab &&
      this.action != 'edit'
    ) {
    } else {
      (nodes[oldNode] as HTMLElement).classList.add('approve-disabled');
    }
  }
  async continue(currentTab: any) {
    if (currentTab == 0) {
      //check điều kiện để continue
    }
    if (this.currentTab > 3) return;
    let oldNode = currentTab;
    let newNode = oldNode + 1;
    switch (currentTab) {
      case 0: {
        if (this.action == 'add') {
          if (!this.checkRequired()) return null;
          this.action = 'edit';
          this.data = { ...this.data };
          this.saveProcessStep().subscribe();
        }
        this.updateNodeStatus(oldNode, newNode);
        this.currentTab++;
        this.processTab == 0 && this.processTab++;
        break;
      }
      case 1: {
        this.newNode = newNode;
        this.oldNode = oldNode;
        this.updateNodeStatus(oldNode, newNode);
        this.processTab++;
        this.currentTab++;
        this.updateProcessStep().subscribe((item) => {
          this.dialog.dataService.update(item, true).subscribe();
        });
        break;
      }
      case 2:
        this.updateNodeStatus(oldNode, newNode);
        this.currentTab++;
        this.processTab++;
        break;
    }
    // this.changeDetectorRef.detectChanges();
    this.detectorRef.markForCheck();
  }

  previous(currentTab) {
    let oldNode = currentTab;
    let newNode = oldNode - 1;
    this.updateNodeStatus(oldNode, newNode);
    this.currentTab--;
  }
  //#endregion

  //#region Thong tin chung - Infomations
  valueChange(e) {
    if (e) {
      this.data[e?.field] = e?.data;
    }
  }

  //---- AVATA ---- //
  addAvatar() {
    this.imageAvatar.referType = 'avt';
    this.imageAvatar.uploadFile();
  }
  fileImgAdded(e) {
    if (e?.data && e?.data?.length > 0) {
      let countListFile = e.data.length;
      this.linkAvatar = e?.data[countListFile - 1].avatar;
      // this.changeDetectorRef.detectChanges();
      this.detectorRef.markForCheck();
    }
  }

  getAvatar(objectID, proccessName) {
    let avatar = [
      '',
      this.dialog?.formModel?.funcID,
      objectID,
      'BP_Processes',
      'inline',
      1000,
      proccessName,
      'avt',
      false,
    ];
    this.api
      .execSv<any>('DM', 'DM', 'FileBussiness', 'GetAvatarAsync', avatar)
      .pipe(takeUntil(this.destroyFrom$))
      .subscribe((res) => {
        if (res && res?.url) {
          this.linkAvatar = environment.urlUpload + '/' + res?.url;
          // this.changeDetectorRef.detectChanges();
          this.detectorRef.markForCheck();
        }
      });
  }
  //#endregion

  //#region control Share
  //Control share
  sharePerm(share) {
    this.listCombobox = {};
    this.multiple = true;
    this.vllShare = 'BP016';
    this.typeShare = '1';
    this.multiple = true;
    let option = new DialogModel();
    option.zIndex = 1010;
    this.callfc.openForm(share, '', 420, 600, null, null, null, option);
  }

  openPopupParticipants(popupParticipants) {
    let option = new DialogModel();
    option.zIndex = 1010;
    this.callfc.openForm(
      popupParticipants,
      '',
      950,
      650,
      null,
      null,
      null,
      option
    );
  }

  defaultRoleNotAdmin(objectID, objectName, objectType) {
    let perm = new BP_Processes_Permissions();
    perm.objectID = objectID;
    perm.objectName = objectName;
    perm.objectType = objectType;
    perm.roleType = 'P';
    perm.create = true;
    perm.read = true;
    perm.update = false;
    perm.assign = false;
    perm.delete = false;
    perm.share = false;
    perm.download = false;
    perm.allowPermit = false;
    perm.publish = false;
    perm.isActive = false;

    return perm;
  }

  searchAddUsers(e) {
    if (e && e?.component?.itemsSelected?.length > 0) {
      let permissions = this.data.permissions ?? [];
      const data = e?.component?.itemsSelected[0];
      if (data) {
        let perm = this.defaultRoleNotAdmin(data?.UserID, data?.UserName, 'U');
        permissions = this.checkUserPermission(permissions, perm);
        this.data.permissions = permissions;
      }

      this.detectorRef.markForCheck();
    }
  }

  applyShare(e) {
    let permissions = this.data?.permissions ?? [];
    if (e?.length > 0) {
      let value = e;
      //Người giám sát
      for (let i = 0; i < value.length; i++) {
        let data = value[i];
        let perm = this.defaultRoleNotAdmin(
          data?.objectType != '1'
            ? data.id != null
              ? data.id
              : null
            : this.user?.userID,
          data?.objectType != '1'
            ? data.text == null || data.text == ''
              ? data?.objectName
              : data?.text
            : this.user?.userName,
          data.objectType
        );

        permissions = this.checkUserPermission(permissions, perm);
      }
      this.data.permissions = permissions;
    }
    // this.changeDetectorRef.detectChanges();
    this.detectorRef.markForCheck();
  }

  checkUserPermission(
    listPerm: BP_Processes_Permissions[],
    perm: BP_Processes_Permissions
  ) {
    let index = -1;
    if (listPerm != null) {
      if (perm != null && listPerm.length > 0) {
        index = listPerm.findIndex(
          (x) =>
            (x.objectID != null &&
              x.objectID === perm.objectID &&
              x.objectType == perm.objectType) ||
            (x.objectID == null && x.objectType == perm.objectType)
        );
      }
    } else {
      listPerm = [];
    }

    if (index == -1) {
      listPerm.push(Object.assign({}, perm));
    }

    return listPerm;
  }

  clickRoles() {
    let title = this.gridViewSetup?.Permissions?.headerText ?? 'Phân quyền';
    let formModel = new FormModel();
    formModel.formName = 'Processes_Permissions';
    formModel.gridViewName = 'grvProcesses_Permissions';
    formModel.entityName = 'BP_Processes_Permissions';
    let dialogModel = new DialogModel();
    dialogModel.zIndex = 999;
    dialogModel.FormModel = formModel;
    let obj = {
      permissions: this.data.permissions ?? [],
      title: title,
    };
    let dialog = this.callfc.openForm(
      PopupPermissionsProcessesComponent,
      '',
      950,
      650,
      '',
      obj,
      '',
      dialogModel
    );

    dialog.closed.subscribe((e) => {
      if (e?.event && e?.event.length > 0) {
        this.data.permissions = e.event ?? [];
        // this.changeDetectorRef.detectChanges();
        this.detectorRef.markForCheck();
      }
    });
  }

  removeUser(index) {
    this.notiSv
      .alertCode('SYS030')
      .pipe(takeUntil(this.destroyFrom$))
      .subscribe((x) => {
        if (x.event.status == 'Y') {
          this.data.permissions.splice(index, 1);
          this.detectorRef.markForCheck();
        }
      });
  }

  checkAssignRemove(i) {
    return true;
  }
  //#endregion

  //#region setting advanced - thiết lập nâng cao
  async popupAdvancedSetting() {
    let option = new DialogModel();
    option.zIndex = 1010;
    option.FormModel = JSON.parse(JSON.stringify(this.dialog.formModel));
    let data = {
      data: this.data,
    };
    let popupDialog = this.callfc.openForm(
      FormAdvancedSettingsComponent,
      '',
      700,
      800,
      '',
      data,
      '',
      option
    );
    popupDialog.closed.subscribe((e) => {
      if (e && e?.event) {
        this.data = JSON.parse(JSON.stringify(e?.event));
      }
    });
  }
  //#endregion
  //#region form setting properties
  formPropertieFields() {
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 1010;

    let formModelField = new FormModel();
    formModelField.formName = 'DPStepsFields';
    formModelField.gridViewName = 'grvDPStepsFields';
    formModelField.entityName = 'DP_Steps_Fields';
    formModelField.userPermission = this.dialog?.formModel?.userPermission;
    option.FormModel = formModelField;
    if (this.extendInfos) {
      this.extendInfos.forEach((element) => {
        if (typeof element.documentControl == 'string') {
          element.documentControl = JSON.parse(element.documentControl);
        }

        if (
          typeof element.dataFormat == 'string' &&
          element.fieldType == 'Table'
        ) {
          element.dataFormat = JSON.parse(element.dataFormat);
        }
      });
    }
    let popupDialog = this.callfc.openForm(
      ModeviewComponent,
      '',
      null,
      null,
      '',
      { extendInfo: this.extendInfos, stepNo: this.data?.steps[1].stepNo },
      '',
      option
    );
    popupDialog.closed.subscribe((res) => {
      if (res?.event) {
        this.extendInfos =
          res?.event?.length > 0 ? JSON.parse(JSON.stringify(res?.event)) : [];
        this.setLstExtends();
        let index = this.data?.steps.findIndex(x=>x.activityType == "Form");
        if (this.data?.steps[index]?.extendInfo) {
          this.extendInfos.forEach((element) => {
            if (element.controlType == 'Attachment') {
              if (!element?.documentControl || element?.documentControl.length == 0) {
                var obj = 
                {
                  recID: Util.uid(),
                  title: element.title,
                  isRequired: false,
                  count: 0,
                  isList: '1',
                  stepID: this.data?.steps[1].recID,
                  stepNo: this.data?.steps[1].stepNo,
                  fieldID: element.recID,
                  memo: this.data?.steps[1].memo,
                  permissions: 
                  [
                    {
                      objectID: this.user?.userID,
                      objectType: "U",
                      read: true,
                      update: true,
                      delete: true
                    }
                  ]
                };
                this.data.documentControl = [obj];
              } else if (
                element.documentControl &&
                element.documentControl.length > 0
              ) {
                var doc = JSON.parse(JSON.stringify(this.data.documentControl));
                if (!doc) doc = [];
                element.documentControl.forEach((docu) => {
                  docu.stepID = this.data?.steps[1].recID;
                  docu.stepNo = this.data?.steps[1].stepNo;
                  docu.fieldID = element.recID;
                  docu.memo = this.data?.steps[1].memo;
                  docu.permissions =
                  [
                    {
                      objectID: this.user?.userID,
                      objectType: "U",
                      read: true,
                      update: true,
                      delete: true
                    }
                  ]
                  var index = doc.findIndex((x) => x.recID == docu.recID);
                  if (index >= 0) doc[index] = docu;
                  else doc.push(docu);
                });
                this.data.documentControl = doc;
              }
            }

            if (typeof element.documentControl != 'string') {
              element.documentControl =
                element.documentControl?.length > 0
                  ? JSON.stringify(element.documentControl)
                  : null;
            }

            if (typeof element.dataFormat != 'string') {
              element.dataFormat =
                element.dataFormat?.length > 0
                  ? JSON.stringify(element.dataFormat)
                  : null;
            }
            if (typeof element.tableFormat != 'string') {
              element.tableFormat = JSON.stringify(element.tableFormat) 
            }
          });

          this.data.steps[index].extendInfo = this.extendInfos;

          this.data = Object.assign({},  this.data);
          
        }
        this.detectorRef.detectChanges();
      }
    });
  }
  //#endregion

  async onSave() {
    // this.countValidate = this.bpSv.checkValidate(this.gridViewSetup, this.data);
    // if (this.countValidate > 0) return;

    if (this.imageAvatar?.fileUploadList?.length > 0) {
      (await this.imageAvatar.saveFilesObservable())
        .pipe(takeUntil(this.destroyFrom$))
        .subscribe((res) => {
          // save file
          if (res) {
            this.handlerSave();
          }
        });
    } else {
      this.handlerSave();
    }
  }

  checkRequired() {
    if (!this.data?.processName) {
      this.notiSv.notifyCode('SYS009', 0, 'Tên quy trình');
      return false;
    }
    return true;
  }

  handlerSave() {
    if (
      (this.action == 'add' || this.action == 'copy') &&
      this.currentTab == 0
    ) {
      if (!this.checkRequired()) return;
      this.onAdd();
    } else {
      this.onUpdate();
    }
  }

  onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe((res) => {
        if (res) {
          this.dialog.close(res.save);
        }
      });
  }

  onUpdate() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        if (res && res.update) {
          (this.dialog.dataService as CRUDService)
            .update(res.update)
            .subscribe();
          res.update.modifiedOn = new Date();
          //this.dialog.close(res.update);
        }
        this.dialog.close(res.update);
      });
  }

  beforeSave(op) {
    op.className = 'ProcessesBusiness';
    op.service = 'BP';
    if (
      (this.action == 'add' || this.action == 'copy') &&
      this.currentTab == 0
    ) {
      op.methodName = 'AddProcessAsync';
    } else {
      op.methodName = 'UpdateProcessAsync';
    }
    let i = 0;
    let result2 = [];
    let result = JSON.parse(JSON.stringify(this.data));
    let count = result.steps.length;
    let result_1 = result.steps.filter(x=>x.activityType == "Stage");
  
    result_1.forEach((elm: any) => {
      elm.stepNo = i;
      i++;
      result2.push(elm);
      if(elm.child && elm.child.length>0)
      {
        let stt = 0;
        elm.child.forEach(elm2 => {
          if (typeof elm2.settings === 'string') elm2.settings = JSON.parse(elm2.settings);
          elm2.stepNo = i;
          result2.push(elm2);
          i++;
          if(elm2.activityType == "Conditions")
          {
            if(elm2.child && elm2.child.length>0)
            {
              elm2.child.forEach(elm3=>{
                if(elm.child[stt+1])
                {
                  elm3.stepNo = i;
                  elm3.settings.nextSteps =  [{nextStepID: elm.child[stt+1].recID}] 
                  if(typeof elm3.settings === 'object') elm3.settings = JSON.stringify(elm3.settings);
                  result2.push(elm3);
                  i++;
                }
              })
            }
          }
          stt++;
          result.steps = result.steps.filter(x=>x.recID != elm2.recID);
        });
      }
      if (typeof elm.settings === 'object') elm.settings = JSON.stringify(elm.settings);
    });

    if(result2.length < count)
    {
      let result_2 = result.steps.filter(x=>x.activityType != "Stage");
      result_2.forEach((elm: any) => {
        if(!result2.some(x=>x.recID == elm.recID))
        {
          elm.stepNo = i;
          i++;
          result2.push(elm);
          if (typeof elm.settings === 'object') elm.settings = JSON.stringify(elm.settings);
        }
      });
    }
   
    if(result2.length>0)
    {
      for(var x = 0 ; x < result2.length ; x++)
      {
        if(result2[x].activityType == "Form") 
        {
          if(result2[x].extendInfo && result2[x].extendInfo.length>0)
          {
            result2[x].extendInfo.forEach(element => {
              if(typeof element.documentControl == 'object') element.documentControl = JSON.stringify(element.documentControl);
            });
          }
        }
        
        if(typeof result2[x].settings == 'string') result2[x].settings = JSON.parse(result2[x].settings);
        if(result2[x + 1]?.recID && result2[x].activityType != 'Conditions')
        {
          if(!result2[x]?.settings?.nextSteps) result2[x].settings.nextSteps = [{nextStepID: result2[x + 1]?.recID}] 
        }
        else if(result2[x].activityType != 'Conditions') result2[x].settings.nextSteps = null;
        
        result2[x].settings = JSON.stringify(result2[x].settings);

        if(typeof result2[x].reminder != "string" && result2[x].reminder) result2[x].reminder = JSON.stringify(result2[x].reminder);
      }
    }
    result.steps = result2;
    op.data = result;
    return true;
  }

  activeTab(tab: any) {
    this.processTabIndex = tab;
  }

  saveProcessStep() {
    return this.api.execSv(
      'BP',
      'BP',
      'ProcessesBusiness',
      'AddProcessAsync',
      this.data
    );
  }
  updateProcessStep() {
    let result = JSON.parse(JSON.stringify(this.data));
    result.steps.forEach((elm: any) => {
      delete elm.child;
      if (typeof elm.settings === 'object')
        elm.settings = JSON.stringify(elm.settings);
    });
    return this.api.execSv(
      'BP',
      'BP',
      'ProcessesBusiness',
      'UpdateProcessAsync',
      result
    );
  }

  valueChange2(e: any) {
    this.data = this.formatData(e);
  }


  formatData(datas:any)
  {
    let data = datas.steps;
    this.countStage = data.length;
    data = data.sort((a, b) => a.stepNo - b.stepNo);
    var listStage = data.filter(x=>x.activityType == 'Stage');
    listStage.forEach(element => {
      if(element.child && element.child.length>0)
      {
        element.child.forEach(element2 => {
          var index2 = data.findIndex(x=>x.recID == element2.recID);
          if(index2>=0)
          {
            //element2.extendInfo = data[index2]?.extendInfo;
            data[index2]= element2;
          }
        });
      }
    });
    for(var i = 0 ; i < data.length ; i++)
    {
      data[i].stepNo = i;
    }
    datas.steps = data;

    var fristForm = datas.steps.filter(x=>x.activityType == "Form")[0]
    this.extendInfos = fristForm?.extendInfo;
    this.setLstExtends();
    return datas;
  }
}
