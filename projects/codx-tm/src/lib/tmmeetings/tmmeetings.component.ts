import { CodxTMService } from './../codx-tm.service';
import { Component, Injector, OnInit, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthStore, ButtonModel, DataRequest, DialogRef, RequestOption, ResourceModel, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { PopupAddMeetingComponent } from './popup-add-meeting/popup-add-meeting.component';
import { Resources } from '../models/CO_Meetings.model';
import { MeetingDetailComponent } from './meeting-detail/meeting-detail.component';

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
  month: any;
  day: any;
  startTime: any;
  eventStatus: any;
  itemSelected: any;
  user: any;
  funcID: string;
  gridView: any;
  param: any;
  resources: Resources[] = [];
  resourceID: any;
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

  receiveMF(e: any) {
    this.clickMF(e.e, e.data);
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
        type: ViewType.card,
        active: true,
        sameData: true,
        model: {
          // panelLeftRef: this.panelLeftRef,
          template: this.cardKanban,
        }
      },
    ]

    this.view.dataService.methodSave = 'AddMeetingsAsync';
    this.view.dataService.methodUpdate = 'UpdateMeetingsAsync';
    this.view.dataService.methodDelete = 'DeleteMeetingsAsync';

    this.dt.detectChanges();

  }

  convertHtmlAgency(resourceID: any) {
    var desc = '<div class="d-flex">';
    if (resourceID)
      desc += '<codx-imgs [objectId]="getResourceID('+resourceID+')" objectType="AD_Users" [numberImages]="4"></codx-imgs>';

    return desc + '</div>';
  }

  getResourceID(data) {
    var resources = [];
    resources = data.resources;
    var id= '';

    resources.forEach((e)=>{
      id += e.resourceID + ';';
    });
    if(id!=''){
      this.resourceID = id.substring(0, id.length - 1);
    }
    return this.resourceID;
  }

  getDate(data) {
    if (data.startDate) {
      var date = new Date(data.startDate);
      this.month = this.addZero(date.getMonth() + 1);
      this.day = this.addZero(date.getDate());
      var endDate = new Date(data.endDate);
      let start = this.addZero(date.getHours()) + ':' + this.addZero(date.getMinutes());
      let end = this.addZero(endDate.getHours()) + ':' + this.addZero(endDate.getMinutes());
      this.startTime = start + ' - ' + end;
    }
    return this.startTime;
  }

  addZero(i){
    if(i<10){
      i = '0' + i;
    }
    return i;
  }

  clickMF(e: any, data?: any) {
    this.itemSelected = data;
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
        break;
      case 'TMT05011':
        this.viewDetail(data);
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
      option.Width = 'Auto';
      this.dialog = this.callfc.openSide(PopupAddMeetingComponent, 'add', option);

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
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.currentView?.formModel;
        option.Width = 'Auto';
        this.dialog = this.callfc.openSide(
          PopupAddMeetingComponent,
          'edit',
          option
        );
        this.dialog.closed.subscribe((e) => {
          if (e?.event == null)
            this.view.dataService.delete(
              [this.view.dataService.dataSelected],
              false
            );
          if (e?.event && e?.event != null) {
            e?.event.forEach((obj) => {
              this.view.dataService.update(obj).subscribe();
            });
            this.itemSelected = e?.event[0];
          }
          this.detectorRef.detectChanges();
        });
      });
  }
  copy(data) {

  }
  delete(data) {
    this.view.dataService.dataSelected = data;
    this.view.dataService.delete([this.view.dataService.dataSelected] , true ,(opt,) =>
      this.beforeDel(opt)).subscribe((res) => {
        if (res[0]) {
          this.itemSelected = this.view.dataService.data[0];
        }
      }
      );
  }

  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeleteMeetingsAsync';

    opt.data = itemSelected.meetingID;
    return true;
  }

  viewDetail(data){
    this.view.dataService.dataSelected = data;
    var vllControlShare = 'TM003';
    var vllRose = 'TM001';
    let option = new SidebarModel();
    option.DataService = this.view?.dataService;
    option.FormModel = this.view?.formModel;
    option.Width = '800px';
    this.dialog = this.callfc.openSide(
      MeetingDetailComponent,
      [this.view.dataService.dataSelected, vllControlShare, vllRose],
      option
    );
    this.dialog.closed.subscribe((e) => {
      if (e?.event == null)
        this.view.dataService.delete(
          [this.view.dataService.dataSelected],
          false
        );
      if (e?.event && e?.event != null) {
        let listTask = e?.event;
        let newTasks = [];
        for (var i = 0; i < listTask.length; i++) {
          if (listTask[i].taskID == data.taskID) {
            this.view.dataService.update(listTask[i]).subscribe();
            this.view.dataService.setDataSelected(e?.event[0]);
          } else newTasks.push(listTask[i]);
        }
        if (newTasks.length > 0) {
          this.view.dataService.data = newTasks.concat(
            this.dialog.dataService.data
          );
          this.view.dataService.afterSave.next(newTasks);
        }
        this.detectorRef.detectChanges();
      }
    });
  }
}
