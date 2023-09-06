import {
  AfterViewInit,
  Component,
  Injector,
  Input,
  OnChanges,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  AuthStore,
  ButtonModel,
  DataRequest,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  ResourceModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';
import { Observable, finalize, firstValueFrom, map } from 'rxjs';
import {
  CM_Cases,
  CM_Contracts,
  CM_Customers,
  CM_Deals,
  CM_Leads,
} from '../../models/cm_model';
import { CodxTypeTaskComponent } from 'projects/codx-share/src/lib/components/codx-step/codx-type-task/codx-type-task.component';
import { StepService } from 'projects/codx-share/src/lib/components/codx-step/step.service';
import { CM_Contacts } from '../../models/tmpCrm.model';

@Component({
  selector: 'lib-view-calendar',
  templateUrl: './view-calendar.component.html',
  styleUrls: ['./view-calendar.component.css'],
})
export class ViewCalendarComponent
  extends UIComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @ViewChild('cellTemplate') cellTemplate!: TemplateRef<any>;
  @ViewChild('contentTmp') contentTmp!: TemplateRef<any>;
  @ViewChild('resourceHeader') resourceHeader!: TemplateRef<any>; //ressouce cuar schedule
  @ViewChild('eventTemplate') eventTemplate!: TemplateRef<any>; //event schedule
  @ViewChild('headerTempContent') headerTempContent!: TemplateRef<any>; //temp Content

  @ViewChild('popupChoiseTypeCM') popupChoiseTypeCM: TemplateRef<any>;

  @Input() funcID: any;
  @Input() viewActiveType = '7';
  views: Array<ViewModel> = [];
  requestSchedule: ResourceModel;
  modelResource: ResourceModel;

  fields = {
    id: 'recID',
    subject: { name: 'taskName' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
    resourceId: { name: 'owner' },
    status: 'taskType',
  };

  resourceField = {
    Name: 'Resources',
    Field: 'owner',
    IdField: 'owner',
    TextField: 'userName',
    Title: 'Resources',
  };

  vllTypeTask = 'DP050';
  dayoff: any;
  calendarID = 'STD';

  user: any;
  crrFuncID: any;

  formModelActivities: FormModel = {
    gridViewName: 'grvDPActivities',
    formName: 'DPActivities',
  };
  viewCrr: any;

  titleAction: string;
  button: ButtonModel = {
    id: 'btnAdd',
  };

  taskType;
  popupTypeCM: DialogRef;
  fieldsGroup = { text: 'text', value: 'entityName' };
  fieldsStep = { text: 'stepName', value: 'recID' };

  fieldsCustomer = { text: 'customerName', value: 'recID' };
  fieldsLead = { text: 'leadName', value: 'recID' };
  fieldsDeal = { text: 'dealName', value: 'recID' };
  fieldsCase = { text: 'caseName', value: 'recID' };
  fieldsContract = { text: 'contractName', value: 'recID' };

  typeCMs = [
    { text: 'Khách hàng', entityName: 'CM_Customers', funcID: 'CM0101' },
    { text: 'Tiềm năng', entityName: 'CM_Leads', funcID: 'CM0205' },
    { text: 'Cơ hội', entityName: 'CM_Deals', funcID: 'CM0201' },
    { text: 'Chăm sóc khách hàng', entityName: 'CM_Cases', funcID: 'CM0401' },
    { text: 'Hợp đồng', entityName: 'CM_Contracts', funcID: 'CM0204' },
  ];

  insStep;
  listStep: any[];
  listLead: CM_Leads[];
  listDeal: CM_Deals[];
  listCase: CM_Cases[];
  listCustomer: CM_Customers[];
  listContract: CM_Contracts[];

  disableButton = true;
  objectID = '';
  isActivitie = false;
  isStepTask = false;
  fieldTypeCm = '';
  service = 'CM';
  entityName = 'CM_Contracts';
  className = 'ContractsBusiness';
  assemblyName = 'ERM.Business.CM';
  methodLoadData = 'GetListContractsAsync';
  requestData = new DataRequest();


  constructor(
    private inject: Injector,
    private authstore: AuthStore,
    private cmService: CodxCmService,
    private stepService: StepService,
    private notiService: NotificationsService,
  ) {
    super(inject);
    this.router.params.subscribe((param: any) => {
      if (param.funcID) {
        this.funcID = param.funcID;
      }
    });
    this.user = this.authstore.get();
    this.afterLoad();
  }

  ngOnChanges() {
    this.getDayOff();
    this.afterLoad();
  }
  onInit(): void {
    this.getDayOff();
  }
  ngAfterViewInit(): void {
    this.afterLoad();
    console.log(this.view.dataService);
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
          this.dayoff = res;
        }
      });
  }

  onAction(e) {}

  getCellContent(evt: any) {
    if (this.dayoff && this.dayoff.length > 0) {
      for (let i = 0; i < this.dayoff.length; i++) {
        let day = new Date(this.dayoff[i].startDate);
        if (
          day &&
          evt.getFullYear() === day.getFullYear() &&
          evt.getMonth() === day.getMonth() &&
          evt.getDate() === day.getDate()
        ) {
          let time = evt.getTime();
          let ele = document.querySelectorAll('[data-date="' + time + '"]');
          if (ele.length > 0) {
            ele.forEach((item) => {
              (item as any).style.backgroundColor = this.dayoff[i].color;
            });
            return (
              '<icon class="' +
              this.dayoff[i].symbol +
              '"></icon>' +
              '<span>' +
              this.dayoff[i].note +
              '</span>'
            );
          } else {
            return '';
          }
        }
      }
    }

    return ''; // Return a default value if no conditions are met
  }

  afterLoad() {
    //lấy list step istances step task + Activities => tmpEvents
    this.requestSchedule = new ResourceModel();
    this.requestSchedule.assemblyName = 'DP';
    this.requestSchedule.className = 'ActivitiesBusiness';
    this.requestSchedule.service = 'DP';
    this.requestSchedule.method = 'GetListEventCalendarAsync';
    this.requestSchedule.idField = 'recID';

    //xu ly khi truyeefn vao 1 list resourece
    this.modelResource = new ResourceModel();
    if (this.funcID == 'CM0702') {
      this.modelResource.assemblyName = 'HR';
      this.modelResource.className = 'OrganizationUnitsBusiness';
      this.modelResource.service = 'HR';
      this.modelResource.method = 'GetListUserBeLongToOrgOfAcountAsync';
    } else {
      //truyen lay resourse
      this.modelResource.assemblyName = 'HR';
      this.modelResource.className = 'OrganizationUnitsBusiness';
      this.modelResource.service = 'HR';
      this.modelResource.method = 'GetListUserByResourceAsync';
      this.modelResource.dataValue = this.user.userID;
    }

    this.views = [
      {
        type: ViewType.calendar,
        active: false,
        sameData: false,
        request: this.requestSchedule,
        showSearchBar: false,
        model: {
          eventModel: this.fields,
          // resourceModel: this.resourceField, //calendar  not take
          // template4: this.resourceHeader,
          template6: this.headerTempContent, //header morefun
          //template7: this.footerNone, ///footer
          template: this.eventTemplate,
          //template2: this.headerTemp,
          template3: this.cellTemplate,
          template8: this.contentTmp, //content  nội dung chính
          statusColorRef: this.vllTypeTask,
        },
      },
      {
        type: ViewType.schedule,
        active: false,
        sameData: false,
        request: this.requestSchedule,
        request2: this.modelResource,
        showSearchBar: false,
        showFilter: false,
        model: {
          eventModel: this.fields,
          resourceModel: this.resourceField,
          template4: this.resourceHeader, //temp ressources
          template6: this.headerTempContent, //header // more
          //template7: this.footerNone, ///footer
          template: this.eventTemplate, //lấy event của temo
          //template2: this.headerTemp,
          template3: this.cellTemplate, //tem cell
          template8: this.contentTmp, //content
          statusColorRef: this.vllTypeTask,
        },
      },
    ];
  }
  //#endregion setting

  showHour(stringDate: any) {
    const date: Date = new Date(stringDate);
    const hours: number = date.getHours();
    const minutes: number = date.getMinutes();

    const timeString: string = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;

    return timeString;
  }

  viewChanged(e) {
    this.viewCrr = e?.view?.type ?? '7';
    this.cmService.viewActiveType.next(this.viewCrr.toString());
    // this.viewCrr = evt?.view?.type;
    // this.funcID = this.router.snapshot.params['funcID'];
    // if (this.crrFuncID != this.funcID) {
    //   this.afterLoad();
    //   this.crrFuncID = this.funcID;
    //   this.view.load();
    //   this.view.currentView.refesh();
    // }
  }

  click(evt: ButtonModel) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case 'btnAdd':
        this.beforeAddTask();
        break;
    }
  }

  settingViews() {}

  //------------------More Func-----------------//
  //chua goi tho phan quyền -- đang full true
  changeDataMF(e, data) {}

  clickMF(e, data) {}

  //------------------More Func-----------------//

  //#region add task
  beforeAddTask() {
    let option = new DialogModel();
    option.zIndex = 1001;
    this.popupTypeCM = this.callfc.openForm(
      this.popupChoiseTypeCM,
      '',
      600,
      470,
      '',
      null,
      '',
      option
    );
  }
   
  closeBeforeAddTask(){
    this.popupTypeCM.close();
    this.isStepTask = false;
    this.isActivitie = false;
    this.fieldTypeCm = '';
    this.disableButton = true;
  }

  filterText(event, type) {
    switch (type) {
      case 'type':
        this.fieldTypeCm = event?.value;
        this.disableButton = true;
        let typeCM = this.typeCMs?.find(
          (type) => type.entityName == this.fieldTypeCm
        );
        this.getDatas(typeCM?.entityName, typeCM?.funcID, null, null);
        break;
      case 'CM_Customers':
        if(event?.value){
          this.objectID = event?.value;
          this.disableButton = false;
        }else{
          this.disableButton = true;
        }
        break;
      case 'CM_Leads':
        this.checkLeads(event?.itemData)
        break;
      case 'CM_Deals':
        this.checkDeal(event?.value);
        break;
      case 'CM_Contracts':
        this.checkContracts(event?.itemData)
        break;
      case 'CM_Cases':
        this.checkCases(event?.itemData)
        break;
      case 'step':
        this.insStep = event?.itemData;
        break;
    }
  }

  checkLeads(lead) {
    console.log(lead);
    
  }
  
  checkContracts(contract) {
    console.log(contract);
  }

  checkCases(cases) {
    console.log(cases);
  }

  checkDeal(dealID) {
    let deal = this.listDeal.find((dealFind) => dealFind.recID == dealID);
    if (deal) {
      var data = [deal?.refID, deal?.processID, deal?.status, '1'];
      this.cmService.getStepInstance(data).subscribe((res) => {
        if (res) {
          this.listStep = res;
          this.isStepTask = true;
        }
      });
    }
  }

  getDatas(entityName, funcID, predicates, dataValues) {
    this.requestData.entityName = entityName;
    this.requestData.funcID = funcID;
    this.requestData.predicates = predicates;
    this.requestData.dataValues = dataValues;
    this.requestData.pageLoading = false;

    this.fetch().subscribe((res) => {
      switch (entityName) {
        case 'CM_Cases':
          this.listCase = res;
          break;
        case 'CM_Deals':
          this.listDeal = res;
          break;
        case 'CM_Leads':
          this.listLead = res;
          break;
        case 'CM_Contracts':
          this.listContract = res;
          break;
        case 'CM_Customers':
          this.listCustomer = res;
          this.isStepTask = false;
          this.isActivitie = true;
          break;
      }
      console.log(res);
    });
  }

  fetch(): Observable<any[]> {
    return this.api
      .execSv<Array<any>>(
        this.service,
        'Core',
        'DataBusiness',
        'LoadDataAsync',
        this.requestData
      )
      .pipe(
        finalize(() => {}),
        map((response: any) => {
          return response[0];
        })
      );
  }

  continue() {
    this.closeBeforeAddTask();
    this.chooseTypeTask();
  }

  async chooseTypeTask() {
    this.taskType = await this.stepService.chooseTypeTask(false);
    if (this.taskType) {
      await this.addTask(this.taskType);
    }
  }

  async addTask(dataType) {
    let taskOutput = await this.stepService.addTask('add','',dataType,this.insStep,null,false,null,'right');
    let task = taskOutput;
    if (task) {
      this.isActivitie && this.addActivitie(task);
      this.isStepTask && this.addStepTask(task);
    }
  }
  addActivitie(task) {
    task['progress'] = 0;
    task['refID'] = Util.uid();
    task['isTaskDefault'] = false;
    task['taskType'] = this.taskType?.value;
    task['objectID'] = this.objectID;
    task['objectType'] = this.entityName;
    this.api
      .exec<any>('DP', 'InstanceStepsBusiness', 'AddActivitiesAsync', [
        task,
        this.entityName,
      ])
      .subscribe((res) => {
        if (res) {
          res.StartDate = res.ActualStart ?? res.StartDate;
          res.EndDate = res.ActualEnd ?? res.EndDate;
          res.isActual = res.ActualStart != null ? true : false;
          res.EntityName = 'DP_Activities';
          this.view.dataService.add(res).subscribe();
          this.notiService.notifyCode('SYS006');
          this.detectorRef.detectChanges();
        }
      });
  }
  addStepTask(task) {
    console.log(task);
    this.api
    .exec<any>('DP', 'InstanceStepsBusiness', 'AddTaskStepAsync', task)
    .subscribe((res) => {
      if (res) {
        let task = res[0];
        task.StartDate = task.ActualStart || task.StartDate;
        task.EndDate = task.ActualEnd || task.EndDate;
        task.isActual = task.ActualStart != null ? true : false;
        task.EntityName = 'DP_Instances_Steps_Tasks';
        this.view.dataService.add(task).subscribe();
        this.notiService.notifyCode('SYS006');
        this.detectorRef.detectChanges();
      }
    });
  }
   //#endregion
}
