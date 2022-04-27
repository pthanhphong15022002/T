import { ChangeDetectorRef, Component, HostListener, Injector, ViewChild, ViewEncapsulation, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileOverviewService } from './profile-overview.service';

import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiHttpService, NotificationsService } from 'codx-core';

@Component({
  selector: 'app-profile-overview',
  templateUrl: './profile-overview.component.html',
  styleUrls: ['./profile-overview.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProfileOverviewComponent {

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
  service = "BS"

  @ViewChild('contentSkill') contentSkill;
  //currentSection = 'InfoPersonal';
  constructor(private profileOverviewService: ProfileOverviewService,
    private ngxService: NgxUiLoaderService,
    private notificationsService: NotificationsService,
    private dt: ChangeDetectorRef, private routeActive: ActivatedRoute, private api: ApiHttpService,
    injector: Injector,
  ) {   
    //this.cbxsv.getDataCache("Skills");
    this.routeActive.queryParams.subscribe(params => {
      // if (params.id)
      //   this.profileOverviewService.employeeID = params.id;
      // this.profileOverviewService.GetUser();
    });
    // this.profileOverviewService.modeEdit.next(false);
    // this.cbxsv.dataChanging = data => {
    //   if (data) {
    //     for (let index = 0; index < data.length; index++) {
    //       const element = data[index];
    //       element._selected = this.isCheck(element);
    //     }
    //   }
    // };
  }
  getContrastYIQ(item){
    var hexcolor = (item.color ||"#ffffff").replace("#", "");
    var r = parseInt(hexcolor.substr(0,2),16);
    var g = parseInt(hexcolor.substr(2,2),16);
    var b = parseInt(hexcolor.substr(4,2),16);
    var yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? 'black' : 'white';
}
  editSkill() {
    this.editSkillMode = true;
  }
  ngOnInit(): void {
    // this.profileOverviewService.modeEdit.subscribe(res => {
    //   this.editMode = res;
    //   this.editSkillMode = false;
    // })
    // this.profileOverviewService.empInfo.subscribe((res: string) => {
    //   if (res) {
    //     //console.log(res);
    //     this.employeeInfo = null;
    //     this.employeeHobbie = null;
    //     this.employeeContracts = null;
    //     this.ExperencesWorked = null;
    //     this.ExperencesCurrent = null;
    //     this.employeeRelationship = null;
    //     this.skillRequest = null;
    //     this.skillEmployee = null;
    //     this.skillChartEmployee = null;
    //     this.trainingInterObl = null;
    //     this.trainingInterUnObl = null;
    //     this.trainingPersonal = null;
    //     this.dataPolicy = null;

    //     this.LoadData(res);
    //   }
    // });
    //this.LoadData();
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
        //this.profileOverviewService.employee = employeeID.Employee;
        this.employee = employeeID.Employee;

      }
      if (employeeID.InfoPersonal) {// Info
        this.employeeInfo = employeeID.InfoPersonal;
      }
      // this.profileOverviewService.profileCardComponent.dataEmployee = {
      //   dataRoot: this.employee,
      //   employeeInfo: this.employeeInfo
      // };
    }
  }
  LoadData(employee) {
    this.loadEmployee(employee, e => {

    });
    setTimeout(() => {
      this.profileOverviewService.LoadData(employee.Employee.employeeID, "2").subscribe((response: any) => {
        if (response) {
          this.updateExperiences(response);
        }
      });

      this.profileOverviewService.LoadData(employee.Employee.employeeID, "4").subscribe((response: any) => {
        if (response) {
          this.updateTraining(response);
        }
      });
      this.profileOverviewService.LoadData(employee.Employee.employeeID, "5").subscribe((response: any) => {
        this.updateHobby(response);
      });

      this.profileOverviewService.LoadData(employee.Employee.employeeID, "7").subscribe((response: any) => {
        if (response) {
          this.updateRelation(response);
        }
      });
      this.profileOverviewService.LoadData(employee.Employee.employeeID, "8").subscribe((response: any) => {
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
    var that = this;
    var per = document.getElementById("InfoPersonal");
    // $("#erm_content").scroll(function(){
    //   var a = "InfoPersonal";
    //   if($("#InfoPersonal").position().top<0) a = "Experences";
    //   if($("#Experences").position().top<0) a = "Skill";
    //   if($("#Skill").position().top<0) a = "Training";
    //   if($("#Training").position().top<0) a = "RelationShip";
    //   if($("#RelationShip").position().top<0) a = "Hobbie";

    //   that.profileOverviewService.refreshActive.next(a);
    // });
  }

  ngOnChanges() {

  }
  onSectionChange(data: any) {
    //this.currentSection = sectionId;
    console.log(data);
    this.profileOverviewService.currentSection = data.current;
    this.dt.detectChanges();
  }

  editInfo(data) {
    this.allowinfo = true;
    this.profileOverviewService.profileOverviewComponent = this;
    this.profileOverviewService.editInfo(data);
    this.dt.detectChanges();
  }
  editExperences(data?) {
    this.allowexp = true;
    this.profileOverviewService.profileOverviewComponent = this;
    this.profileOverviewService.experienceEdit.next(data || { employeeID: this.employeeInfo.employeeID });
  }
  editDataEdu(data) {
    this.allowedu = true;
    this.profileOverviewService.profileOverviewComponent = this;
    this.profileOverviewService.educationEdit.next(data || { employeeID: this.employeeInfo.employeeID });
  }
  editRelation(data) {
    this.allowrela = true;
    this.profileOverviewService.profileOverviewComponent = this;
    this.profileOverviewService.relationEdit.next(data || { employeeID: this.employeeInfo.employeeID });
  }
  editHobby(data) {
    this.allowhobby = true;
    this.profileOverviewService.profileOverviewComponent = this;
    data = data || { employeeID: this.employeeInfo.employeeID };
    data.list = this.employeeHobbie;
    this.profileOverviewService.hobbyEdit.next(data);
  }
  editDataSkill(data?) {

    // this.cbxsv.dataSelcected = [];
    // if (this.skillChartEmployee) {
    //   for (let i = 0; i < this.skillChartEmployee.length; i++) {
    //     const element = this.skillChartEmployee[i];
    //     this.cbxsv.dataSelcected.push(element);
    //     this.cbxsv.selcectedDF.push(element);
    //   }
    // }
    // this.cbxsv.appendData();
    // this.modalService.open(this.contentSkill, { ariaLabelledBy: 'modal-basic-title', windowClass: 'custom-class' }).result.then((result) => {

    // }, (reason) => {

    // });
  }

  ItemClick(data, event) {
    if (event != null || !data.competenceID) event.preventDefault();
    if (this.isCheck(data)) return;

    const search = obj => obj["competenceID"] === data.competenceID;
    // var exist = this.cbxsv.dataSelcected.findIndex(search);
    // if (!data._selected) {

    //   if (exist > -1) return;
    //   this.cbxsv.dataSelcected.push(data);
    // }
    // else {
    //   this.cbxsv.dataSelcected.splice(exist, 1);
    // }
    // data._selected = !data._selected;
    // this.cbxsv.appendData();
  }
  chooseContentSkill($event) {
    // if (this.cbxsv.dataSelcected) {
    //   for (let index = 0; index < this.cbxsv.dataSelcected.length; index++) {
    //     const element = this.cbxsv.dataSelcected[index];
    //     element.employeeID = this.employeeInfo.employeeID
    //   }

    //   this.ngxService.startBackground();
    //   this.isSaving = true;

    //   this.api.exec('ERM.Business.HR', 'EmployeesBusiness', 'UpdateEmployeeSkillAsync', [this.cbxsv.dataSelcected])
    //     .subscribe((o: any) => {
    //       this.ngxService.stopBackground();
    //       this.isSaving = false;
    //       this.updateSkill({ Skill: o });
    //       $event.modal.close();
    //       this.dt.detectChanges();
    //     });
    // }
    // else {
    //   $event.modal.close();
    // }

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
  deleteSkill(data) {
    // this.confirmationDialogService.confirm("Question", "Bạn có muốn xóa ?")
    //   .then((confirmed) => {
    //     if (confirmed) {
    //       this.api.exec('ERM.Business.HR', 'EmployeesBusiness', 'DeleteEmployeeSkill', data.recID)
    //         .subscribe((o: any) => {
    //           var index = this.skillChartEmployee.indexOf(data);
    //           if (index > -1) {
    //             this.skillChartEmployee.splice(index, 1);
    //           }
    //           index = this.skillEmployee.indexOf(data);
    //           if (index > -1) {
    //             this.skillEmployee.splice(index, 1);

    //           }
    //           this.dt.detectChanges();
    //         });
    //     };
    //   }
    //   )
    //   .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
  }
  deleteExperences(data) {
    // this.confirmationDialogService.confirm("Question", "Bạn có muốn xóa ?")
    //   .then((confirmed) => {
    //     if (confirmed) {
    //       this.api.exec('ERM.Business.HR', 'EmployeesBusiness', 'DeleteEmployeeExperiences', data.recID)
    //         .subscribe((o: any) => {
    //           const index = this.ExperencesWorked.indexOf(data);
    //           if (index > -1) {
    //             this.ExperencesWorked.splice(index, 1);
    //             this.dt.detectChanges();
    //           }

    //         });
    //     };
    //   }
    //   )
    //   .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
  }
  deleteRelation(data) {
    // this.confirmationDialogService.confirm("Question", "Bạn có muốn xóa ?")
    //   .then((confirmed) => {
    //     if (confirmed) {
    //       this.api.exec('ERM.Business.HR', 'EmployeesBusiness', 'DeleteEmployeeRelation', data.recID)
    //         .subscribe((o: any) => {
    //           const index = this.employeeRelationship.indexOf(data);
    //           if (index > -1) {
    //             this.employeeRelationship.splice(index, 1);
    //             this.dt.detectChanges();
    //           }

    //         });
    //     };
    //   }
    //   )
    //   .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
  }
  deleteEducation(data) {
    // this.confirmationDialogService.confirm("Question", "Bạn có muốn xóa ?")
    //   .then((confirmed) => {
    //     if (confirmed) {
    //       this.api.exec('ERM.Business.HR', 'EmployeesBusiness', 'DeleteEmployeeEducation', data.recID)
    //         .subscribe((o: any) => {
    //           const index = this.trainingPersonal.indexOf(data);
    //           if (index > -1) {
    //             this.trainingPersonal.splice(index, 1);
    //             this.dt.detectChanges();
    //           }

    //         });
    //     };
    //   }
    //   )
    //   .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
  }
  deleteHobby(data) {
    // this.confirmationDialogService.confirm("Question", "Bạn có muốn xóa ?")
    //   .then((confirmed) => {
    //     if (confirmed) {
    //       this.api.exec('ERM.Business.HR', 'EmployeesBusiness', 'DeleteEmployeeHobby', data.recID)
    //         .subscribe((o: any) => {
    //           const index = this.employeeHobbie.indexOf(data);
    //           if (index > -1) {
    //             this.employeeHobbie.splice(index, 1);
    //             this.employeeHobbieCategory = [];
    //             var obj: any = {};
    //             for (let index = 0; index < this.employeeHobbie.length; index++) {
    //               const element = this.employeeHobbie[index];
    //               if (!obj[element.catagory]) {
    //                 obj[element.catagory] = 1;
    //                 this.employeeHobbieCategory.push(element.catagory);
    //               }

    //             }
    //             this.dt.detectChanges();
    //           }

    //         });
    //     };
    //   }
    //   )
    //   .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
  }
  setMyStyles(data) {
    // if (!data) return;
    // let styles = {
    //   'width': (data.valueX / 10 * 100) + "%",
    // };
    // return styles;
  }

}
