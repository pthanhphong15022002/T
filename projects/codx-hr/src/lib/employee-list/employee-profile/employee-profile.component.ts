import { CodxMwpService } from 'projects/codx-mwp/src/public-api';
import {
  Component,
  Injector,
  OnInit,
  Optional,
  ChangeDetectorRef,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  AuthStore,
  CallFuncService,
  DialogData,
  DialogRef,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
import { EmployeeSelfInfoComponent } from '../../employee-profile/employee-self-info/employee-self-info.component';
import { PopupAddEmployeesPartyInfoComponent } from '../../employee-profile/popup-add-employees-party-info/popup-add-employees-party-info.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'lib-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.scss'],
})
export class EmployeeProfileComponent extends UIComponent {
  @ViewChild('panelContent') panelContent: TemplateRef<any>;
  minType = 'MinRange';
  user
  constructor(
    private inject: Injector,
    private routeActive: ActivatedRoute,
    private hrService: CodxHrService,
    private auth: AuthStore,
    private df: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private codxMwpService: CodxMwpService,

    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.user = this.auth.get();
    
  }

  @ViewChild('itemTemplate') template: TemplateRef<any>;
  @ViewChild('paneRight') panelRight: TemplateRef<any>;

  views: Array<ViewModel> | any = [];

  statusVll = 'L0225';
  funcID = '';
  service = '';
  assemblyName = '';
  entity = '';
  className = '';
  idField = 'recID';
  functionID : string;
  data: any = {}

  itemDetail;

  vllTabs = [
    { icon: 'icon-apartment', text: 'Thông tin cá nhân' },
    { icon: 'icon-apartment', text: 'Thông tin công việc' },
    { icon: 'icon-apartment', text: 'Phúc Lợi' },
    { icon: 'icon-apartment', text: 'Quá trình nhân sự' },
    { icon: 'icon-apartment', text: 'Kiến thức' },
    { icon: 'icon-apartment', text: 'Khen thưởng' },
    { icon: 'icon-apartment', text: 'Kỷ luật' },
    { icon: 'icon-apartment', text: 'Sức khỏe' },
    { icon: 'icon-apartment', text: 'Thôi việc' },
  ];
  sampleData = {
    employeeID: '012.MPDF',
    joinedOn: '10/03/2015',
    status: '',
    orgUnitID: '',
    email: 'lphthuong@lacviet.com.vn',
    phone: '#LinePhone',
    mobile: '0907323495',
  };
  onInit(): void {
    this.routeActive.queryParams.subscribe((params) => {

      if (params.employeeID || this.user.userID) {
        this.codxMwpService
          .LoadData(params.employeeID, this.user.userID, '0')
          .subscribe((response: any) => {
            if (response) {
              this.data = response.Employee;
              console.log(this.data);
              
              // this.dataEmployee.employeeInfo = response.InfoPersonal;
              // this.codxMwpService.appendID(params.employeeID);
              // this.codxMwpService.empInfo.next(response);
              this.df.detectChanges();
            }
          });
      }
    });
    this.router.params.subscribe((param:any) => {
      if(param)
      {
        this.functionID = param['funcID'];
        this.getDataAsync(this.functionID);
        this.codxMwpService.empInfo.subscribe((res: string) => {
          if (res) {
          console.log(res);
          }
          
        })
      }
    });
  }

  getDataAsync(funcID:string){
    this.getDataFromFunction(funcID);
  }
  getDataFromFunction(functionID:string){
    if(functionID)
    {
      this.api.execSv
      (
        'SYS',
        'ERM.Business.SYS',
        'MoreFunctionsBusiness',
        'GetMoreFunctionByHRAsync',
        [this.functionID]
      ).subscribe((res:any[]) => {
        if(res && res.length > 0){
          // this.moreFunc = res;
          // this.defautFunc = res[0];
          this.detectorRef.detectChanges();
        }
      });
    }
  }

  ngAfterViewInit(): void {
    // this.view.dataService.methodDelete = 'DeleteSignFileAsync';
    this.views = [
      {
        type: ViewType.content,
        active: true,
        model: {
          panelRightRef: this.panelContent,
        },
      },
    ];
    this.df.detectChanges();
  }

  changeItemDetail(item) {}

  addEmployeePartyInfo() {
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupAddEmployeesPartyInfoComponent,
      {
        isAdd: true,
        headerText: 'Thông tin Đảng - Đoàn',
      },
      option
    );
  }

  addEmployeeSelfInfo(){
    this.view.dataService.dataSelected = this.data;
    // this.view.dataService
    // .edit(this.data)
    // .subscribe((res) => {
    //   console.log('ress', res);
      let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      EmployeeSelfInfoComponent,
      {
        isAdd: true,
        headerText: 'Thông tin bản thân',
      },
      option
    );
    // })
    
  }
}
