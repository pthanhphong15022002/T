import { ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileUpload } from '@shared/models/file.model';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { ApiHttpService, AuthStore, CacheService, CallFuncService, CRUDService, DialogModel, DialogRef, FormModel, ImageViewerComponent, NotificationsService, RequestOption, SidebarModel, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { PopupAddEmployeesComponent } from 'projects/codx-hr/src/lib/employees/popup-add-employees/popup-add-employees.component';
import { CodxMwpService } from '../codx-mwp.service';
import { EditExperenceComponent } from './edit-experence/edit-experence.component';
import { EditHobbyComponent } from './edit-hobby/edit-hobby.component';
import { EditInfoComponent } from './edit-info/edit-info.component';
import { EditRelationComponent } from './edit-relation/edit-relation.component';
import { EditSkillComponent } from './edit-skill/edit-skill.component';

@Component({
  selector: 'lib-employee-infomation',
  templateUrl: './employee-infomation.component.html',
  styleUrls: ['./employee-infomation.component.css'],
  encapsulation: ViewEncapsulation.None

})
export class EmployeeInfomationComponent implements OnInit {
  views: Array<ViewModel> = [];
  @ViewChild('view') view!: ViewsComponent;
  dataEmployee: any = {
    dataRoot: {},
    employeeInfo: {},
  };
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

  minType = "MinRange";
  data: Object[];
  primaryXAxis: Object;
  primaryYAxis: Object;
  moreFunc = []
  functionID: string;
  defautFunc: any;
  formName: string = "";
  gridViewName: string = "";
  user: any;
  dialog!: DialogRef;
  formModel: FormModel;
  showCBB = false;

  @ViewChild('contentSkill') contentSkill;
  @ViewChild('imageAvatar') imageAvatar: ImageViewerComponent;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('header') header: TemplateRef<any>;
  @ViewChild('view') codxView!: any;
  itemSelected: any;
  employeeID: any;

  //currentSection = 'InfoPersonal';
  constructor(
    private codxMwpService: CodxMwpService,
    private dt: ChangeDetectorRef,
    private routeActive: ActivatedRoute,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private auth: AuthStore,
    private cachesv: CacheService,
    private callfunc: CallFuncService,
    private inject: Injector
  ) {
    this.user = this.auth.get();
    this.functionID = this.routeActive.snapshot.params['funcID'];
    this.codxMwpService.getMoreFunction([this.functionID, null, null]).subscribe(res => {
      if (res) {
        this.defautFunc = res[0]
        this.formName = res.formName;
        this.gridViewName = res.gridViewName;
        this.cachesv.moreFunction(this.formName, this.gridViewName).subscribe((res: any) => {
          if (res)
            this.moreFunc = res;
          this.dt.detectChanges();
          setTimeout(() => {
            this.imageAvatar.getFormServer();
          }, 100);
        });
      }
    });
  }

  getContrastYIQ(item) {
    var hexcolor = (item.color || "#ffffff").replace("#", "");
    var r = parseInt(hexcolor.substr(0, 2), 16);
    var g = parseInt(hexcolor.substr(2, 2), 16);
    var b = parseInt(hexcolor.substr(4, 2), 16);
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
  }
  editSkill(item: any) {
    this.editSkillMode = true;
    var model = new DialogModel();
    model.DataService = new CRUDService(this.inject);
    var dt = item;
    var dialog = this.callfunc.openForm(EditSkillComponent, '', 450, 600, '', dt, "", model);
    dialog.closed.subscribe(e => {
      this.skillEmployee = [...e.event, ...[]];
      this.dt.detectChanges();
      console.log(e);
    })
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

  getQueryParams() {
    this.routeActive.queryParams.subscribe((params) => {
      if (params) {
        this.employeeID = params.employeeID;
        this.dataValue = this.employeeID;
      }
    });
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
      this.codxMwpService.infoLeftComponent.dataEmployee = {
        dataRoot: this.employee,
        employeeInfo: this.employeeInfo
      };
    }
  }
  LoadData(employee) {
    console.log(this.view)
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

  ngAfterViewInit() {
    this.views = [
      {
        id: '1',
        type: ViewType.content,
        active: true,
        sameData: false,
        model: {
          panelLeftRef: this.panelLeftRef,
          panelRightRef: this.panelRightRef,
          widthLeft: '320px'
        }
      },
    ];
    this.formModel = this.codxView.formModel;
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

  clickMF(e: any, data?: any) {
    switch (e.functionID) {
      case 'SYS03':
        this.editExperences(data);
        break;
      case 'SYS02':
        this.deleteExperences(data);
        break;
    }
  }

  clickMFS(e: any, data?: any) {
    switch (e.functionID) {
      case 'SYS03':
        this.editRelations(data);
        break;
      case 'SYS02':
        this.deleteRelation(data);
        break;
    }
  }

  editInfo(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.edit(this.view.dataService.dataSelected).subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '800px';
      this.dialog = this.callfunc.openSide(EditInfoComponent, 'edit', option);
    });
    this.dt.detectChanges();
  }

  addExperences() {
    this.view.dataService.request.funcID = "MWP00202";
    this.view.dataService.request.entityName = "HR_EmployeeExperiences";
    this.view.dataService.idField = "recID"

    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      this.view.dataService.dataSelected!.employeeID = this.employee!.employeeID;
      this.dialog = this.callfunc.openSide(EditExperenceComponent, { dataSelected: this.view.dataService.dataSelected, isAdd: true }, option);
      this.dialog.closed.subscribe(e => {
        console.log(e);
      })
    });
    this.dt.detectChanges();
  }

  editExperences(data?) {
    this.view.dataService.request.funcID = "MWP00202";
    this.view.dataService.request.entityName = "HR_EmployeeExperiences";
    this.view.dataService.idField = "recID"
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.edit(this.view.dataService.dataSelected).subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      this.view.dataService.dataSelected!.employeeID = this.employee!.employeeID;
      this.dialog = this.callfunc.openSide(EditExperenceComponent, { dataSelected: this.view.dataService.dataSelected, isAdd: false }, option);
    });
    this.dt.detectChanges();
  }

  editDataEdu(data) {
    this.allowedu = true;
    this.codxMwpService.EmployeeInfomation = this;
    this.codxMwpService.educationEdit.next(data || { employeeID: this.employeeInfo.employeeID });
  }

  addRelation() {
    this.view.dataService.request.funcID = "MWP00205";
    this.view.dataService.request.entityName = "HR_EmployeeRelations";
    this.view.dataService.idField = "recID"

    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      this.view.dataService.dataSelected!.employeeID = this.employee!.employeeID;
      this.dialog = this.callfunc.openSide(EditRelationComponent, { dataSelected: this.view.dataService.dataSelected, isAdd: true }, option);
    });
    this.dt.detectChanges();
  }

  editRelations(data?) {
    this.view.dataService.request.funcID = "MWP00205";
    this.view.dataService.request.entityName = "HR_EmployeeRelations";
    this.view.dataService.idField = "recID"
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.edit(this.view.dataService.dataSelected).subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      this.view.dataService.dataSelected!.employeeID = this.employee!.employeeID;
      this.dialog = this.callfunc.openSide(EditRelationComponent, { dataSelected: this.view.dataService.dataSelected, isAdd: false }, option);
    });
    this.dt.detectChanges();
  }

  popupAddHobbi(item: any) {
    this.allowhobby = true;
    var model = new DialogModel();
    model.DataService = new CRUDService(this.inject);
    var dt = item;
    var dialog = this.callfunc.openForm(EditHobbyComponent, '', 500, 350, '', dt, "", model);
    dialog.closed.subscribe(e => {
      this.employeeHobbie = [...e.event, ...[]];
      this.dt.detectChanges();
      console.log(e);
    })
  }


  deleteSkill(data) {
    this.api.exec('ERM.Business.HR', 'EmployeesBusiness', 'DeleteEmployeeSkill', data.recID)
      .subscribe((o: any) => {
        var index = this.skillChartEmployee.indexOf(data);
        if (index > -1) {
          this.skillChartEmployee.splice(index, 1);
        }
        index = this.skillEmployee.indexOf(data);
        if (index > -1) {
          this.skillEmployee.splice(index, 1);

        }
        this.dt.detectChanges();
      });
  }

  beforeDelHobby(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeleteEmployeeHobby';
    opt.className = 'EmployeesBusiness';
    opt.assemblyName = 'ERM.Business.HR';
    opt.data = itemSelected.recID;
    return true;
  }
  deleteHobby(data) {
    this.view.dataService.dataSelected = data;
    this.view.dataService.delete([this.view.dataService.dataSelected], true, (opt,) =>
      this.beforeDelHobby(opt)).subscribe((res) => {
        if (res) {
          this.employeeHobbieCategory = [];
          var obj: any = {};
          for (let index = 0; index < this.employeeHobbie.length; index++) {
            const element = this.employeeHobbie[index];
            if (!obj[element.catagory]) {
              obj[element.catagory] = 1;
              this.employeeHobbieCategory.push(element.catagory);
            }
          }
          this.codxMwpService.LoadData(this.employee.employeeID, "", "5").subscribe((response: any) => {
            if (response) {
              this.updateHobby(response);
            }
            this.dt.detectChanges();
          });
        }
      });

    // this.api.exec('ERM.Business.HR', 'EmployeesBusiness', 'DeleteEmployeeHobby', data.recID)
    //   .subscribe((o: any) => {
    //     const index = this.employeeHobbie.indexOf(data);
    //     if (index > -1) {
    //       this.employeeHobbie.splice(index, 1);
    //       this.employeeHobbieCategory = [];
    //       var obj: any = {};
    //       for (let index = 0; index < this.employeeHobbie.length; index++) {
    //         const element = this.employeeHobbie[index];
    //         if (!obj[element.catagory]) {
    //           obj[element.catagory] = 1;
    //           this.employeeHobbieCategory.push(element.catagory);
    //         }
    //       }
    //       this.dt.detectChanges();
    //     }
    //   });
  }

  beforeDelExperences(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeleteEmployeeExperiences';
    opt.className = 'EmployeesBusiness';
    opt.assemblyName = 'ERM.Business.HR';
    opt.data = itemSelected.recID;
    return true;
  }
  deleteExperences(data) {
    this.view.dataService.dataSelected = data;
    this.view.dataService.delete([this.view.dataService.dataSelected], true, (opt,) =>
      this.beforeDelExperences(opt)).subscribe((res) => {
        if (res) {
          this.codxMwpService.LoadData(this.employee.employeeID, "", "2").subscribe((response: any) => {
            if (response) {
              this.updateExperiences(response);
            }
            this.dt.detectChanges();
          });
        }
      });
   
  }


  beforeDelRelation(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeleteEmployeeRelation';
    opt.className = 'EmployeesBusiness';
    opt.assemblyName = 'ERM.Business.HR';
    opt.data = itemSelected.recID;
    return true;
  }
  deleteRelation(data) {
    this.view.dataService.dataSelected = data;
    this.view.dataService.delete([this.view.dataService.dataSelected], true, (opt,) =>
      this.beforeDelRelation(opt)).subscribe((res) => {
        if (res) {
          this.codxMwpService.LoadData(this.employee.employeeID, "", "7").subscribe((response: any) => {
            if (response) {
              this.updateRelation(response);
            }
            this.dt.detectChanges();
          });
        }
      });
  }

  beforeDelEducation(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeleteEmployeeEducation';
    opt.className = 'EmployeesBusiness';
    opt.assemblyName = 'ERM.Business.HR';
    opt.data = itemSelected.recID;
    return true;
  }
  deleteEducation(data) {
    this.view.dataService.dataSelected = data;
    this.view.dataService.delete([this.view.dataService.dataSelected], true, (opt,) =>
      this.beforeDelEducation(opt)).subscribe((res) => {
        if (res) {
          this.codxMwpService.LoadData(this.employee.employeeID, "", "4").subscribe((response: any) => {
            if (response) {
              this.updateTraining(response);
            }
            this.dt.detectChanges();
          });
        }
      });
  }
}
