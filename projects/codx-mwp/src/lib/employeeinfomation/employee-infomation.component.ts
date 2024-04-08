import { D } from '@angular/cdk/keycodes';
import { AfterViewInit, Component, Injector, Optional, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { AuthService, CodxFormDynamicComponent, CRUDService, DataService, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, RequestOption, SidebarModel, UIComponent, Util, ViewModel, ViewType } from 'codx-core';
import { HRParametersComponent } from 'projects/codx-hr/src/lib/hrparameters/hrparameters.component';
import { CodxMwpService } from '../codx-mwp.service';
import { HR_EmployeeEducations } from '../model/HR_EmployeeEducations';
import { EditExperenceComponent } from './edit-experence/edit-experence.component';
import { EditHobbyComponent } from './edit-hobby/edit-hobby.component';
import { EditInfoComponent } from './edit-info/edit-info.component';
import { EditRelationComponent } from './edit-relation/edit-relation.component';
import { EditSkillComponent } from './edit-skill/edit-skill.component';
import { PopupAddEducationsComponent } from './popup/popup-add-educations/popup-add-educations.component';

@Component({
  selector: 'lib-employee-infomation',
  templateUrl: './employee-infomation.component.html',
  styleUrls: ['./employee-infomation.component.css'],
  //encapsulation: ViewEncapsulation.None

})
export class EmployeeInfomationComponent extends UIComponent {
  views: Array<ViewModel> = [];
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
  service = "BS";

  minType = "MinRange";
  data: Object[];
  primaryXAxis: Object;
  primaryYAxis: Object;
  moreFunc = []
  functionID: string = "";
  defautFunc: any = null;
  formName: string = "";
  gridViewName: string = "";
  user: any;
  dialog!: DialogRef;
  formModel: FormModel;
  showCBB = false;
  parameter: any =
  {
    maxLevelSkill: 0
  };
  @ViewChild('panelContent') panelContent: TemplateRef<any>;
  itemSelected: any;
  employeeID: any;
  width: number = 720;
  height: number = window.innerHeight;
  constructor(
    private injector: Injector,
    private codxMwpService: CodxMwpService,
    private notifiSV: NotificationsService,
    private auth: AuthService,
  ) {
    super(injector);
    this.user = this.auth.userValue;
  }



  onInit(): void {
    this.router.params.subscribe((param: any) => {
      if (param) {
        this.functionID = param['funcID'];
        this.employeeID  = this.router.snapshot.queryParams["employeeID"];
        this.getEmployeeInfo(this.employeeID);
        this.getDataAsync(this.functionID);
        this.codxMwpService.modeEdit.subscribe(res => {
          this.editMode = res;
          this.editSkillMode = false;
        })
        this.codxMwpService.empInfo.subscribe((res: string) => {
          if (res) {
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
        this.cache.functionList("MWP002").subscribe((res: any) => {
          if (res) {
            this.formName = res.formName;
            this.gridViewName = res.gridViewName;
            this.cache.moreFunction(this.formName, this.gridViewName).subscribe((res: any) => {
              this.detectorRef.detectChanges();
            });
          }
        });
        this.primaryXAxis = {
          valueType: 'Category',
          labelPlacement: 'OnTicks',

        };
        this.primaryYAxis = {
          minimum: 0, maximum: 10, interval: 2,
          edgeLabelPlacement: 'Shift',
          labelFormat: '{value}'
        };
      }
      else
      {
        this.getEmployeeInfo(this.employeeID);
      }
    });
    this.getParameterAsync("HRParameters", "1");

  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        model: {
          panelRightRef: this.panelContent,
        }
      },
    ];
    this.detectorRef.detectChanges();
  }

  geteEmployeeInfor(employeeID: string) {
    if (employeeID) {
      this.api
        .execSv("HR", "ERM.Business.HR", "EmployeesBusiness_Old", "GetByUserAsync", [employeeID])
        .subscribe((res: any) => {
          if (res) {

          }
        });
    }
  }
  getDataAsync(funcID: string) {
    this.getDataFromFunction(funcID);
  }
  getDataFromFunction(functionID: string) {
    if (functionID) {
      this.api.execSv
        (
          'SYS',
          'ERM.Business.SYS',
          'MoreFunctionsBusiness',
          'GetMoreFunctionByHRAsync',
          [this.functionID]
        ).subscribe((res: any[]) => {
          if (res && res.length > 0) {
            this.moreFunc = res;
            this.defautFunc = res[0];
            this.detectorRef.detectChanges();
          }
        });
    }
  }
  editSkill() {
    if (this.view) {
      this.editSkillMode = true;
      var model = new DialogModel();
      model.DataService = this.view.dataService;
      model.FormModel = this.view.formModel;
      var data = {
        employeeID: this.employee.employeeID,
        skill: this.skillEmployee,
      }
      let popup = this.callfc.openForm(EditSkillComponent, '', 450, 600, '', data, "", model);
      popup.closed.subscribe((res: any) => {
        if (res?.event) {
          this.skillEmployee = JSON.parse(JSON.stringify(res.event));
        }
      });
    }
  }
  scrollToElement(idElement: any): void {
    if (!idElement) return;
    let element = document.getElementById(idElement);
    element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
  }
  getQueryParams() {
    this.router.queryParams.subscribe((params) => {
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
      if (employeeID.InfoPersonal)  // Info
      {
        this.employeeInfo = employeeID.InfoPersonal;
      }
      this.codxMwpService.infoLeftComponent.dataEmployee = {
        dataRoot: this.employee,
        employeeInfo: this.employeeInfo
      };
    }
  }
  LoadData(employee) {
    this.loadEmployee(employee, e => { });
    this.codxMwpService.LoadData(employee.Employee.employeeID, "", "2")
      .subscribe((response: any) => {
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
    if (response.Skill) {
      var skill = response.Skill;
      if (skill.Request)
        this.skillRequest = skill.Request;
      if (skill.Employee) {
        this.skillEmployee = skill.Employee;
        for (let index = 0; index < this.skillEmployee.length; index++) {
          const element = this.skillEmployee[index];
          this.skillChartEmployee.push(element);
        }
        this.detectorRef.detectChanges();
      }
    }
  }
  onSectionChange(data: any) {
    console.log(data);
    this.codxMwpService.currentSection = data.current;
    this.detectorRef.detectChanges();
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
      this.view.dataService.dataSelected!.employeeID = this.employee!.employeeID;
      this.dialog = this.callfc.openSide(EditInfoComponent, 'edit', option);
      this.dialog.closed.subscribe((e) => {
        if (e?.event == null)
          this.view.dataService.delete(
            [this.view.dataService.dataSelected],
            false
          );
        if (e?.event && e?.event != null) {
          this.loadEmployee(e.event)
          this.detectorRef.detectChanges();
        }
      });
    });
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
      this.dialog = this.callfc.openSide(EditExperenceComponent, { dataSelected: this.view.dataService.dataSelected, isAdd: true }, option);
      this.dialog.closed.subscribe(e => {
        if (e?.event && e?.event != null) {
          if (e?.event.WorkedCompany)
            this.ExperencesWorked = e?.event.WorkedCompany;
          if (e?.event.CurrentCompany)
            this.ExperencesCurrent = e?.event.CurrentCompany;
          this.detectorRef.detectChanges();
        }
      })
    });
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
      this.dialog = this.callfc.openSide(EditExperenceComponent, { dataSelected: this.view.dataService.dataSelected, isAdd: false }, option);
      this.dialog.closed.subscribe(e => {
        if (e?.event && e?.event != null) {
          if (e?.event.WorkedCompany)
            this.ExperencesWorked = e?.event.WorkedCompany;
          if (e?.event.CurrentCompany)
            this.ExperencesCurrent = e?.event.CurrentCompany;
          this.detectorRef.detectChanges();
        }
      })
    });
  }

  editDataEdu() {
    debugger
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
      this.dialog = this.callfc.openSide(EditRelationComponent, { dataSelected: this.view.dataService.dataSelected, isAdd: true }, option);
      this.dialog.closed.subscribe(e => {
        if (e?.event && e?.event != null) {
          this.employeeRelationship = e?.event;
          this.detectorRef.detectChanges();
        }
      })
    });
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
      this.dialog = this.callfc.openSide(EditRelationComponent, { dataSelected: this.view.dataService.dataSelected, isAdd: false }, option);
      this.dialog.closed.subscribe(e => {
        if (e?.event && e?.event != null) {
          this.employeeRelationship = e?.event;
          this.detectorRef.detectChanges();
        }
      })
    });
  }

  popupAddHobbi(item: any) {
    this.allowhobby = true;
    var model = new DialogModel();
    model.DataService = new CRUDService(this.injector);
    var dt = item;
    var dialog = this.callfc.openForm(EditHobbyComponent, '', 500, 350, '', dt, "", model);
    dialog.closed.subscribe(e => {
      this.employeeHobbie = [...e.event, ...[]];
      this.detectorRef.detectChanges();
      console.log(e);
    })
  }


  deleteSkill(data) {
    this.api.exec('ERM.Business.HR', 'EmployeesBusiness_Old', 'DeleteEmployeeSkill', data.recID)
      .subscribe((o: any) => {
        var index = this.skillChartEmployee.indexOf(data);
        if (index > -1) {
          this.skillChartEmployee.splice(index, 1);
        }
        index = this.skillEmployee.indexOf(data);
        if (index > -1) {
          this.skillEmployee.splice(index, 1);

        }
        this.detectorRef.detectChanges();
      });
  }

  beforeDelHobby(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeleteEmployeeHobby';
    opt.className = 'EmployeesBusiness_Old';
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
            this.detectorRef.detectChanges();
          });
        }
      });
  }

  beforeDelExperences(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeleteEmployeeExperiences';
    opt.className = 'EmployeesBusiness_Old';
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
            this.detectorRef.detectChanges();
          });
        }
      });

  }


  beforeDelRelation(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeleteEmployeeRelation';
    opt.className = 'EmployeesBusiness_Old';
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
            this.detectorRef.detectChanges();
          });
        }
      });
  }

  beforeDelEducation(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeleteEmployeeEducation';
    opt.className = 'EmployeesBusiness_Old';
    opt.assemblyName = 'ERM.Business.HR';
    opt.data = itemSelected.recID;
    return true;
  }
  

  getParameterAsync(formName: string, category: string) {
    if (!formName || !category) return;
    this.api.execSv("SYS",
      "ERM.Business.SYS",
      "SettingValuesBusiness",
      "GetParameterAsync",
      [formName, category]).subscribe((res: any) => {
        if (res) {
          let jsParameter = JSON.parse(res);
          this.parameter.maxLevelSkill = jsParameter.MaxLevelSkills;
        }
      });
  }

  saveAddSkill(event: any) {
    if (!event || !event?.dataSelected) return;
    let data = event.dataSelected;
    let skills = [];
    if (data && data.length > 0) {
      data.map((element: any) => {
        let isExsitElement = this.skillEmployee
          .some((x: any) => x.competenceID == element.CompetenceID)
        if (!isExsitElement) {
          let skill = {
            RecID: Util.uid(),
            CompetenceID: element.CompetenceID,
            CompetenceName: element.CompetenceName,
            ValueX: 0,
            Rating: "0"
          }
          skills.push(skill);
        }
      });
      if (skills.length > 0) {
        this.api.execSv(
          "HR",
          "ERM.Business.HR",
          "EmployeesBusiness_Old",
          "AddSkillsEmployeeAsync",
          [this.employee.employeeID, skills]
        ).subscribe((res: any) => {
          if (res && res.length > 0) {
            res.forEach((e) => {
              this.skillEmployee.push(e);
            });
            this.detectorRef.detectChanges();
            this.notifiSV.notifyCode("SYS006");
          }
          else {
            this.notifiSV.notifyCode("SYS023");
          }
        });
      }
      else {
        this.notifiSV.notifyCode("SYS031");
      }
    }

  }

  clickOpenPopupAddSkill() {
    this.showCBB = !this.showCBB;
  }
  // load employee info
  employeeInfor:any = null;

  getEmployeeInfo(employeeID:string){
    this.api.execSv(
      "HR",
      "ERM.Business.HR",
      "EmployeesBusiness_Old",
      "GetEmployeeInforAsync",
      [employeeID])
      .subscribe((res:any) => {
        if(res)
        {
          this.employeeInfor = res;
        }
      });
  }
  // popup education
  openPopupEducation()
  { 
    if(this.employeeInfor.employeeID)
    {
      this.cache.gridViewSetup("EmployeeEducations","grvEmployeeEducations")
      .subscribe(grv => {
        if(grv)
        {
          let _formModel = new FormModel();
          _formModel.gridViewName = "grvEmployeeEducations";
          _formModel.formName = "EmployeeEducations";
          _formModel.entityName = "HR_EmployeeEducations";
          let _options = new SidebarModel();
          _options.Width = '550px';
          _options.FormModel = _formModel;
          let data = new HR_EmployeeEducations();
          data.employeeID = this.employeeInfor.employeeID;
          let _data = {
            headerText:"Thêm mới nơi đào tạo",
            isAdd:true,
            grv:grv,
            data : data
          }
          this.callfc.openSide(PopupAddEducationsComponent,_data,_options)
          .closed.subscribe((res:any) => {
            if(res.event){
              if(!this.employeeInfor.educations || this.employeeInfor.educations.length == 0)
              {
                this.employeeInfor.educations = [];
              }
              this.employeeInfor.educations.unshift(res.event);
              this.detectorRef.detectChanges();
            }
          });
        }
        
      });
    }
  }
  // open popup edit
  openPopupEdit(item:any){
    if(this.employeeInfor.employeeID)
    {
      this.cache.gridViewSetup("EmployeeEducations","grvEmployeeEducations")
      .subscribe(grv => {
        if(grv)
        {
          let _formModel = new FormModel();
          _formModel.gridViewName = "grvEmployeeEducations";
          _formModel.formName = "EmployeeEducations";
          _formModel.entityName = "HR_EmployeeEducations";
          let _options = new SidebarModel();
          _options.Width = '550px';
          _options.FormModel = _formModel;
          let data = JSON.parse(JSON.stringify(item));
          let _data = {
            headerText:"Cập nhật nơi đào tạo",
            isAdd:false,
            grv:grv,
            data : data
          }
          this.callfc.openSide(PopupAddEducationsComponent,_data,_options)
          .closed.subscribe((res:any) => {
            if(res.event){
              let _index = this.employeeInfor.educations.findIndex(x => x.recID == item.recID);
              if(_index >= 0)
              {
                this.employeeInfor.educations[_index] = JSON.parse(JSON.stringify(res.event));
              }
              this.detectorRef.detectChanges();
            }
          });
        }
        
      });
    }
  }
  // delete education
  deleteEducation(item:any){
    if(item.recID){
      this.notifiSV.alertCode("SYS030").subscribe(res => {
        debugger
        if(res.event.status == "Y"){
        this.api.execSv("HR","ERM.Business.HR","EducationsBusiness_Old","DeleteAsync",[item])
        .subscribe((res:any) => {
          if(res){
            this.notifiSV.notifyCode("SYS008");
            let _index = this.employeeInfor.educations.findIndex(x => x.recID == item.recID);
            if(_index > -1 )
            {
              this.employeeInfor.educations.splice(_index,1);
            }
          }
          else
          {
            this.notifiSV.notifyCode("SYS022");
          }
        });
        }
      });
    }
    
  }
  
}

