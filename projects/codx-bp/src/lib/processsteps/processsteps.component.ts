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
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  ButtonModel,
  DataRequest,
  DialogRef,
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
import { CodxBpService } from '../codx-bp.service';
import {
  BP_Processes,
  BP_ProcessOwners,
  BP_ProcessSteps,
} from '../models/BP_Processes.model';
import { PopupAddProcessStepsComponent } from './popup-add-process-steps/popup-add-process-steps.component';

@Component({
  selector: 'lib-processsteps',
  templateUrl: './processsteps.component.html',
  styleUrls: ['./processsteps.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProcessStepsComponent extends UIComponent implements OnInit {
  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;
  @ViewChild('panelRight') panelRight?: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;
  process?: BP_Processes;
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
  // method :any
  method = 'GetProcessStepsAsync';
  listPhaseName = [];

  recIDProcess = '90ab82ac-43d1-11ed-83e7-d493900707c4'; ///thêm để add thử
  // test data tra ve la  1 []
  dataTreeProcessStep = [];
  urlBack = '/bp/processes/BPT1'; //gang tam
  data: any; //them de test
  //view file
  dataChild = [];
  lockParent = false;

  constructor(
    inject: Injector,
    private bpService: CodxBpService,
    private layout: LayoutService,
    private changeDetectorRef: ChangeDetectorRef,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private notiService: NotificationsService
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];

    this.bpService.viewProcesses.subscribe((res) => (this.process = res));
    this.dataObj = {
      processID: this.process?.recID ? this.process?.recID : '',
    };

    this.dataObj = { processID: this.recIDProcess }; //tesst

    this.layout.setUrl(this.urlBack);
    this.layout.setLogo(null);
    if (!this.dataObj?.processID) {
      this.codxService.navigate('', this.urlBack);
    }
  }

  onInit(): void {
    this.request = new ResourceModel();
    this.request.service = 'BP';
    this.request.assemblyName = 'BP';
    this.request.className = 'ProcessStepsBusiness';
    // this.request.method = 'GetProcessStepsAsync';
    this.request.method = 'GetProcessStepsWithKanbanAsync';
    this.request.idField = 'recID';
    this.request.dataObj = { isKanban: '1' }; ///de test

    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'BP';
    this.resourceKanban.assemblyName = 'BP';
    this.resourceKanban.className = 'ProcessStepsBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';
    this.resourceKanban.dataObj = this.dataObj;

    this.bpService
      .getListFunctionMenuCreatedStepAsync(this.funcID)
      .subscribe((datas) => {
        var items = [];
        if (datas && datas.length > 0) {
          items = datas;
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
    ];

    this.view.dataService.methodSave = 'AddProcessStepAsync';
    this.view.dataService.methodUpdate = 'UpdateProcessStepAsync';
    this.view.dataService.methodDelete = 'DeleteProcessStepAsync';
    this.changeDetectorRef.detectChanges();
  }

  //#region CRUD bước công việc
  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';

      this.view.dataService.dataSelected.processID = this.recIDProcess;
      this.dialog = this.callfc.openSide(
        PopupAddProcessStepsComponent,
        ['add', this.titleAction, this.stepType],
        option
      );
      this.dialog.closed.subscribe((e) => {
        if (e?.event == null)
          this.view.dataService.delete(
            [this.view.dataService.dataSelected],
            false
          );
        else {
          var processStep = e?.event;
          if (processStep.stepType != 'P') {
            if (processStep.stepType == 'A') {
              this.view.dataService.data.forEach((obj) => {
                if (obj.recID == processStep?.parentID) {
                  obj.items.push(processStep);
                }
              });
            } else {
              this.view.dataService.data.forEach((obj) => {
                if (obj.items.length > 0) {
                  obj.items.forEach((dt) => {
                    if (dt.recID == processStep?.parentID) {
                      dt.items.push(processStep);
                    }
                  });
                }
              });
            }
          } else {
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
          ],
          option
        );
        this.dialog.closed.subscribe((e) => {
          if (e?.event == null)
            this.view.dataService.delete(
              [this.view.dataService.dataSelected],
              false
            );
          else {
            var processStep = e?.event;
            if (data.items?.length > 0) processStep.items = data.items;
            var index = -1;
            if (processStep.stepType != 'P') {
              //edit activity
              if (processStep.stepType == 'A') {
                var parentIndexOld = this.view.dataService.data.findIndex(
                  (x) => x.recID == data.parentID
                );
                if (parentIndexOld == -1) return;
                var phaseOld = this.view.dataService.data[parentIndexOld];
                if (phaseOld?.items.length > 0) {
                  index = phaseOld?.items.findIndex(
                    (x) => x.recID == data?.recID
                  );
                }
                if (index == -1) return;
                //khong doi parent
                if (processStep.parentID == data.parentID) {
                  phaseOld.items[index] = processStep;
                } else {
                  // doi parent
                  phaseOld.splice(index,1)
                  if(index<phaseOld.length-1){
                    for(var i= index ;i< phaseOld.length ;i++){
                      phaseOld[i].stepNo--
                    }
                  }
                  var parentIndexNew = this.view.dataService.data.findIndex(
                    (x) => x.recID == processStep.parentID
                  );
                  if (parentIndexNew != -1){
                    this.view.dataService.data[parentIndexNew].items.push(processStep);
                  }

                }
                this.view.dataService.data[parentIndexOld] = phaseOld;
              } else {
                //edit !P !A hơi bị nhằn  xem đổi công đoạn không đổi là nhằn thấy mẹ gọi lại hàm load tree luôn
              }
            } else {
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
          ],
          option
        );
      }
      this.dialog.closed.subscribe((e) => {
        if (e?.event == null)
          this.view.dataService.delete(
            [this.view.dataService.dataSelected],
            false
          );
          else {
            var processStep = e?.event;
            if (processStep.stepType != 'P') {
              if (processStep.stepType == 'A') {
                this.view.dataService.data.forEach((obj) => {
                  if (obj.recID == processStep?.parentID) {
                    obj.items.push(processStep);
                  }
                });
              } else {
                this.view.dataService.data.forEach((obj) => {
                  if (obj.items.length > 0) {
                    obj.items.forEach((dt) => {
                      if (dt.recID == processStep?.parentID) {
                        dt.items.push(processStep);
                      }
                    });
                  }
                });
              }
            } else {
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
          switch (data.stepType) {
            case 'P':
              this.view.dataService.delete(data);
              this.listPhaseName.splice(data.stepNo - 1, 1);
              break;
            case 'A':
              this.view.dataService.data.forEach((obj) => {
                var index = -1;
                if (obj.items.length > 0)
                  index = obj.items?.findIndex((x) => x.recID == data.recID);
                if (index != -1) obj.items.splice(index, 1);
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
  }

  receiveMF(e: any) {
    this.clickMF(e.e, e.data);
  }

  clickMF(e: any, data?: any) {
    this.itemSelected = data;
    this.titleAction = e.text;
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

  onActions(e: any) {
    switch (e.type) {
      case 'drop':
        this.onDragDrop(e.data);
        break;
    }
  }

  onDragDrop(data) {
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
    var ps = this.dataTreeProcessStep[event.previousIndex];
    if (ps) {
      this.bpService
        .updateStepNo([ps.recID, event.currentIndex])
        .subscribe((res) => {
          if (res) {
            var stepNoNew = event.currentIndex + 1;
            var stepNoOld = ps.stepNo;
            this.dataTreeProcessStep[event.previousIndex].stepNo = stepNoNew;
            if (stepNoOld > stepNoNew) {
              this.dataTreeProcessStep.forEach((obj) => {
                if (
                  obj.recID != ps.recID &&
                  obj.stepNo >= stepNoNew &&
                  obj.stepNo < stepNoOld
                ) {
                  obj.stepNo++;
                }
              });
            } else {
              this.dataTreeProcessStep.forEach((obj) => {
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
              this.dataTreeProcessStep,
              event.previousIndex,
              event.currentIndex
            );
            moveItemInArray(
              this.listPhaseName,
              event.previousIndex,
              event.currentIndex
            );

            this.view.dataService.data = this.dataTreeProcessStep;
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
    var index = this.dataTreeProcessStep.findIndex((x) => x.recID == currentID);
    if (index == -1) return;
    this.dataChild = this.dataTreeProcessStep[index].items;

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

            this.dataTreeProcessStep[index].items = this.dataChild;
            this.view.dataService.data = this.dataTreeProcessStep;

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

    var indexPrevious = this.dataTreeProcessStep.findIndex(
      (x) => x.recID == psMoved.parentID
    );
    if (indexPrevious == -1) return;
    var previousDataChild = this.dataTreeProcessStep[indexPrevious].items;

    var indexCrr = this.dataTreeProcessStep.findIndex(
      (x) => x.recID == crrParentID
    );
    if (indexCrr == -1) return;
    var crrDataChild = this.dataTreeProcessStep[indexCrr].items;
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

            this.dataTreeProcessStep[indexPrevious].items = previousDataChild;
            this.dataTreeProcessStep[indexCrr].items = crrDataChild;
            this.view.dataService.data = this.dataTreeProcessStep;

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
    if (data?.items.length > 0) {
      var check = false;
      data?.items.forEach((obj) => {
        if (obj.attachments > 0) check = true;
      });
      return check;
    }
    return false;
  }

  getOwnerID(listOwner) {
    // var arrOwner = [];
    // listOwner.forEach((x) => arrOwner.push(x?.objectID));
    var arrOwner = listOwner.map(function (obj) {
      return obj?.objectID;
    });
    return arrOwner.join(';');
  }
}
