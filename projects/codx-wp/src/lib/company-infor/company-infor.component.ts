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
    this.loadData();
    let funcID =  this.router.snapshot.params["funcID"];
    if(funcID){
      let funcIDPermisson = funcID + "P";
      this.getUserPermission(funcIDPermisson);
    }
    
  }
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
  loadData(){
      this.api
        .execSv(
          'WP',
          'ERM.Business.WP',
          'NewsBusiness',
          'GetConpanyInforAsync'
        )
        .subscribe((res:any) => {
          this.data = res;
          this.data.contentHtml = this.sanitizer.bypassSecurityTrustHtml(this.data.contents);
          this.detectorRef.detectChanges();
        });
  }

  clickShowPopupEdit(){
    if(this.view){
      let option = new DialogModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.IsFull = true;
      let popup = this.callc.openForm(CompanyEditComponent,"",0,0,"",this.data,"",option);
      popup.closed.subscribe((res:any)=>{
        if(res.event && res.closedBy != "escape"){
          this.data = res.event;
          this.detectorRef.detectChanges();
        }
      });
    }
  }

  

}

