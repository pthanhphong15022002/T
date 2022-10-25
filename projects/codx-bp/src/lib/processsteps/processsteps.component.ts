import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
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
  RequestOption,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
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

  constructor(
    inject: Injector,
    private bpService: CodxBpService,
    private layout: LayoutService,
    private changeDetectorRef: ChangeDetectorRef,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];

    this.bpService.viewProcesses.subscribe((res) => (this.process = res));
    this.dataObj = { processID: this.process?.recID };

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

    //tam test
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
        option.Width = 'Auto';
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
        option.Width = 'Auto';
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
      });
    });
  }

  delete(data) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([data], true, (opt) => this.beforeDel(opt))
      .subscribe((res) => {
        if (res) {
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
          var mfAdd = mf.find(f=>f.functionID=='SYS01') ;
          if(mfAdd)
          customName = mfAdd?.customName + ' ';
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
    this.api
      .exec('BP', 'ProcessStepsBusiness', 'UpdateProcessStepWithKanbanAsync')
      .subscribe((res) => {
        if (res) {
          this.view.dataService.update(data);
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
  //view Temp drop
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.dataTreeProcessStep,
      event.previousIndex,
      event.currentIndex
    );
  }

  dropStepChild(event: CdkDragDrop<string[]>, parentID) {
    var index = this.data.findIndex((x) => x.id == parentID);
    this.dataChild = this.data[index].items;
    moveItemInArray(this.dataChild, event.previousIndex, event.currentIndex);
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
}
