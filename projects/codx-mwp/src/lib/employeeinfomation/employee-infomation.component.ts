import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiHttpService, AuthStore, CacheService, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { CodxMwpService } from '../codx-mwp.service';

@Component({
  selector: 'lib-employee-infomation',
  templateUrl: './employee-infomation.component.html',
  styleUrls: ['./employee-infomation.component.css'],
  encapsulation: ViewEncapsulation.None

})
export class EmployeeInfomationComponent implements OnInit {
  views: Array<ViewModel> = [];

  employeeInfo: any = null;
  employeeHobbie: any = null;
  employeeContracts: any = null;
  ExperencesWorked: any = null;
  ExperencesCurrent: any = null;
  employeeRelationship: any = null;
  skillRequest: any = null;
  skillEmployee: any = null;
  skillChartEmployee: any = null;
  trainingInterObl: any = null;
  trainingInterUnObl: any = null;
  trainingPersonal: any = null;
  dataPolicy: any = null;
  employeeHobbieCategory: any = null;
  index = 3;
  employee: any;
  editMode: boolean = false;
  editSkillMode: boolean = false;
  isSaving = false;
  allowinfo = false;
  allowexp = false;
  allowedu = false;
  allowrela = false;
  allowhobby = false;
  entityName = "";
  predicate = "";
  viewMember = "";
  valueMember = "";
  dataValue = "";
  parentIdField = "";
  dataSelcected = [];
  service = "BS";

  minValue: number = 30;
  minType: string = "MinRange";
  data: Object[];
  primaryXAxis: Object;
  primaryYAxis: Object;

  // parentID: string = "WPT0321";
  formName: string = "";
  gridViewName: string = "";
  user: any;

  @ViewChild('contentSkill') contentSkill;
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('header') header: TemplateRef<any>;

  //currentSection = 'InfoPersonal';
  constructor(
    private codxMwpService: CodxMwpService,
    private dt: ChangeDetectorRef,
    private routeActive: ActivatedRoute,
    private api: ApiHttpService,
    private auth: AuthStore,
    private cachesv: CacheService,
  ) {
    // this.user = this.auth.get();
  }
  getContrastYIQ(item) {
    var hexcolor = (item.color || "#ffffff").replace("#", "");
    var r = parseInt(hexcolor.substr(0, 2), 16);
    var g = parseInt(hexcolor.substr(2, 2), 16);
    var b = parseInt(hexcolor.substr(4, 2), 16);
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
  }
  editSkill() {
    this.editSkillMode = true;
  }
  ngOnInit(): void {
    this.codxMwpService.modeEdit.subscribe(res => {
      this.editMode = res;
      this.editSkillMode = false;
    })
    this.codxMwpService.empInfo.subscribe((res: string) => {
      if (res) {
        //console.log(res);
        this.employeeInfo = null;
        this.employeeHobbie = null;
        this.employeeContracts = null;
        this.ExperencesWorked = null;
        this.ExperencesCurrent = null;
        this.employeeRelationship = null;
        this.skillRequest = null;
        this.skillEmployee = null;
        this.skillChartEmployee = null;
        this.trainingInterObl = null;
        this.trainingInterUnObl = null;
        this.trainingPersonal = null;
        this.dataPolicy = null;

        this.LoadData(res);
      }
    });
    this.cachesv.functionList("MWP002").subscribe((res: any) => {
      if (res) {
        this.formName = res.formName;
        this.gridViewName = res.gridViewName;
        this.cachesv.moreFunction(this.formName, this.gridViewName).subscribe((res: any) => {
          console.log(res);
          this.dt.detectChanges();
        });
      }
    });
    this.primaryXAxis = {
      valueType: 'Category',
      labelPlacement: 'OnTicks',

    };
    //Initializing Primary Y Axis
    this.primaryYAxis = {
      minimum: 0, maximum: 10, interval: 2,
      edgeLabelPlacement: 'Shift',
      labelFormat: '{value}'
    };
  }

