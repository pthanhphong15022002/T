import { CodxTMService } from './../codx-tm.service';
import { Component, Injector, OnInit, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthStore, ButtonModel, DataRequest, DialogRef, ResourceModel, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { PopupAddMeetingComponent } from './popup-add-meeting/popup-add-meeting.component';

@Component({
  selector: 'lib-tmmeetings',
  templateUrl: './tmmeetings.component.html',
  styleUrls: ['./tmmeetings.component.css']
})
export class TMMeetingsComponent extends UIComponent {

  @ViewChild('panelRight') panelRight?: TemplateRef<any>;
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;
  // @ViewChild('sprintsListTasks') sprintsListTasks: TemplateRef<any> | null;
  // @ViewChild('sprintsKanban') sprintsKanban: TemplateRef<any> | null;
  @ViewChild('cellTemplate') cellTemplate: TemplateRef<any>;
  @ViewChild('eventTemplate') eventTemplate: TemplateRef<any> | null;
  @ViewChild('itemTemplate') template!: TemplateRef<any> | null;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;
  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;

  views: Array<ViewModel> = [];
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  model?: DataRequest;
  resourceKanban?: ResourceModel;
  modelResource: ResourceModel;
  dialog!: DialogRef;
  selectedDate = new Date();
  startDate: Date;
  endDate: Date;
  dayoff = [];

  eventStatus: any;
  itemSelected: any;
  user: any;
  funcID: string;
  gridView: any;
  param: any
  constructor(inject: Injector,
    private dt: ChangeDetectorRef,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private tmService: CodxTMService) {
    super(inject);
    this.user = this.authStore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.list,
        active: false,
        sameData: true,
        model: {
          template: this.itemViewList,
        },
      },
      {
        type: ViewType.content,
        active: false,
        sameData: true,
        model: {
          panelLeftRef: this.templateLeft,
        },
      },
      {
        type: ViewType.kanban,
        active: false,
        sameData: true,
        request2: this.resourceKanban,
        model: {
          template: this.cardKanban,
        },
      },
    ]

    this.view.dataService.methodSave = 'AddMeetingsAsync';

    this.dt.detectChanges();

  }
  clickMF(e: any, data?: any) {
    this.itemSelected = data;
    switch (e.functionID) {
      case 'btnAdd':
        this.add();
        break;
      case 'edit':
        this.edit(data);
        break;
      case 'copy':
        this.copy(data);
        break;
      case 'delete':
        this.delete(data);
        break;
    }
  }

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }

  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '800px';
      this.dialog = this.callfc.openSide(PopupAddMeetingComponent, 'add', option);

    });
  }
  edit(data) {

  }
  copy(data) {

  }
  delete(data) {

  }
}
