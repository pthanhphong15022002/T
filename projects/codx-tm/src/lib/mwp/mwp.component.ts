import { AuthStore, ButtonModel, DialogRef, ResourceModel, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef, Injector, ChangeDetectorRef, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PopupAddComponent } from '../tasks/popup-add/popup-add.component';

@Component({
  selector: 'lib-mwp',
  templateUrl: './mwp.component.html',
  styleUrls: ['./mwp.component.css']
})
export class MwpComponent extends UIComponent {

  @ViewChild('panelRight') panelRight?: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;
  @ViewChild('eventTemplate') eventTemplate: TemplateRef<any>;
  @ViewChild('eventModel') eventModel?: TemplateRef<any>;
  @ViewChild('cellTemplate') cellTemplate: TemplateRef<any>;
  @Input() calendarID: string;

  @Input() viewPreset: string = 'weekAndDay';
  views: Array<ViewModel> = [];
  user: any;
  dataValue = '1';
  predicate = 'Owner=@0';
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  itemSelected: any;
  resourceKanban?: ResourceModel;
  modelResource: ResourceModel;
  funcID: string;
  dayoff = [];
  isAssignTask =false ;
  dialog!: DialogRef;


  constructor(
    private authStore: AuthStore,
    private inject: Injector,
    private activedRouter: ActivatedRoute,
    private dt: ChangeDetectorRef,

  ) {
    super(inject);
    this.user = this.authStore.get();
    this.dataValue = this.user.userID;
    //this.funcID = "WPT036";

    this.funcID = this.activedRouter.snapshot.params['funcID'];
    if(this.funcID=='TMT03') this.isAssignTask=true ;
  }

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        // this.add();
        break;
    }
  }

  clickMF(e: any, data?: any) {
    switch (e.functionID) {
      case 'btnAdd':
        this.add();
        break;
      case 'edit':
        // this.edit(data);
        break;
      case 'copy':
        // this.copy(data);
        break;
      case 'delete':
        // this.delete(data);
        break;

    }
  }

  onInit(): void {
    this.modelResource = new ResourceModel();
    this.modelResource.assemblyName = 'TM';
    this.modelResource.className = 'TaskBusiness';
    this.modelResource.service = 'TM';
    this.modelResource.method = 'GetUserByTasksAsync';

    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'TM';
    this.resourceKanban.assemblyName = 'TM';
    this.resourceKanban.className = 'TaskBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';
    
    this.button = {
      id: 'btnAdd',
    };

    this.moreFuncs = [
      {
        id: 'edit',
        icon: 'icon-list-checkbox',
        text: 'Sửa',
      },
      {
        id: 'btnMF2',
        icon: 'icon-list-checkbox',
        text: 'more 2',
      },
    ];
    this.getParams();
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.list,
        active: false,
        sameData: true,
        model: {
          template: this.itemTemplate,
        },
      },
      {
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.panelRight,
        },
      },
      {
        type: ViewType.kanban,
        sameData: true,
        active: false,
        request2: this.resourceKanban,
        model: {
          template: this.cardKanban,
        },
      },
      {
        type: ViewType.schedule,
        sameData: true,
        active: false,
        request2: this.modelResource,
        model: {
          eventModel: this.fields,
          resourceModel: this.resourceField,
          template: this.eventTemplate,
          template3: this.cellTemplate,
        },
      },
    ]

    this.dt.detectChanges();

  }

  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '750px';
      this.dialog = this.callfc.openSide(
        PopupAddComponent,
        [this.view.dataService.dataSelected, 'add',this.isAssignTask],
        option
      );
      this.dialog.closed.subscribe((e) => {
        console.log(e);
      });
    });
  }

  //#region schedule

  fields = {
    id: 'taskID',
    subject: { name: 'taskName' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
    resourceId: { name: 'userID' },
  };
  resourceField = {
    Name: 'Resources',
    Field: 'userID',
    IdField: 'userID',
    TextField: 'userName',
    Title: 'Resources',
  };

  

  getCellContent(evt: any) {
    if (this.dayoff.length > 0) {
      for (let i = 0; i < this.dayoff.length; i++) {
        let day = new Date(this.dayoff[i].startDate);
        if (
          day &&
          evt.getFullYear() == day.getFullYear() &&
          evt.getMonth() == day.getMonth() &&
          evt.getDate() == day.getDate()
        ) {
          var time = evt.getTime();
          var ele = document.querySelectorAll('[data-date="' + time + '"]');
          if (ele.length > 0) {
            ele.forEach((item) => {
              (item as any).style.backgroundColor = this.dayoff[i].color;
            });
          }
          return (
            '<icon class="' +
            this.dayoff[i].symbol +
            '"></icon>' +
            '<span>' +
            this.dayoff[i].note +
            '</span>'
          );
        }
      }
    }

    return ``;
  }

  getParams() {
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.CM',
        'ParametersBusiness',
        'GetOneField',
        ['TM_Parameters', null, 'CalendarID']
      )
      .subscribe((res) => {
        if (res) {
          this.calendarID = res.fieldValue;
          this.getDayOff(this.calendarID);
        }
      });
  }

  getDayOff(id = null) {
    if (id) this.calendarID = id;
    this.api
      .execSv<any>(
        'BS',
        'ERM.Business.BS',
        'CalendarsBusiness',
        'GetDayWeekAsync',
        [this.calendarID]
      )
      .subscribe((res) => {
        if (res) {
          res.forEach((ele) => {
            this.dayoff = res;
          });
        }
      });
  }
  //#endregion

  changeView(evt: any) { }

  requestEnded(evt: any) {
    //this.dialog && this.dialog.close(); sai vẫn bị đóng
    this.view.currentView;
  }
  onDragDrop(e: any) {
    if (e.type == 'drop') {
      this.api
        .execSv<any>('TM', 'TM', 'TaskBusiness', 'UpdateAsync', e.data)
        .subscribe((res) => {
          if (res) {
            this.view.dataService.update(e.data);
          }
        });
    }
  }
  selectedChange(val: any) {
    this.itemSelected = val.data;
    this.dt.detectChanges();
  }

  receiveMF(e: any) {
    this.clickMF(e.e, this.itemSelected);
  }
}
