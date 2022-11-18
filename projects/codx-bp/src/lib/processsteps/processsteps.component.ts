import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { I, V } from '@angular/cdk/keycodes';
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
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileService } from '@shared/services/file.service';
import { DayMarkers } from '@syncfusion/ej2-gantt';
import {
  AuthStore,
  ButtonModel,
  DataRequest,
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
  @Input() process?: BP_Processes;
  @Input() viewMode = '6';
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
  funcID: any;
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
  data: any; //them de test
  //view file
  dataChild = [];
  lockParent = false;
  childFunc = [];
  formModelMenu: FormModel;
  vllInterval = 'VL004';
  dataFile: any;
  crrParentID = '';
  kanban: any;
  checkList = [];

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
    // this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.activedRouter.params.subscribe((res) => {
      this.funcID = res.funcID;
      this.processID = res.processID;
    });

    this.bpService.viewProcesses.subscribe((res) => {
      this.process = res;
      this.processID = this.process?.recID ? this.process?.recID : '';
      this.numberColums = this.process?.phases ? this.process?.phases : 0;
      this.dataObj = {
        processID: this.processID,
      };
      this.layout.setUrl(this.urlBack);
      this.layout.setLogo(null);
      if (!this.processID) {
        this.codxService.navigate('', this.urlBack);
      }
      this.getFlowChart(this.process?.recID);

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
    });
  }

  onInit(): void {
    this.bpService
      .getListFunctionMenuCreatedStepAsync(this.funcID)
      .subscribe((datas) => {
        var items = [];
        if (datas && datas.length > 0) {
          this.childFunc = datas;
          items = datas.map((obj) => {
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
      });
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: false,
        sameData: false,
        model: {
          panelRightRef: this.itemViewList,
        },
      },
      {
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
        type: ViewType.content,
        active: false,
        sameData: false,
        icon: 'icon-bubble_chart',
        text: 'Flowchart',
        model: {
          panelRightRef: this.flowChart,
        },
      },
    ];

    this.view.dataService.methodSave = 'AddProcessStepAsync';
    this.view.dataService.methodUpdate = 'UpdateProcessStepAsync';
    this.view.dataService.methodDelete = 'DeleteProcessStepAsync';

    // this.changeDetectorRef.detectChanges();
  }

  //#region CRUD bước công việc
  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      //option.FormModel = this.formModel;
      option.Width = '550px';

      this.view.dataService.dataSelected.processID = this.processID;
      this.dialog = this.callfc.openSide(
        PopupAddProcessStepsComponent,
        ['add', this.titleAction, this.stepType, this.formModelMenu],
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
        this.dialog = this.callfc.openSide(
          PopupAddProcessStepsComponent,
          [
            'edit',
            this.titleAction,
            this.view.dataService.dataSelected?.stepType,
            this.formModelMenu,
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
          // this.bpService.getOwnersByParentID(processStep.parentID).subscribe(res=>{
          //   if(res){
          //     dataParents.owners= res
          //   }
          if (this.kanban) this.kanban.updateCard(dataParents);
          // })
          obj.items[index] = dataParents;
        }
      }
    });

    // doi parent hoir laji thuong
  }

  copy(data) {
    this.view.dataService.dataSelected = data;
    this.view.dataService.copy().subscribe((res) => {
      if (res) {
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '550px';
        this.dialog = this.callfc.openSide(
          PopupAddProcessStepsComponent,
          [
            'copy',
            this.titleAction,
            this.view.dataService.dataSelected?.stepType,
            this.formModelMenu,
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
                  if (this.kanban) this.kanban.removeCard(obj.items[index]);
                  obj.items.splice(index, 1);
                  obj.items.forEach((dt) => {
                    if (dt.stepNo > data.stepNo) dt.stepNo--;
                  });
                }
              });
              break;
            default:
              this.view.dataService.data.forEach((obj) => {
                var index = -1;
                if (obj.items.length > 0)
                  obj.items.forEach((child) => {
                    if (child.items.length > 0)
                      index = child.items?.findIndex(
                        (x) => x.recID == data.recID
                      );
                    if (index != -1) {
                      child.items.splice(index, 1);
                      if (this.kanban) this.kanban.updateCard(obj.items[index]);
                      child.items.forEach((dt) => {
                        if (dt.stepNo > data.stepNo) dt.stepNo--;
                      });
                      index = -1;
                    }
                  });
              });
              break;
          }

          this.dataTreeProcessStep = this.view.dataService.data;
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
      var customName = '';
      this.cache.moreFunction('CoDXSystem', null).subscribe((mf) => {
        if (mf) {
          var mfAdd = mf.find((f) => f.functionID == 'SYS01');
          if (mfAdd) customName = mfAdd?.customName + ' ';
        }
        this.titleAction =
          customName +
          evt?.text.charAt(0).toLocaleLowerCase() +
          evt?.text.slice(1);
        this.add();
      });
    }

    // test
    this.formModelMenu = this.view?.formModel;
    debugger;
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

  receiveMF(e: any) {
    this.clickMF(e.e, e.data);
  }

  clickMF(e: any, data?: any) {
    this.itemSelected = data;
    this.titleAction = this.getTitleAction(e.text, data.stepType);
    //test
    this.formModelMenu = this.view?.formModel;
    var funcMenu = this.childFunc.find((x) => x.id == this.stepType);
    if (funcMenu) {
      this.formModelMenu.formName = funcMenu.formName;
      this.formModelMenu.gridViewName = funcMenu.gridViewName;
      this.formModelMenu.funcID = funcMenu.funcID;
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
        break;
    }
  }

  onDragDrop(data) {
    if (this.crrParentID == data?.parentID) return;
    this.bpService
      .updateDataDrapDrop([data?.recID, data.parentID, null]) //tam truyen stepNo null roi tính sau;
      .subscribe((res) => {
        if (res) {
          ///xử lý sau
          this.notiService.notifyCode('SYS007');
        } else {
          this.notiService.notifyCode(' SYS021');
        }
      });
  }

  viewChanged(e) {
    // test
    if (e?.view.type == 16) {
      this.dataTreeProcessStep = this.view.dataService.data;
      this.listPhaseName = [];
      this.dataTreeProcessStep.forEach((obj) => {
        this.listPhaseName.push(obj?.stepName);
      });
      this.changeDetectorRef.detectChanges();
    }
    if (e?.view.type == 6) {
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
  //test data flow chart 636341e8e82afdc6f9a4ab54
  getFlowChart(recID) {
    this.fileService.getFile('636341e8e82afdc6f9a4ab54').subscribe((data) => {
      if (data) this.dataFile = data;
    });
    // this.api.exec<any>("DM","FileBussiness","GetFileByObjectIDAsync",[this.process?.recID,"BP_Processes"]).subscribe(res=>{
    //   let arrFlowChart = []
    //   if(res&& res.length> 0){
    //     arrFlowChart = res.map(x=>{if(x.referType="Flowchart") return x})
    //   }
    //   if(arrFlowChart.length>0){
    //     if(arrFlowChart.length==1){
    //       this.dataFile = arrFlowChart[0];
    //       return
    //     }
    //     arrFlowChart = arrFlowChart.sort((a,b) => moment(b.createdOn).valueOf() - moment(a.createdOn).valueOf())
    //     this.dataFile = arrFlowChart[0];
    //     return
    //   }
    // })
  }
  async addFile(evt: any) {
    this.addFlowchart.referType = 'Flowchart';
    this.addFlowchart.uploadFile();
  }
  fileAdded(e) {
    if (e && e?.data?.length > 0) {
      this.dataFile = e.data[0];
      let flowchart = this.dataFile.recID;
    }
    this.changeDetectorRef.detectChanges();
  }

  getfileCount(e) {}

  showIconByStepType(stepType) {
    var type = this.button?.items.find((x) => x.id == stepType);
    return type?.icon;
  }
  checkReferencesByStepType(data, stepType): boolean {
    if (!data?.items || data?.items?.length == 0) return false;
    this.checkList = data?.items.map((x) => {
      if (x.stepType == stepType) return x;
    });
    let check = this.checkList.length > 0;
    return check;
  }

  checkAction(data): boolean {
    if (!data?.items || data?.items?.length == 0) return false;
    this.checkList = data?.items.map((x) => {
      if (x.stepType != 'C' && x.stepType != 'Q' && x.stepType != 'M') return x;
    });
    let check = this.checkList.length > 0;
    return check;
  }
}
