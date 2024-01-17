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
  RequestOption,
  SidebarModel,
  Util,
} from 'codx-core';
import { FormPropertiesFieldsComponent } from './form-properties-fields/form-properties-fields.component';
import {
  Diagram,
  ConnectorEditing,
  DiagramComponent,
  SymbolPaletteComponent,
  SnapSettingsModel,
  SnapConstraints,
  NodeModel,
  PaletteModel,
  PortVisibility,
  PortConstraints,
  BpmnShapeModel,
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
  ConnectorModel,
  HeaderModel,
  DiagramTools,
  ContextMenuSettingsModel,
  DiagramBeforeMenuOpenEventArgs,
  LaneModel,
  ShapeStyleModel,
  SwimLaneModel,
  cloneObject,
  randomId,
  RulerSettingsModel,
  SwimLane,
  UndoRedo,
  UserHandleModel,
  SelectorModel,
  SelectorConstraints,
} from '@syncfusion/ej2-angular-diagrams';
import { ExpandMode, MenuEventArgs } from '@syncfusion/ej2-angular-navigations';
import { log } from 'console';
import { environment } from 'src/environments/environment';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { CodxBpService } from '../../codx-bp.service';
import { FormAdvancedSettingsComponent } from './form-advanced-settings/form-advanced-settings.component';
import { FormEditConnectorComponent } from '../../../../../codx-share/src/lib/components/codx-diagram/form-edit-connector/form-edit-connector.component';
import {
  BP_Processes,
  BP_Processes_Permissions,
  BP_Processes_Steps,
} from '../../models/BP_Processes.model';
import { Subject, takeUntil } from 'rxjs';
import { ModeviewComponent } from '../../modeview/modeview.component';
import { DynamicSettingControlComponent } from 'projects/codx-share/src/lib/components/dynamic-setting/dynamic-setting-control/dynamic-setting-control.component';
import { PopupPermissionsProcessesComponent } from './popup-permissions-processes/popup-permissions-processes.component';
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
  constructor(
    private detectorRef: ChangeDetectorRef,
    private callfc: CallFuncService,
    private api: ApiHttpService,
    private cache: CacheService,
    private bpSv: CodxBpService,
    private authStore: AuthStore,
    private notiSv: NotificationsService,
    private elementRef: ElementRef,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    if(dialog.dataService.dataSelected) this.data = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    this.action = dt?.data?.action;
    this.title = dt?.data?.title;
    this.user = this.authStore.get();
    this.gridViewSetup = dt?.data?.gridViewSetup;
  }

  ngOnInit(): void {
    if (this.action == 'edit') {
      this.getAvatar(this.data?.recID, this.data?.processName);
      this.extendInfos =
        this.data?.steps?.length > 0
          ? this.data?.steps?.filter((x) => x.activityType == '1')[0]
              ?.extendInfo
          : [];
      this.setLstExtends();
    } else {
    }
    this.getCacheCbxOrVll();
  }

  ngAfterViewInit(): void {}

  onDestroy() {
    this.destroyFrom$.next();
    this.destroyFrom$.complete();
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
            this.defaultStep();
            this.setLstExtends();
          }
        }
      });
  }

  setDefaultTitle() {
    const createField = (value, fieldType, isForm = false) => {
      const field = {
        recID: Util.uid(),
        fieldName: this.bpSv.createAutoNumber(
          value,
          this.extendInfos,
          'fieldName'
        ),
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
        field.description = 'Câu trả lời';
        field.defaultValue = field.title;
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
    var step = new BP_Processes_Steps();
    step.recID = Util.uid();
    step.stepNo = 1;
    step.stepName = 'Bước 1';
    step.activityType = '1';
    step.stageID = step.recID;
    step.parentID = this.data.recID;
    step.extendInfo = this.extendInfos;
    lstStep.push(step);
    this.data.steps = lstStep;
  }

  setLstExtends() {
    let lst = [];
    if (this.extendInfos?.length > 0) {
      console.log('extendInfos: ', this.extendInfos);
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
    let newNo = tabNo;
    let oldNo = this.currentTab;
    // if (tabNo <= this.processTab && tabNo != this.currentTab) { //cmt tạm để làm cho xong rồi bắt sau
    this.updateNodeStatus(oldNo, newNo);
    this.currentTab = tabNo;
    if (tabNo == 1) {
      // setTimeout(() => {
      //   if (this.elementRef.nativeElement.querySelector('#appearance'))
      //     this.elementRef.nativeElement.querySelector('#appearance').onclick =
      //       this.documentClick.bind(this);
      // }, 200);
    }

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
  async continue(currentTab) {
    if (currentTab == 0) {
      //check điều kiện để continue
    }
    if (this.currentTab > 3) return;
    let oldNode = currentTab;
    let newNode = oldNode + 1;
    switch (currentTab) {
      case 0:
        this.updateNodeStatus(oldNode, newNode);
        this.currentTab++;
        this.processTab == 0 && this.processTab++;
        break;
      case 1:
        this.newNode = newNode;
        this.oldNode = oldNode;
        this.updateNodeStatus(oldNode, newNode);
        this.processTab++;
        this.currentTab++;
        break;
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
    this.vllShare = 'DP0331';
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

  searchAddUsers(e) {
    if (e && e?.component?.itemsSelected?.length > 0) {
      let permissions = this.data.permissions ?? [];
      const data = e?.component?.itemsSelected[0];
      if (data) {
        let perm = new BP_Processes_Permissions();
        perm.objectID = data?.UserID;
        perm.objectName = data?.UserName;
        perm.objectType = 'U';
        perm.read = true;
        perm.full = true;
        perm.create = true;
        perm.assign = true;
        perm.update = true;
        perm.delete = true;
        perm.isActive = true;

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
        let perm = new BP_Processes_Permissions();
        perm.objectName =
          data?.objectType != '1'
            ? data.text == null || data.text == ''
              ? data?.objectName
              : data?.text
            : this.user?.userName;

        perm.objectID =
          data?.objectType != '1'
            ? data.id != null
              ? data.id
              : null
            : this.user?.userID;
        perm.objectType = data.objectType;
        perm.full = true;
        perm.create = true;
        perm.read = true;
        perm.assign = true;
        perm.edit = true;
        // perm.publish = true;
        perm.delete = true;
        perm.isActive = true;
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
    formModel.formName = 'DPProcessesPermissions';
    formModel.gridViewName = 'grvDPProcessesPermissions';
    formModel.entityName = 'DP_Processes_Permissions';
    let dialogModel = new DialogModel();
    dialogModel.zIndex = 999;
    dialogModel.FormModel = formModel;
    let obj = {
      permissions: this.data.permissions ?? [],
      title: title
    }
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
    // let dataValue = await firstValueFrom(this.api
    //   .execSv<any>('BG', 'BG', 'ScheduleTasksBusiness', 'GetScheduleTasksAsync', [
    //     'ACP101',
    //   ]));

    let data = {
      newSetting: this.data.settings ?? [],
      lineType: '1',
      tilte: 'Thiết lập nâng cao',
      // settingFull: dataValue,
      // dataValue: dataValue?.paraValues
    };

    this.callfc.openForm(
      DynamicSettingControlComponent,
      '',
      700,
      800,
      '',
      data,
      '',
      option
    );
    // let popupDialog = this.callfc.openForm(
    //   FormAdvancedSettingsComponent,
    //   '',
    //   700,
    //   800,
    //   '',
    //   data,
    //   '',
    //   option
    // );
    // popupDialog.closed.subscribe((e) => {
    //   if (e) {
    //   }
    // });
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
      this.extendInfos,
      '',
      option
    );
    popupDialog.closed.subscribe((res) => {
      if (res?.event) {
        this.extendInfos =
          res?.event?.length > 0 ? JSON.parse(JSON.stringify(res?.event)) : [];
        this.setLstExtends();
        let extDocumentControls = this.extendInfos.filter(
          (x) => x.fieldType == 'Attachment' && x.documentControl != null
        );
        if (extDocumentControls?.length > 0) {
          let lstDocumentControl = [];
          extDocumentControls.forEach((ele) => {
            const documents =
              typeof ele.documentControl == 'string'
                ? ele.documentControl
                  ? JSON.parse(ele.documentControl)
                  : []
                : ele.documentControl ?? [];
            documents.forEach((res) => {
              var tmpDoc = {};
              tmpDoc['recID'] = Util.uid();
              tmpDoc['stepNo'] = 1;
              tmpDoc['fieldID'] = res.recID;
              tmpDoc['title'] = res.title;
              tmpDoc['memo'] = res.memo;
              tmpDoc['isRequired'] = res.isRequired ?? false;
              tmpDoc['count'] = res.count ?? 0;
              tmpDoc['templateID'] = res.templateID;
              lstDocumentControl.push(tmpDoc);
            });
          });
          this.data.documentControl = lstDocumentControl.length > 0 ? JSON.stringify(lstDocumentControl) : null;
        }

        if (this.data?.steps[0]?.extendInfo) {
          this.extendInfos.forEach((element) => {
            if (typeof element.documentControl != 'string') {
              element.documentControl = element.documentControl?.length > 0 ? JSON.stringify(element.documentControl) : null;
            }

            if (typeof element.dataFormat != 'string') {
              element.dataFormat = element.dataFormat?.length > 0 ? JSON.stringify(element.dataFormat) : null;
            }
          });

          this.data.steps[0].extendInfo = this.extendInfos;
        }
        this.detectorRef.detectChanges();
      }
    });
  }
  //#endregion

  async onSave() {
    this.data.category = '1';
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

  handlerSave() {
    if (this.action == 'add' || this.action == 'copy') {
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
          this.dialog.close(res.update);
        }
      });
  }

  beforeSave(op) {
    let data = [];
    op.className = 'ProcessesBusiness';
    op.service = 'BP';
    data = [this.data];
    if (this.action == 'add' || this.action == 'copy') {
      op.methodName = 'AddProcessAsync';
    } else {
      op.methodName = 'UpdateProcessAsync';
    }
    op.data = data;
    return true;
  }

  activeTab(tab:any)
  {
    this.processTabIndex = tab;
  }
}