  updateExperiences(response) {
    this.ExperencesWorked = [];
    this.ExperencesCurrent = [];
    if (response.Experences) { //Experences
      var exp = response.Experences;
      if (exp.WorkedCompany)
        this.ExperencesWorked = exp.WorkedCompany;
      if (exp.CurrentCompany)
        this.ExperencesCurrent = exp.CurrentCompany;
    }
  }
  loadEmployee(employeeID, cb?) {
    if ((typeof employeeID === 'object')) {
      if (employeeID.Employee) // employee
      {
        this.codxMwpService.employee = employeeID.Employee;
        this.employee = employeeID.Employee;

      }
      if (employeeID.InfoPersonal) {// Info
        this.employeeInfo = employeeID.InfoPersonal;
      }
      this.codxMwpService.InfoLeftComponent.dataEmployee = {
        dataRoot: this.employee,
        employeeInfo: this.employeeInfo
      };
    }
  }
  LoadData(employee) {
    this.loadEmployee(employee, e => {

    });
    setTimeout(() => {
      this.codxMwpService.LoadData(employee.Employee.employeeID, "", "2").subscribe((response: any) => {
        if (response) {
          this.updateExperiences(response);
        }
      });

      this.codxMwpService.LoadData(employee.Employee.employeeID, "", "4").subscribe((response: any) => {
        if (response) {
          this.updateTraining(response);
        }
      });
      this.codxMwpService.LoadData(employee.Employee.employeeID, "", "5").subscribe((response: any) => {
        this.updateHobby(response);
      });

      this.codxMwpService.LoadData(employee.Employee.employeeID, "", "7").subscribe((response: any) => {
        if (response) {
          this.updateRelation(response);
        }
      });
      this.codxMwpService.LoadData(employee.Employee.employeeID, "", "8").subscribe((response: any) => {
        if (response) {
          this.updateSkill(response);
        }
      });
    }, 100);



  }
  updateHobby(response) {
    if (response) {
      this.employeeHobbie = [];
      if (response.Hobbie) //Hobbie
        this.employeeHobbie = response.Hobbie;
      this.employeeHobbieCategory = [];
      var obj: any = {};
      for (let index = 0; index < this.employeeHobbie.length; index++) {
        const element = this.employeeHobbie[index];
        if (!obj[element.catagory]) {
          obj[element.catagory] = 1;
          this.employeeHobbieCategory.push(element.catagory);
        }

      }

    }
  }
  updateRelation(response) {
    this.employeeRelationship = [];

    if (response.Relationship)  // Relationship
      this.employeeRelationship = response.Relationship;
  }
  updateTraining(response) {
    this.trainingInterObl = [];
    this.trainingInterUnObl = [];
    this.trainingPersonal = [];
    if (response.Training) { //Training
      var training = response.Training;
      if (training.Interval) {
        this.trainingInterObl = training.Interval.filter(x => x.optional == 0);
        this.trainingInterUnObl = training.Interval.filter(x => x.optional == 1);
      }
      if (training.Personal)
        this.trainingPersonal = training.Personal;
    }


  }
  updateSkill(response) {
    this.skillRequest = [];
    this.skillEmployee = [];
    this.skillChartEmployee = [];
    if (response.Skill) { //Skill
      var skill = response.Skill;
      if (skill.Request)
        this.skillRequest = skill.Request;
      if (skill.Employee) {
        this.skillEmployee = skill.Employee;
        for (let index = 0; index < this.skillEmployee.length; index++) {
          const element = this.skillEmployee[index];
          this.skillChartEmployee.push(element);
        }
        this.dt.detectChanges();
      }
    }
  }
  sliderChange(e, data) {
    this.skillChartEmployee = [];
    data.rating = data.valueX.toString();


    this.api.exec('ERM.Business.HR', 'EmployeesBusiness', 'UpdateEmployeeSkillAsync', [[data]])
      .subscribe((o: any) => {

      });
    for (let index = 0; index < this.skillEmployee.length; index++) {
      const element = this.skillEmployee[index];
      this.skillChartEmployee.push(element);
    }
  }
  ngAfterViewInit() {
    this.views = [
      {
        id: '1',
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelLeftRef: this.panelLeftRef,
          panelRightRef: this.panelRightRef,
          widthLeft: '320px'
        }
      },
    ];
    this.dt.detectChanges();
  }

  ngOnChanges() {

  }
  onSectionChange(data: any) {
    //this.currentSection = sectionId;
    console.log(data);
    this.codxMwpService.currentSection = data.current;
    this.dt.detectChanges();
  }
  isCheck(data) {
    if (this.skillEmployee) {
      for (let index = 0; index < this.skillEmployee.length; index++) {
        const element = this.skillEmployee[index];
        if (data.competenceID == element.competenceID) {
          return true;
        }

      }
    }
    return false;
  }
}
