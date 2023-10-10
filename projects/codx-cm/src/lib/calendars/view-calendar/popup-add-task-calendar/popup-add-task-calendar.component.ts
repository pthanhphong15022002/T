import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { ApiHttpService, AuthStore, DataRequest, DialogData, DialogRef } from 'codx-core';
import { log } from 'console';
import { StepService } from 'projects/codx-share/src/lib/components/codx-step/step.service';
import { Observable, finalize, map } from 'rxjs';

@Component({
  selector: 'lib-popup-add-task-calendar',
  templateUrl: './popup-add-task-calendar.component.html',
  styleUrls: ['./popup-add-task-calendar.component.css']
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
  constructor(
    private api: ApiHttpService,
    private stepService: StepService,
    private authStore: AuthStore,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    this.user = this.authStore.get();
    this.dialog = dialog;
    this.taskType =  dt?.data?.taskType;
    this.isAdmin = dt?.data?.isAdmin;
  }

  ngOnInit(): void {
   
  }

  async ngAfterViewInit() {

  }
  async continue() {
    this.dialog.close({taskType: this.taskType, dataCheck: this.dataCheck});
  }

  changeType(type){
    if(this.type != type){
      this.type = type;
      let typeCM = this.typeCMs?.find(typeFind => typeFind.entityName == type);
      this.dataCheck = null;
      this.dataCombobox = [];
      this.getDatas(typeCM?.entityName, typeCM?.funcID);
    }
  }

  chooseCM(item){
    if(item && this.dataCheck != item){
      this.dataCheck = item;
      console.log(this.dataCheck);
      
    }
  }
 
  valueChangeCombobox(event, type) {}
  valueChangeRadio(event){

  }
  searchName(e) {}

  getDatas(entityName, funcID) {
    this.requestData.entityName = entityName;
    this.requestData.funcID = funcID;
    this.requestData.pageLoading = true;
    this.requestData.page = 1;
    this.requestData.pageSize = 20;
    this.fetch().subscribe((res) => {
     if(res){
      let applyProcess = null;
      let isAdminClone = false;
      if(entityName == "CM_Deals"){
        applyProcess = true;
      }else if(entityName == "CM_Customers"){
        applyProcess = false;
      }
      this.dataCombobox = res?.map(item =>{
        if(entityName != "CM_Customers" && entityName != "CM_Deals"){
          applyProcess = item?.applyProcess ? true : false;
        }
        if(this.isAdmin){
          isAdminClone = true;
        }else{
          isAdminClone = item?.permissions?.some(x => x.full) || false;
        }
        return {
          name:item?.customerName || item?.dealName || item?.contractName || item?.leadName || item?.caseName,
          recID:item?.recID,
          refID:item?.refID,
          applyProcess: applyProcess, 
          owner: item?.owner,
          full: isAdminClone,
          entityName: entityName,
        }
      } );
      console.log(this.dataCombobox);      
     }
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
}
