import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Optional,
  Output,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  DataRequest,
  DialogData,
  DialogRef,
} from 'codx-core';
import { StepService } from 'projects/codx-dp/src/lib/share-crm/codx-step/step.service';
import { Observable, finalize, map } from 'rxjs';

@Component({
  selector: 'lib-popup-add-task-calendar',
  templateUrl: './popup-add-task-calendar.component.html',
  styleUrls: ['./popup-add-task-calendar.component.css'],
})
export class PopupAddTaskCalendarComponent implements OnInit {
  @Input() lstParticipants = [];
  @Input() dialog: any;
  @Output() eventUser = new EventEmitter();
  @Input() isType = '';
  @Input() owner = '';
  title = 'Chọn ';
  checkRight = false;
  checkUser = false;
  currentLeft = 0;
  currentRight = 0;

  taskType;

  isLoading = true;
  lstOrg = [];
  isDisable = false;
  id: any;
  fieldsCustomer = { text: 'customerName', value: 'recID' };
  type = '';
  listCustomer;

  refValueType = '';
  service = 'CM';
  typeCMs = [
    { text: 'Khách hàng', entityName: 'CM_Customers', funcID: 'CM0101' },
    { text: 'Tiềm năng', entityName: 'CM_Leads', funcID: 'CM0205' },
    { text: 'Cơ hội', entityName: 'CM_Deals', funcID: 'CM0201' },
    { text: 'Chăm sóc khách hàng', entityName: 'CM_Cases', funcID: 'CM0401' },
    { text: 'Hợp đồng', entityName: 'CM_Contracts', funcID: 'CM0204' },
  ];
  requestData = new DataRequest();
  dataCombobox;
  dataCheck;
  user;
  isAdmin = false;
  entityName;
  funcID;
  page = 1;
  isLoad = false;
  canceLoad = false;
  constructor(
    private api: ApiHttpService,
    private stepService: StepService,
    private authStore: AuthStore,
    private el: ElementRef,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    this.user = this.authStore.get();
    this.dialog = dialog;
    this.taskType = dt?.data?.taskType;
    this.isAdmin = dt?.data?.isAdmin;
  }

  ngOnInit(): void {}

  async ngAfterViewInit() {}
  async continue() {
    this.dialog.close({ taskType: this.taskType, dataCheck: this.dataCheck });
  }

  changeType(type) {
    if (this.type != type) {
      this.type = type;
      let typeCM = this.typeCMs?.find(
        (typeFind) => typeFind.entityName == type
      );
      this.dataCheck = null;
      this.dataCombobox = [];
      this.entityName = typeCM?.entityName;
      this.funcID = typeCM?.funcID;
      this.page = 1;
      this.canceLoad = false;
      this.getDatas(this.entityName, this.funcID, this.page);
    }
  }

  chooseCM(item) {
    if (item && this.dataCheck != item) {
      this.dataCheck = item;
      console.log(this.dataCheck);
    }
  }

  valueChangeCombobox(event, type) {}
  valueChangeRadio(event) {}
  searchName(e) {}

  getDatas(entityName, funcID, page) {
    this.requestData.entityName = entityName;
    this.requestData.funcID = funcID;
    this.requestData.pageLoading = true;
    this.requestData.page = page;
    this.requestData.pageSize = 20;
    this.isLoad = true;
    this.fetch().subscribe((res) => {
      if (res && res?.length > 0) {
        let dataConvert = this.setData(res, entityName);
        if (dataConvert?.length > 0) {
          this.dataCombobox = [...this.dataCombobox, ...dataConvert];
        }
        this.isLoad = false;
        console.log(this.dataCombobox);
      } else {
        this.canceLoad = true;
        this.isLoad = false;
      }
    });
  }

  setData(data, entityName) {
    let dataMap = [];
    let applyProcess = null;
    let isAdminClone = false;
    if (entityName == 'CM_Deals') {
      applyProcess = true;
    } else if (entityName == 'CM_Customers') {
      applyProcess = false;
    }
    dataMap = data?.map((item) => {
      if (entityName != 'CM_Customers' && entityName != 'CM_Deals') {
        applyProcess = item?.applyProcess ? true : false;
      }
      if (this.isAdmin) {
        isAdminClone = true;
      } else {
        isAdminClone = item?.permissions?.some((x) => x.full) || false;
      }
      return {
        name:
          item?.customerName ||
          item?.dealName ||
          item?.contractName ||
          item?.leadName ||
          item?.caseName,
        recID: item?.recID,
        refID: item?.refID,
        applyProcess: applyProcess,
        owner: item?.owner,
        full: isAdminClone,
        entityName: entityName,
      };
    });
    return dataMap;
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
  @HostListener('scroll', ['$event'])
  onScroll(event: Event): void {
    if (!this.canceLoad) {
      const element = event.target as HTMLElement;
      if (element.scrollHeight - element.scrollTop === element.clientHeight) {
        this.page = this.page + 1;
        this.getDatas(this.entityName, this.funcID, this.page);
      }
    }
  }
}
