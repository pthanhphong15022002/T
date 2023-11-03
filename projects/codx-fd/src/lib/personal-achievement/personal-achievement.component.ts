import { AfterViewInit, ChangeDetectorRef, Component, Injector, Input, OnChanges, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { AuthStore, ButtonModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxFdService } from '../codx-fd.service';

@Component({
  selector: 'lib-personal-achievement',
  templateUrl: './personal-achievement.component.html',
  styleUrls: ['./personal-achievement.component.css']
})
export class PersonalAchievementComponent extends UIComponent
implements AfterViewInit, OnChanges{
  views: Array<ViewModel> = [];
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @Input() vllRefType = 'FD016';

  crrIndex: number = 0;
  infoPersonal: any;
  user:any;
  orgUnitStr: any;
  DepartmentStr: any;
  LoadedEInfo: boolean;
  employeeID;
  clmnGrid:any;
  lstAchievements:any = [];

  service = 'FD';
  assemblyName = 'ERM.Business.FD';
  entityName = 'FD_KudosTrans';
  className = 'KudosTransBusiness';
  method = 'LoadDataMyKudoAsync';
  idField = 'recID';

  rate: any;
  totalCoreEmp: any;

  constructor(
    inject: Injector,
    private authStore : AuthStore,
    private df: ChangeDetectorRef,
    private fdService: CodxFdService
  ) {
    super(inject);
    this.user = authStore.get();
  }
  ngOnChanges(changes: SimpleChanges): void {}

  onInit(): void {
    //load infor user
    this.loadEmpFullInfo(this.user.userID).subscribe((res) => {
      if(res){
        this.infoPersonal = res;
        this.LoadedEInfo = true;
        this.df.detectChanges();
      }
    })

    this.loadAchivement().subscribe((res) => {
      if(res){
        this.rate = res[0];
        this.totalCoreEmp = res[1];
        this.df.detectChanges();
      }
    })

  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelRightRef: this.panelRightRef,
          widthLeft: "30%",
          panelLeftRef: this.panelLeftRef,
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
}
