import { AfterViewInit, ChangeDetectorRef, Component, Injector, Input, OnChanges, SimpleChanges, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { AuthStore, ButtonModel, CacheService, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxFdService } from '../codx-fd.service';
import { isObservable } from 'rxjs';
import { listFunction, pointLadder } from './personal-usage-history';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'lib-personal-usage-history',
  templateUrl:'./personal-usage-history.component.html',
  styleUrls: ['./personal-usage-history.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PersonalUsageHistoryComponent extends UIComponent
implements AfterViewInit, OnChanges{
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('rowTransDate') rowTransDate: TemplateRef<any>;
  @ViewChild('rowRefType') rowRefType: TemplateRef<any>;
  @ViewChild('rowCard') rowCard: TemplateRef<any>;
  @ViewChild('rowPolicy') rowPolicy: TemplateRef<any>;
  @ViewChild('rowCoins') rowCoins: TemplateRef<any>;
  @Input() vllRefType = 'FD016';
  
  views: Array<ViewModel> = [];
  pointLadder = pointLadder;
  crrIndex: number = 0;
  infoPersonal: any;
  wallets:any;
  ranges:any;
  user:any;
  orgUnitStr: any;
  DepartmentStr: any;
  employeeID;
  clmnGrid:any;
  lstAchievements:any = [];

  service = 'FD';
  assemblyName = 'ERM.Business.FD';
  entityName = 'FD_KudosTrans';
  className = 'KudosTransBusiness';
  method = 'LoadDataMyKudoAsync';
  idField = 'recID';
  columnsGrid = [];
  rate: any;
  totalCoreEmp: any;
  listFunc = listFunction;
  active=1;
  constructor(
    inject: Injector,
    private authStore : AuthStore,
    private df: ChangeDetectorRef,
    private fdService: CodxFdService,
    public sanitizer: DomSanitizer
  ) {
    super(inject);
    this.user = authStore.get();
  }
  ngOnChanges(changes: SimpleChanges): void {}

  onInit(): void {
    //load infor user
    this.getImformationUser();
    this.getWallet();
    this.loadAchivement().subscribe((res) => {
      if(res){
        this.rate = res[0];
        this.totalCoreEmp = res[1];
        this.df.detectChanges();
      }
    })
  }

  getImformationUser()
  {
    let paras = [this.user?.userID];
    let keyRoot = "FDImforUser" + this.user?.userID;
    var data = this.fdService.loadData(paras,keyRoot,"HR","HR",'EmployeesBusiness','GetOneByDomainUserAsync');

    if(isObservable(data)) data.subscribe(item=>{if(item) this.infoPersonal = item});
    else this.infoPersonal = data
  }

  getWallet()
  {
    let paras = [this.user?.userID];
    let keyRoot = "FDWallets" + this.user?.userID;
    var data = this.fdService.loadData(paras,keyRoot,"FD","FD",'WalletsBusiness','GetWalletsAsync');

    if(isObservable(data)) data.subscribe(item=>{if(item) this.wallets = item});
    else this.wallets = data
    
  }
  
  ngAfterViewInit(): void {
    this.columnsGrid = [
      { field: 'createdOn', headerText: 'Ngày phát sinh', width: 150 , template: this.rowTransDate},
      { headerText: "Thông điệp", template: this.rowRefType , width: 150 , textAlign: 'center'},
      { headerText: "Nội dung", template: this.rowCard , textAlign: 'center'},
      { headerText: "Chính sách", template: this.rowPolicy ,textAlign: 'center'},
      { headerText: "Điểm" , template: this.rowCoins , textAlign: 'center' , width: 100},
      // { field: 'projectName', headerText: 'Danh sách dự án', width: 120 },
      // { field: 'resource', headerText: 'Nguồn lực', template: this.itemOwner, width: 100 },
      // { field: 'totalTask', headerText: 'Tổng số công việc', width: 80 },
      // { field: 'taskCompleted', headerText: 'Đã hoàn tất', width: 80 },
      // { field: 'taskUnComplete', headerText: 'Chưa thực hiện', width: 80 },
      // { field: 'rateTaskDone', headerText: 'Tỉ lệ hoàn thành', template: this.itemRateTaskDone, width: 80 },
      // { field: 'rateTaskDoneTime', headerText: 'Tỉ lệ hoàn thành đúng hạn', template: this.itemRateTaskDoneTime, width: 80 },
      // { field: '', headerText: '', template: this.buttonPupop, width: 30 }
    ];
    this.views = [
      {
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          hideMoreFunc:true,
          resources: this.columnsGrid,
        },
      },
    ];
  }

  loadEmpFullInfo(userID){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'GetOneByDomainUserAsync',
      userID
    );
  }
  
  loadAchivement(){
    return this.api.execSv<any>(
      'FD',
      'FD',
      'KudosTransBusiness',
      'GetDataMyAchievementAsync'
    );
  }

  clickActive(id:any)
  {
    this.active = id;
  }
}
