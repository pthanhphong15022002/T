import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiHttpService, CallFuncService, DataRequest, DialogModel, DialogRef, NotificationsService, SidebarModel, UIComponent, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { CompanyEditComponent } from './popup-edit/company-edit/company-edit.component';
import { DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-company-infor',
  templateUrl: './company-infor.component.html',
  styleUrls: ['./company-infor.component.scss']
})
export class CompanyInforComponent extends UIComponent implements OnDestroy {

  entityName:string = 'WP_News';
  gridViewName:string = 'grvNews';
  fromName:string = "News";
  data :any = null;
  views: Array<ViewModel> = [];
  userPermission:any = null;
  loaded:boolean = false;

  subscritions = new Subscription();
  @ViewChild('panelLeftRef') panelLefRef :  TemplateRef<any>;
  constructor(
    private injector:Injector,
    private callc:CallFuncService,
    private notifySvr:NotificationsService,
    private sanitizer: DomSanitizer,
  ) 
  {
    super(injector);
  }
  ngOnDestroy(): void {
    this.subscritions.unsubscribe();
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
    this.funcID =  this.router.snapshot.params["funcID"];
    if(this.funcID){
      this.loadData();
      this.getUserPermission(this.funcID + "P");
    }
    
  }
  // get permission by user
  getUserPermission(funcID:string){
    if(funcID)
    {
      let subscribe = this.api.execSv("SYS","ERM.Business.SYS","CommonBusiness","GetUserPermissionsAsync",[funcID])
      .subscribe((res:any) => {
        if(res){
          this.userPermission = res;
          this.detectorRef.detectChanges();
        }
      });
      this.subscritions.add(subscribe);
    }
  }
  // get companyinfor
  loadData(){
    let subscribe = this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'GetConpanyInforAsync')
        .subscribe((res:any) => {
          if(res)
          {
            this.data = JSON.parse(JSON.stringify(res));
            this.detectorRef.detectChanges();
          }
          this.loaded = true;
      });
      this.subscritions.add(subscribe);
  }

  clickShowPopupEdit(){
    if(this.view){
      let option = new DialogModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.IsFull = true;
      let popup = this.callc.openForm(CompanyEditComponent,"",0,0,"",this.data,"",option);
      let subscribe = popup.closed.subscribe((res:any)=>{
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
      this.subscritions.add(subscribe);
    }
  }

  

}

