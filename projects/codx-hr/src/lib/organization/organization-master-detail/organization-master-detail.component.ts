import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { ApiHttpService, CacheService, CallFuncService, CodxGridviewComponent, CRUDService, FormModel, ScrollComponent, SidebarModel, ViewsComponent } from 'codx-core';
import { PopupAddOrganizationComponent } from '../popup-add-organization/popup-add-organization.component';

@Component({
  selector: 'lib-organization-masterdetail',
  templateUrl: './organization-master-detail.component.html',
  styleUrls: ['./organization-master-detail.component.css']
})
export class OrganizationMasterDetailComponent implements OnInit, OnChanges{

  @Input() orgUnitID:string = "";
  @Input() view:ViewsComponent = null; 
  @Input() formModel:FormModel = null;
  employeeManager:any = null;
  totalEmployee:number = 0;
  columnsGrid:any[] = null;
  grvSetup:any = {};
  formModelEmp:FormModel = new FormModel();
  @ViewChild("grid") grid:CodxGridviewComponent;
  @ViewChild("templateName") templateName:TemplateRef<any>;
  @ViewChild("templateBirthday") templateBirthday:TemplateRef<any>;
  @ViewChild("templatePhone") templatePhone:TemplateRef<any>;
  @ViewChild("templateEmail") templateEmail:TemplateRef<any>;
  @ViewChild("templateJoinedOn") templateJoinedOn:TemplateRef<any>;
  @ViewChild("templateStatus") templateStatus:TemplateRef<any>;
  @ViewChild("templateMoreFC") templateMoreFC:TemplateRef<any>;

  constructor(
    private api:ApiHttpService,
    private cache:CacheService,
    private callFC:CallFuncService,
    private dt:ChangeDetectorRef,
  ) 
  { 
    
  }

  
  ngOnInit(): void {
    this.formModelEmp.formName = "Employees";
    this.formModelEmp.gridViewName = "grvEmployees" 
    this.formModelEmp.entityName = "HR_Employees";
    this.cache.gridViewSetup(this.formModelEmp.formName,this.formModelEmp.gridViewName)
    .subscribe((grd:any) => {
      if(grd){
        this.grvSetup = grd;
        this.columnsGrid = [
          {
            headerText: grd["EmployeeName"]["headerText"],
            field:"EmployeeName",
            template:this.templateName,
            width: '30%',
          },
          {
            headerText: grd["Birthday"]["headerText"],
            field:"Birthday",
            template:this.templateBirthday,
            width: '10%',
          },
          {
            headerText: grd["Phone"]["headerText"],
            field:"Phone",
            template:this.templatePhone,
            width: '15%',
          },
          {
            headerText: grd["Email"]["headerText"],
            field:"Email",
            template:this.templateEmail,
            width: '15%',
          },
          {
            headerText: grd["JoinedOn"]["headerText"],
            field:"JoinedOn",
            template:this.templateJoinedOn,
            width: '10%',
          },
          {
            headerText: grd["Status"]["headerText"],
            field:"Status",
            template:this.templateStatus,
            width: '20%',
          }
        ];
      }
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes.orgUnitID.currentValue != changes.orgUnitID.previousValue){
      this.getManager(this.orgUnitID);
      if(this.grid){
        this.grid.dataService.setPredicates([],[this.orgUnitID]).subscribe();
      }
    }
  }

  // get employee manager by orgUnitID
  getManager(orgUnitID:string){
    if(orgUnitID){
      this.api.execSv("HR","ERM.Business.HR","OrganizationUnitsBusiness","GetManagerAsync",[orgUnitID])
      .subscribe((res:any) => {
        if(res)
        {
          this.employeeManager = JSON.parse(JSON.stringify(res));
        }
        else
        {
          this.employeeManager = null;
        }
        this.dt.detectChanges();
      });
    }
  }

  // click moreFC
  clickMF(event: any, data: any) {
    if (event) {
      switch (event.functionID) {
        case 'SYS02': //delete

          break;
        case 'SYS03': // edit
          this.editData(data, event);
          break;
        case 'SYS04': // copy
          break;
        default:
          break;
      }
    }
  }
  //delete data
  editData(data, event){
    if(this.grid){
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.grid.dataService;
      option.FormModel = this.formModel;
      let object = {
        data:data,
        action: event,
        funcID:this.formModel.funcID,
        isModeAdd : false
      }
      let popup = this.callFC.openSide(PopupAddOrganizationComponent,object,option,this.formModel.funcID);
      popup.closed.subscribe((res:any) => {
        if(res.event){
          let org = res.event[0];
          let tmpOrg = res.event[1];
          (this.grid.dataService as CRUDService).update(tmpOrg).subscribe();
          this.view.dataService.add(org).subscribe();
        }
      });
    }
    }
  }

