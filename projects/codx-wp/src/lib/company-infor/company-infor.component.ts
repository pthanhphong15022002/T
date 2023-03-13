import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiHttpService, CallFuncService, DataRequest, DialogModel, DialogRef, NotificationsService, SidebarModel, UIComponent, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { CompanyEditComponent } from './popup-edit/company-edit/company-edit.component';
import { DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-company-infor',
  templateUrl: './company-infor.component.html',
  styleUrls: ['./company-infor.component.scss']
})
export class CompanyInforComponent extends UIComponent {

  funcID:string = '';
  entityName:string = 'WP_News';
  gridViewName:string = 'grvNews';
  fromName:string = "News";
  data :any = null;
  views: Array<ViewModel> = [];
  userPermission:any = null;
  loaded:boolean = true;
  @ViewChild('panelLeftRef') panelLefRef :  TemplateRef<any>;
  constructor(
    private injector:Injector,
    private callc:CallFuncService,
    private notifySvr:NotificationsService,
    private sanitizer: DomSanitizer
    ) 
    {
      super(injector);
    }
  ngAfterViewInit(): void {
    this.views= [{
      id: "1",
      type: ViewType.content,
      active:true,
      model : {
        panelLeftRef : this.panelLefRef
      }
    }]; 
  }

  onInit(): void {
    let funcID =  this.router.snapshot.params["funcID"];
    if(funcID){
      this.funcID = funcID + "P";
      this.loadData(this.funcID);
      this.getUserPermission(this.funcID);
    }
    
  }
  // get permission by user
  getUserPermission(funcID:string){
    if(funcID){
      this.api.execSv("SYS","ERM.Business.SYS","CommonBusiness","GetUserPermissionsAsync",[funcID])
      .subscribe((res:any) => {
        if(res){
          this.userPermission = res;
          this.detectorRef.detectChanges();
        }
      });
    }
  }
  // get companyinfor
  loadData(funcID:string){
    if(funcID){
      this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'GetConpanyInforAsync',
        [funcID])
        .subscribe((res:any) => {
          if(res)
          {
            this.data = JSON.parse(JSON.stringify(res));
            this.detectorRef.detectChanges();
          }
          else
            this.loaded = false;
      });
    }
  }

  clickShowPopupEdit(){
    if(this.view){
      let option = new DialogModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.IsFull = true;
      let popup = this.callc.openForm(CompanyEditComponent,"",0,0,"",this.data,"",option);
      popup.closed.subscribe((res:any)=>{
        if(res?.event){
          let isAppro = res.event[0];
          if(!isAppro)
          {
            this.data = JSON.parse(JSON.stringify(res.event[1]));
            this.detectorRef.detectChanges();
          }
          this.notifySvr.notifyCode('WP024');
        }
      });
    }
  }

  

}

