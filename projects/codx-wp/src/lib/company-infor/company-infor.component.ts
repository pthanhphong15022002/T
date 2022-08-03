import { AfterViewInit, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiHttpService, CallFuncService, DataRequest, DialogModel, DialogRef, NotificationsService, SidebarModel, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { PopupEditComponent } from './popup-edit/popup-edit/popup-edit.component';

@Component({
  selector: 'app-company-infor',
  templateUrl: './company-infor.component.html',
  styleUrls: ['./company-infor.component.scss']
})
export class CompanyInforComponent implements OnInit, AfterViewInit {

  funcID:string = '';
  entityName:string = 'WP_News';
  gridViewName:string = 'grvNews';
  predicate:string = "NewsType =@0 Category = @1 and (ApproveStatus = @2 or ApproveStatus = @3) and Status = @4";
  dataValue:string = "1;0;5;null;2";
  fromName:string = "News";
  data :any = null;
  views: Array<ViewModel> = [];
  @ViewChild('panelLeftRef') panelLefRef :  TemplateRef<any>;
  @ViewChild('codxViews') codxView: ViewsComponent;
  constructor(
    private api:ApiHttpService,
    private callc:CallFuncService,
    private notifySvr:NotificationsService,
    private route : ActivatedRoute,
    private changedt:ChangeDetectorRef) { }
  ngAfterViewInit(): void {
    this.views= [{
      id: "1",
      type: ViewType.content,
      active:true,
      model : {
        panelLeftRef : this.panelLefRef
      }
    }];
    this.changedt.detectChanges();

  }

  ngOnInit(): void {
    this.route.params.subscribe((param:any) => {
       this.funcID = param['funcID'];
        this.loadData();
      });
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
          this.changedt.detectChanges();
        });
  }

  clickShowPopupEdit(){
    let option = new DialogModel();
    option.DataService = this.codxView.dataService;
    option.FormModel = this.codxView.formModel;
    option.IsFull = true;
    let popup = this.callc.openForm(PopupEditComponent,"",0,0,"",this.data,"",option);
    popup.closed.subscribe((res:any)=>{
      if(res.event && res.closedBy != "escape"){
        this.data = res.event;
        this.changedt.detectChanges();
      }
    })
  }

  public inlineMode: object = { enable: true, onSelection: true };
}

