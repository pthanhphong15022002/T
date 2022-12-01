import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { D, I, V } from '@angular/cdk/keycodes';
import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  Injector,
  ChangeDetectorRef,
  ViewEncapsulation,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  EventEmitter,
  Output,
  Optional,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileService } from '@shared/services/file.service';
import { DayMarkers } from '@syncfusion/ej2-gantt';
import {
  AuthStore,
  ButtonModel,
  DataRequest,
  DialogData,
  DialogRef,
  FormModel,
  LayoutService,
  NotificationsService,
  RequestOption,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { debug } from 'console';
import moment from 'moment';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

import { CodxBpService } from '../codx-bp.service';
import {
  BP_Processes,
  BP_ProcessOwners,
  BP_ProcessSteps,
  ColumnsModel,
} from '../models/BP_Processes.model';
import { PopupAddProcessStepsComponent } from './popup-add-process-steps/popup-add-process-steps.component';

@Component({
  selector: 'codx-processsteps',
  templateUrl: './processsteps.component.html',
  styleUrls: ['./processsteps.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProcessStepsComponent extends UIComponent implements OnInit {
  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;
  @ViewChild('flowChart') flowChart?: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('addFlowchart') addFlowchart: AttachmentComponent;

  @Input() process: BP_Processes;
  @Input() viewMode = '16';
  @Input() funcID = 'BPT11';
  @Input() childFunc = [];
  @Input() formModel: FormModel;
  showButtonAdd = true;
  dataObj?: any;
  model?: DataRequest;
  request: ResourceModel;
  resourceKanban?: ResourceModel;
  modelResource: ResourceModel;
  resource: ResourceModel;
  views: Array<ViewModel> = [];
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  dialog!: DialogRef;
  user: any;
  // funcID: any;
  titleAction = '';
  itemSelected: any;
  stepType: any;
  service = 'BP';
  entityName = 'BP_ProcessSteps';
  idField = 'recID';
  assemblyName = 'ERM.Business.BP';
  className = 'ProcessStepsBusiness';
  method = 'GetProcessStepsAsync';
  listPhaseName = [];
  numberColums = 0;
  processID = '';
  dataTreeProcessStep = [];
  urlBack = '/bp/processes/BPT1'; //gang tam
  dataView: any; //them de test
  //view file
  dataChild = [];
  lockParent = false;
  lockChild = false;
  hideMoreFC = false;
  // childFunc = [];
  formModelMenu: FormModel;
  vllInterval = 'VL004';
  dataFile: any;
  crrParentID = '';
  crrStepNo = '1';
  kanban: any;
  checkList = [];
  isKanban = true;
  dataHover: any;
  titleAdd = '';
  childFuncOfA = [];
  childFuncOfP = [];
  parentID = '';
  linkFile: any;

  msgBP001 = 'BP005'; // gán tạm message
  msgBP002 = 'BP006'; // gán tạm message
  listCountPhases: any;
  actived = false;
  isBlock:any = true;
  constructor(
    inject: Injector,
    private bpService: CodxBpService,
    private layout: LayoutService,
    private changeDetectorRef: ChangeDetectorRef,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private notiService: NotificationsService,
    private fileService: FileService
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.cache.moreFunction('CoDXSystem', null).subscribe((mf) => {
      if (mf) {
        var mfAdd = mf.find((f) => f.functionID == 'SYS01');
        if (mfAdd) this.titleAdd = mfAdd?.customName;
      }
    });
  }

  onInit(): void {
    this.actived = this.process?.actived;
    if (!this.actived) {
      this.lockChild = this.lockParent = this.hideMoreFC = true;
    }
    this.processID = this.process?.recID ? this.process?.recID : '';
    this.numberColums = this.process?.phases ? this.process?.phases : 0;
    this.dataObj = {
      processID: this.processID,
    };

    this.getFlowChart(this.process);
    this.request = new ResourceModel();
    this.request.service = 'BP';
    this.request.assemblyName = 'BP';
    this.request.className = 'ProcessStepsBusiness';
    this.request.method = 'GetProcessStepsWithKanbanAsync';
    this.request.idField = 'recID';
    this.request.dataObj = this.dataObj; ///de test

    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'BP';
    this.resourceKanban.assemblyName = 'BP';
    this.resourceKanban.className = 'ProcessStepsBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';
    this.resourceKanban.dataObj = this.dataObj;
    this.listCountPhases = this.process.phases;

    var items = [];
    if (this.childFunc && this.childFunc.length > 0) {
      items = this.childFunc.map((obj) => {
        var menu = {
          id: obj.id,
          icon: obj.icon,
          text: obj.text,
        };
        return menu;
      });
    }
    this.button = {
      id: 'btnAdd',
      items: items,
    };
    this.childFunc.forEach((obj) => {
      if (obj.id != 'P') this.childFuncOfP.push(obj);
    });
    this.childFunc.map((obj) => {
      if (obj.id != 'P' && obj.id != 'A') this.childFuncOfA.push(obj);
    });
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        id: '16',
        type: ViewType.content,
        active: false,
        sameData: false,
        model: {
          panelRightRef: this.itemViewList,
        },
      },
      {
        id: '6',
        type: ViewType.kanban,
        active: false,
        sameData: false,
        request: this.request,
        request2: this.resourceKanban,
        model: {
          template: this.cardKanban,
        },
      },
      {
        id: '9',
        type: ViewType.content,
        active: false,
        sameData: true,
        model: {
          panelLeftRef: this.flowChart,
        },
      },
    ];

    this.view.dataService.methodSave = 'AddProcessStepAsync';
    this.view.dataService.methodUpdate = 'UpdateProcessStepAsync';
    this.view.dataService.methodDelete = 'DeleteProcessStepAsync';
    this.changeDetectorRef.detectChanges();
  }

  //Thay doi viewModel
  chgViewModel(type) {
    let view = this.views.find((x) => x.id == type);
    if (view) this.view.viewChange(view);
  }

  //#region CRUD bước công việc
  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      option.zIndex = 1001;

      this.view.dataService.dataSelected.processID = this.processID;
      if (this.parentID != '')
        this.view.dataService.dataSelected.parentID = this.parentID;
      this.dialog = this.callfc.openSide(
        PopupAddProcessStepsComponent,
        ['add', this.titleAction, this.stepType, this.formModelMenu,this.process],
        option
      );
      this.dialog.closed.subscribe((e) => {
        if (!e?.event) this.view.dataService.clear();
        if (e?.event == null)
          this.view.dataService.delete(
            [this.view.dataService.dataSelected],
            false
          );
        else {
          if ((this.view.currentView as any)?.kanban)
            this.kanban = (this.view.currentView as any).kanban;
          this.notiService.notifyCode('SYS006');
          var processStep = e?.event;
          if (processStep.stepType != 'P') {
            if (processStep.stepType == 'A') {
              this.view.dataService.data.forEach((obj) => {
                if (obj.recID == processStep?.parentID) {
                  obj.items.push(processStep);
                }
              });
              if (this.kanban) this.kanban.addCard(processStep);
            } else {
              this.view.dataService.data.forEach((obj) => {
                if (obj.items.length > 0) {
                  obj.items.forEach((dt) => {
                    if (dt.recID == processStep?.parentID) {
                      dt.items.push(processStep);
                      if (processStep?.ownersOfParent)
                        dt.owners = processStep?.ownersOfParent;
                      if (this.kanban) this.kanban.updateCard(dt);
                    }
                  });
                }
              });
            }
          } else {
            if (this.kanban) {
              var column = new ColumnsModel();
              column.headerText = processStep.stepName;
              column.keyField = processStep.recID;
              column.showItemCount = false;
              let index = this.kanban?.columns?.length
                ? this.kanban?.columns?.length
                : 0;
              if (this.kanban.columns && this.kanban.columns.length)
                this.kanban.addColumn(column, index);
              else {
                this.kanban.columns = [];
                this.kanban.columns.push(column);
                this.kanban.refresh();
              }
            }

            this.view.dataService.data.push(processStep);
            this.listPhaseName.push(processStep.stepName);
          }
          this.dataTreeProcessStep = this.view.dataService.data;
          this.isBlockClickMoreFunction(this.dataTreeProcessStep);
          this.changeDetectorRef.detectChanges();
        }
      });
    });
  }

  edit(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '550px';
        option.zIndex = 1001;
        this.dialog = this.callfc.openSide(
          PopupAddProcessStepsComponent,
          [
            'edit',
            this.titleAction,
            this.view.dataService.dataSelected?.stepType,
            this.formModelMenu,
            this.process
          ],
          option
        );
        this.dialog.closed.subscribe((e) => {
          if (!e?.event) this.view.dataService.clear();
          if (e?.event == null)
            this.view.dataService.delete(
              [this.view.dataService.dataSelected],
              false
            );
          else {
            if ((this.view.currentView as any)?.kanban)
              this.kanban = (this.view.currentView as any).kanban;
            var processStep = e?.event;
            if (data.items?.length > 0) processStep.items = data.items;
            var index = -1;
            if (processStep.stepType != 'P') {
              //edit activity
              if (processStep.stepType == 'A') {
                this.editActivity(data, processStep);
                if (this.kanban) this.kanban.updateCard(processStep);
              } else {
                //edit !P !A hơi bị nhằn
                this.editStepChild(data, processStep);
              }
            } else {
              //edit colum
              if (
                this.kanban &&
                this.kanban.columns &&
                this.kanban.columns.length &&
                data.stepName != processStep.stepName
              ) {
                // //dung core
                // let columm = this.kanban.columns.find(
                //   (c) => c.keyField == data.recID
                // );
                // if (columm) {
                //   columm.headerText = processStep.stepName;
                //   this.kanban.updateColumn(columm);
                // }
                // bua data
                let colummIndex = this.kanban.columns.findIndex(
                  (c) => c.keyField == data.recID
                );
                if (colummIndex != -1) {
                  this.kanban.columns[colummIndex].headerText =
                    processStep.stepName;
                  this.kanban.refresh();
                }
              }

              this.view.dataService.update(processStep).subscribe();
              index = this.listPhaseName.findIndex(
                (x) => x == data?.processName
              );
              if (index != -1)
                this.listPhaseName[index] = processStep.processName;
            }
            this.dataTreeProcessStep = this.view.dataService.data;
            this.notiService.notifyCode('SYS007');
            this.changeDetectorRef.detectChanges();
          }
        });
      });
  }
  editActivity(data, processStep) {
    var index = -1;
    var indexParentOld = this.view.dataService.data.findIndex(
      (x) => x.recID == data.parentID
    );
    if (indexParentOld == -1) return;
    var phaseOld = this.view.dataService.data[indexParentOld];
    if (phaseOld?.items.length > 0) {
      index = phaseOld?.items.findIndex((x) => x.recID == data?.recID);
    }
    if (index == -1) return;
    //khong doi parent
    if (processStep.parentID == data.parentID) {
      phaseOld.items[index] = processStep;
    } else {
      // doi parent
      phaseOld.splice(index, 1);
      if (index < phaseOld.length - 1) {
        for (var i = index; i < phaseOld.length; i++) {
          phaseOld[i].stepNo--;
        }
      }
      var indexParentNew = this.view.dataService.data.findIndex(
        (x) => x.recID == processStep.parentID
      );
      if (indexParentNew != -1) {
        this.view.dataService.data[indexParentNew].items.push(processStep);
      }
    }
    this.view.dataService.data[indexParentOld] = phaseOld;
  }

  editStepChild(data, processStep) {
    if (data.parentID == processStep.parentID) {
      //khong doi parent
      if ((this.view.currentView as any)?.kanban)
        this.kanban = (this.view.currentView as any).kanban;
      this.view.dataService.data.forEach((obj) => {
        var index = -1;
        index = obj.items?.findIndex((x) => x.recID == processStep.parentID);
        if (index != -1) {
          var dataParents = obj.items[index];
          var indexChild = dataParents.items.findIndex(
            (dt) => dt.recID == processStep.recID
          );
          if (indexChild != -1) {
            dataParents.items[indexChild] = processStep;
            if (processStep?.ownersOfParent)
              dataParents.owners = processStep?.ownersOfParent;
            if (this.kanban) this.kanban.updateCard(dataParents);
            obj.items[index] = dataParents;
          }
        }
      });
    } else {
      // doi parent
      this.view.dataService.data.forEach((obj) => {
        var indexParentNew = -1;
        var indexParentOld = -1;
        indexParentOld = obj.items?.findIndex((x) => x.recID == data.parentID);
        indexParentNew = obj.items?.findIndex(
          (x) => x.recID == processStep.parentID
        );
        if (indexParentOld != -1 && indexParentNew != -1) {
          var dataParentsOld = obj.items[indexParentOld];
          var dataParentsNew = obj.items[indexParentNew];
          dataParentsOld.splice(data.stepNo - 1, 1); ///xu ly xoa nhuw the nao
          dataParentsOld.forEach((dt) => {
            if (dt.stepNo > data.stepNo) dt.stepNo--;
          });
          dataParentsNew.push(processStep);
          if (processStep?.ownersOfParent)
            dataParentsNew.owners = processStep?.ownersOfParent;

          if (this.kanban) {
            this.kanban.updateCard(dataParentsOld);
            this.kanban.updateCard(dataParentsNew);
          }
          obj.items[indexParentOld] = dataParentsOld;
          obj.items[indexParentNew] = dataParentsNew;
        }
      });
    }
  }
  copy(data) {
    this.view.dataService.dataSelected = data;
    this.view.dataService.copy().subscribe((res) => {
      if (res) {
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '550px';
        option.zIndex = 1001;
        this.dialog = this.callfc.openSide(
          PopupAddProcessStepsComponent,
          [
            'copy',
            this.titleAction,
            this.view.dataService.dataSelected?.stepType,
            this.formModelMenu,
            this.process
          ],
          option
        );
      }
      this.dialog.closed.subscribe((e) => {
        if (!e?.event) this.view.dataService.clear();
        if (e?.event == null)
          this.view.dataService.delete(
            [this.view.dataService.dataSelected],
            false
          );
        else {
          if ((this.view.currentView as any)?.kanban)
            this.kanban = (this.view.currentView as any).kanban;
          var processStep = e?.event;
          if (processStep.stepType != 'P') {
            if (processStep.stepType == 'A') {
              this.view.dataService.data.forEach((obj) => {
                if (obj.recID == processStep?.parentID) {
                  obj.items.push(processStep);
                }
              });
              if (this.kanban) this.kanban.addCard(processStep);
            } else {
              this.view.dataService.data.forEach((obj) => {
                if (obj.items.length > 0) {
                  obj.items.forEach((dt) => {
                    if (dt.recID == processStep?.parentID) {
                      dt.items.push(processStep);
                      if (this.kanban) this.kanban.updateCard(dt);
                    }
                  });
                }
              });
            }
          } else {
            if (this.kanban) {
              var column = new ColumnsModel();
              column.headerText = processStep.stepName;
              column.keyField = processStep.recID;
              column.showItemCount = false;
              let index = this.kanban?.columns?.length
                ? this.kanban?.columns?.length
                : 0;
              this.kanban.addColumn(column, index);
            }
            this.view.dataService.data.push(processStep);
            this.listPhaseName.push(processStep.stepName);
          }
          this.dataTreeProcessStep = this.view.dataService.data;
          this.changeDetectorRef.detectChanges();
        }
      });
    });
  }

  delete(data) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([data], true, (opt) => this.beforeDel(opt))
      .subscribe((res) => {
        if (res) {
          if ((this.view.currentView as any)?.kanban)
            this.kanban = (this.view.currentView as any).kanban;
          switch (data.stepType) {
            case 'P':
              if (this.kanban) {
                this.kanban.columns?.splice(data.stepNo - 1, 1);
                this.kanban.refresh();
              }
              this.view.dataService.delete(data);
              this.view.dataService.data.forEach((dt) => {
                if (dt.stepNo > data.stepNo) dt.stepNo--;
              });
              this.listPhaseName.splice(data.stepNo - 1, 1);
              break;
            case 'A':
              this.view.dataService.data.forEach((obj) => {
                var index = -1;
                if (obj.items.length > 0)
                  index = obj.items?.findIndex((x) => x.recID == data.recID);
                if (index != -1) {
                  obj.items.splice(index, 1);
                  obj.items.forEach((dt) => {
                    if (dt.stepNo > data.stepNo) dt.stepNo--;
                  });
                }
              });
              break;
            default:
              this.view.dataService.data.forEach((obj) => {
                var indexParent = -1;
                if (obj.items.length > 0) {
                  obj.items.forEach((child, crrIndex) => {
                    var index = -1;
                    if (child.items.length > 0)
                      index = child.items?.findIndex(
                        (x) => x.recID == data.recID
                      );
                    if (index != -1) {
                      child.items.splice(index, 1);
                      child.items.forEach((dt) => {
                        if (dt.stepNo > data.stepNo) dt.stepNo--;
                      });
                      indexParent = crrIndex;
                    }
                  });
                }
                if (indexParent != -1)
                  if (this.kanban)
                    this.kanban.updateCard(obj.items[indexParent]);
              });
              break;
          }

          this.dataTreeProcessStep = this.view.dataService.data;
          this.isBlockClickMoreFunction(this.dataTreeProcessStep);
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeleteProcessStepAsync';
    opt.data = itemSelected.recID;
    return true;
  }
  //#endregion

  //#region event
  click(evt: ButtonModel) {
    this.isBlockClickMoreFunction(this.dataTreeProcessStep);
    if (this.listCountPhases <= 0 && evt.id != 'P') {
      return this.notiService.notify(this.msgBP001);
    }
    if (this.listCountPhases > 0 && evt.id != 'A' && this.isBlock && evt.id != 'P' ) {
      return this.notiService.notify(this.msgBP002);
    }

    this.parentID = '';
    if (evt.id == 'btnAdd') {
      this.stepType = 'P';
      var p = this.button.items.find((x) => (x.id = this.stepType));
      if (!p) return;
      this.titleAction =
        evt.text +
        ' ' +
        p?.text.charAt(0).toLocaleLowerCase() +
        p?.text.slice(1);
      this.add();
    } else {
      this.stepType = evt.id;
      // let customName = '';
      // // this.cache.moreFunction('CoDXSystem', null).subscribe((mf) => {
      // //   if (mf) {
      // //     var mfAdd = mf.find((f) => f.functionID == 'SYS01');
      // if (this.titleAdd) customName = this.titleAdd + ' ';
      // }
      this.titleAction =
        this.titleAdd +
        ' ' +
        evt?.text.charAt(0).toLocaleLowerCase() +
        evt?.text.slice(1);
      this.add();
      // });
    }
    this.formModelMenu = this.view?.formModel;
    var funcMenu = this.childFunc.find((x) => x.id == this.stepType);

    if (funcMenu) {
      this.cache.gridView(funcMenu.gridViewName).subscribe((res) => {
        this.cache
          .gridViewSetup(funcMenu.formName, funcMenu.gridViewName)
          .subscribe((res) => {
            this.formModelMenu.formName = funcMenu.formName;
            this.formModelMenu.gridViewName = funcMenu.gridViewName;
            this.formModelMenu.funcID = funcMenu.funcID;
          });
      });
    }
  }
  hoverViewText(text) {
    return (
      this.titleAdd + ' ' + text.charAt(0).toLocaleLowerCase() + text.slice(1)
    );
  }

  receiveMF(e: any) {
    this.clickMF(e.e, e.data);
  }

  clickMF(e: any, data?: any) {
    this.stepType = data.stepType;
    this.titleAction = this.getTitleAction(e.text, data.stepType);
    //test
    this.formModelMenu = this.view?.formModel;
    var funcMenu = this.childFunc.find((x) => x.id == this.stepType);
    if (funcMenu) {
      this.cache.gridView(funcMenu.gridViewName).subscribe((res) => {
        this.cache
          .gridViewSetup(funcMenu.formName, funcMenu.gridViewName)
          .subscribe((res) => {
            this.formModelMenu.formName = funcMenu.formName;
            this.formModelMenu.gridViewName = funcMenu.gridViewName;
            this.formModelMenu.funcID = funcMenu.funcID;
          });
      });
    }
    switch (e.functionID) {
      case 'SYS01':
        this.add();
        break;
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'SYS02':
        this.delete(data);
    }
  }
  clickMenu(data, funcMenu) {
    const isdata = data.items.length;
    if (data.stepType == 'P' && funcMenu.id != 'A' && isdata <= 0) {
      return this.notiService.notify(this.msgBP001);
    } else {
      this.stepType = funcMenu.id;
      this.parentID =
        this.stepType != 'A' && data.stepType == 'P' ? '' : data.recID;
      this.titleAction = this.getTitleAction(this.titleAdd, this.stepType);
      this.formModelMenu = this.view?.formModel;
      this.add();
      if (funcMenu) {
        this.cache.gridView(funcMenu.gridViewName).subscribe((res) => {
          this.cache
            .gridViewSetup(funcMenu.formName, funcMenu.gridViewName)
            .subscribe((res) => {
              this.formModelMenu.formName = funcMenu.formName;
              this.formModelMenu.gridViewName = funcMenu.gridViewName;
              this.formModelMenu.funcID = funcMenu.funcID;
            });
        });
      }
    }
  }
  clickAddActivity(data) {
    let funcMenu = this.childFuncOfP?.find((x) => x.id == 'A');
    if (funcMenu) this.clickMenu(data, funcMenu);
  }

  getTitleAction(action, stepType): string {
    var menu = this.button.items.find((x) => x.id == stepType);
    if (!menu) return action;
    return (
      action +
      ' ' +
      menu?.text.charAt(0).toLocaleLowerCase() +
      menu?.text.slice(1)
    );
  }

  onActions(e: any) {
    switch (e.type) {
      case 'drop':
        this.onDragDrop(e.data);
        break;
      case 'drag':
        this.crrParentID = e?.data?.parentID;
        this.crrStepNo = e?.data?.stepNo;
        break;
    }
  }

  onDragDrop(data) {
    if (!this.actived) {
      data.parentID = this.crrParentID;
      return;
    }
    if (this.crrParentID == data?.parentID) return;
    this.bpService
      .updateDataDrapDrop([data?.recID, data.parentID, null]) //tam truyen stepNo null roi tính sau;
      .subscribe((res) => {
        if (res) {
          var parentOldIndex = this.view.dataService.data.findIndex(
            (x) => x.recID == this.crrParentID
          );
          if (parentOldIndex != -1) {
            var parentOld = this.view.dataService.data[parentOldIndex];
            let idx = parentOld.items?.findIndex((x) => x.recID == data?.recID);
            parentOld.items.splice(idx, 1);
            parentOld.items.forEach((obj) => {
              if (obj.stepNo > this.crrStepNo) obj.stepNo--;
            });
            this.view.dataService.update(parentOld).subscribe();
          }
          //new chua biet xu ly sao nen add vao cuoi tam
          var parentNew = this.view.dataService.data.find(
            (x) => x.recID == data.parentID
          );
          if (parentNew) {
            if (parentNew.items?.length > 0)
              data.stepNo = parentNew.items?.length + 1;
            else data.stepNo = 1;
            parentNew.items.push(data);
            this.view.dataService.update(parentOld).subscribe();
            if (this.kanban) this.kanban.updateCard(data);
          }
          this.notiService.notifyCode('SYS007');
        } else {
          this.notiService.notifyCode(' SYS021');
        }
      });
  }

  viewChanged(e) {
    // test
    if (e?.view.type == 16) {
      this.isKanban = false;
      this.dataTreeProcessStep = this.view.dataService.data;
      this.listPhaseName = [];
      this.dataTreeProcessStep.forEach((obj) => {
        this.listPhaseName.push(obj?.stepName);
      });
      this.changeDetectorRef.detectChanges();
    }
    if (e?.view.type == 6) {
      this.isKanban = true;
      if (this.kanban) (this.view.currentView as any).kanban = this.kanban;
      else this.kanban = (this.view.currentView as any).kanban;
      this.changeDetectorRef.detectChanges();
    }
  }

  //#endregion
  //view Temp drop chưa save=== làm sau
  handelChild(parentID) {
    if (parentID) this.lockParent = true;
    else this.lockParent = false;
  }

  drop(event: CdkDragDrop<string[]>, currentID) {
    if (event.previousContainer === event.container) {
      if (currentID) {
        this.dropStepChild(event, currentID);
      } else {
        this.dropPhase(event);
      }
    } else {
      this.dropChildToParent(event, currentID);
    }
  }

  dropPhase(event: CdkDragDrop<string[]>) {
    if (event.previousIndex == event.currentIndex) return;
    var ps = this.view.dataService.data[event.previousIndex];
    if (ps) {
      this.bpService
        .updateStepNo([ps.recID, event.currentIndex])
        .subscribe((res) => {
          if (res) {
            var stepNoNew = event.currentIndex + 1;
            var stepNoOld = ps.stepNo;
            this.view.dataService.data[event.previousIndex].stepNo = stepNoNew;
            if (stepNoOld > stepNoNew) {
              this.view.dataService.data.forEach((obj) => {
                if (
                  obj.recID != ps.recID &&
                  obj.stepNo >= stepNoNew &&
                  obj.stepNo < stepNoOld
                ) {
                  obj.stepNo++;
                }
              });
            } else {
              this.view.dataService.data.forEach((obj) => {
                if (
                  obj.recID != ps.recID &&
                  obj.stepNo <= stepNoNew &&
                  obj.stepNo > stepNoOld
                ) {
                  obj.stepNo--;
                }
              });
            }

            moveItemInArray(
              this.view.dataService.data,
              event.previousIndex,
              event.currentIndex
            );
            moveItemInArray(
              this.listPhaseName,
              event.previousIndex,
              event.currentIndex
            );

            this.dataTreeProcessStep = this.view.dataService.data;
            //edit kéo Phase
            if (
              this.kanban &&
              this.kanban.columns &&
              this.kanban.columns.length
            ) {
              let temp = this.kanban.columns[event.currentIndex];
              this.kanban.columns[event.currentIndex] =
                this.kanban.columns[event.previousIndex];
              this.kanban.columns[event.previousIndex] = temp;
              this.kanban.refresh();
            }
            this.notiService.notifyCode('SYS007');
            this.changeDetectorRef.detectChanges();
          } else {
            this.notiService.notifyCode(' SYS021');
          }
        });
    }
  }

  dropStepChild(event: CdkDragDrop<string[]>, currentID) {
    if (event.previousIndex == event.currentIndex) return;
    var index = this.view.dataService.data.findIndex(
      (x) => x.recID == currentID
    );
    if (index == -1) return;
    this.dataChild = this.view.dataService.data[index].items;

    var ps = this.dataChild[event.previousIndex];
    if (ps) {
      this.bpService
        .updateStepNo([ps.recID, event.currentIndex])
        .subscribe((res) => {
          if (res) {
            var stepNoNew = event.currentIndex + 1;
            var stepNoOld = ps.stepNo;
            this.dataChild[event.previousIndex].stepNo = stepNoNew;
            if (stepNoOld > stepNoNew) {
              this.dataChild.forEach((obj) => {
                if (
                  obj.recID != ps.recID &&
                  obj.stepNo >= stepNoNew &&
                  obj.stepNo < stepNoOld
                ) {
                  obj.stepNo++;
                }
              });
            } else {
              this.dataChild.forEach((obj) => {
                if (
                  obj.recID != ps.recID &&
                  obj.stepNo <= stepNoNew &&
                  obj.stepNo > stepNoOld
                ) {
                  obj.stepNo--;
                }
              });
            }
            moveItemInArray(
              this.dataChild,
              event.previousIndex,
              event.currentIndex
            );

            this.view.dataService.data[index].items = this.dataChild;
            this.dataTreeProcessStep = this.view.dataService.data;
            //up kanban
            if ((this.view.currentView as any)?.kanban)
              this.kanban = (this.view.currentView as any).kanban;
            if (this.kanban) {
              this.dataChild.forEach((obj) => {
                this.kanban.updateCard(obj);
              });
            }

            this.notiService.notifyCode('SYS007');
            this.changeDetectorRef.detectChanges();
          } else {
            this.notiService.notifyCode(' SYS021');
          }
        });
    }
  }

  dropChildToParent(event: CdkDragDrop<string[]>, crrParentID) {
    var psMoved = event.item?.data;

    var indexPrevious = this.view.dataService.data.findIndex(
      (x) => x.recID == psMoved.parentID
    );
    if (indexPrevious == -1) return;
    var previousDataChild = this.view.dataService.data[indexPrevious].items;

    var indexCrr = this.view.dataService.data.findIndex(
      (x) => x.recID == crrParentID
    );
    if (indexCrr == -1) return;
    var crrDataChild = this.view.dataService.data[indexCrr].items;
    var stepNoNew = crrDataChild.length > 0 ? event.currentIndex + 1 : 1;
    var stepNoOld = psMoved.stepNo;

    if (psMoved) {
      this.bpService
        .updateDataDrapDrop([psMoved?.recID, crrParentID, stepNoNew])
        .subscribe((res) => {
          if (res) {
            psMoved.parentID = crrParentID;
            psMoved.stepNo = stepNoNew;

            previousDataChild.splice(event.previousIndex, 1);
            if (previousDataChild.length > 0) {
              previousDataChild.forEach((obj) => {
                if (obj.stepNo > stepNoOld) {
                  obj.stepNo--;
                }
              });
            }
            if (crrDataChild.length > 0) {
              crrDataChild.forEach((obj) => {
                if (obj.stepNo >= stepNoNew) {
                  obj.stepNo++;
                }
              });
            }

            crrDataChild.push(psMoved);
            crrDataChild.sort(function (a, b) {
              return a.stepNo - b.stepNo;
            });

            this.view.dataService.data[indexPrevious].items = previousDataChild;
            this.view.dataService.data[indexCrr].items = crrDataChild;
            this.dataTreeProcessStep = this.view.dataService.data;

            //up kanban
            if ((this.view.currentView as any)?.kanban)
              this.kanban = (this.view.currentView as any).kanban;
            if (this.kanban) {
              var arrDataUpdate = previousDataChild.concat(crrDataChild);
              arrDataUpdate.forEach((obj) => {
                this.kanban.updateCard(obj);
              });
            }

            // transferArrayItem(
            //   event.previousContainer.data,
            //   event.container.data,
            //   event.previousIndex,
            //   event.currentIndex
            // );
            this.notiService.notifyCode('SYS007');
            this.changeDetectorRef.detectChanges();
          } else {
            this.notiService.notifyCode(' SYS021');
          }
        });
    }
  }

  checkAttachment(data) {
    if (data?.attachments > 0) return true;
    if (data?.items && data?.items.length > 0) {
      var check = false;
      data?.items.forEach((obj) => {
        if (obj.attachments > 0) check = true;
      });
      return check;
    }
    return false;
  }

  getOwnerID(listOwner) {
    var arrOwner = listOwner.map(function (obj) {
      return obj?.objectID;
    });
    return arrOwner.join(';');
  }

  getFlowChart(process) {
    let paras = [
      '',
      this.funcID,
      process?.recID,
      'BP_Processes',
      'inline',
      1000,
      process?.processName,
      'Flowchart',
      false,
    ];
    this.api
      .execSv<any>('DM', 'DM', 'FileBussiness', 'GetAvatarAsync', paras)
      .subscribe((res) => {
        if (res && res?.url) {
          let obj = { pathDisk: res?.url, fileName: process?.processName };
          this.dataFile = obj;
          this.changeDetectorRef.detectChanges();
        }
      });
  }
  async addFile(evt: any) {
    this.addFlowchart.referType = 'Flowchart';
    this.addFlowchart.uploadFile();
  }

  fileSave(e) {
    if (e && typeof e === 'object') {
      this.dataFile = e;
      this.changeDetectorRef.detectChanges();
    }
  }

  showIconByStepType(stepType) {
    var type = this.button?.items.find((x) => x.id == stepType);
    return type?.icon;
  }
  checkReferencesByStepType(data, stepType): boolean {
    if (!data?.items || data?.items?.length == 0) return false;
    let checkList = [];
    data?.items.forEach((x) => {
      if (x.stepType == stepType) checkList.push(x);
    });
    let check = checkList.length > 0;
    return check;
  }

  checkAction(data): boolean {
    if (!data?.items || data?.items?.length == 0) return false;
    let checkList = [];
    data?.items.forEach((x) => {
      if (x.stepType != 'C' && x.stepType != 'Q' && x.stepType != 'M')
        checkList.push(x);
    });
    let check = checkList.length > 0;
    return check;
  }

  openMoreFunction(data, p) {
    if (!data) {
      p.close();
      return;
    }
    if (p?.isOpen) p.close();
    p.open();
  }

  print() {
    if (this.linkFile) {
      const output = document.getElementById('output');
      const img = document.createElement('img');
      img.src = this.linkFile;
      output.appendChild(img);
      const br = document.createElement('br');
      output.appendChild(br);
      window.print();

      document.body.removeChild(output);
    } else
      window.frames[0].postMessage(
        JSON.stringify({ MessageId: 'Action_Print' }),
        '*'
      );
  }

  checkDownloadRight() {
    return this.dataFile.download;
  }
  async download(): Promise<void> {
    var id = this.dataFile?.recID;
    var fullName = this.dataFile.fileName;
    var that = this;

    if (this.checkDownloadRight()) {
      ///lấy hàm của chung dang fail
      this.fileService.downloadFile(id).subscribe(async (res) => {
        if (res) {
          let blob = await fetch(res).then((r) => r.blob());
          let url = window.URL.createObjectURL(blob);
          var link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', fullName);
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });
    } else {
      this.notiService.notifyCode('SYS018');
    }
  }

  isBlockClickMoreFunction(listData){
    const check = listData.length>0?true:false;
    if(check){
      this.listCountPhases = listData.length;
      this.isBlock=true;
      listData.forEach(x=>{
          if(x.items.length >0) {
            this.isBlock=false;
          }
      })
    }
    else {
      this.listCountPhases = listData.length;
      this.isBlock=true;
    }
  }
}
