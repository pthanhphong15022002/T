import { AfterViewInit, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ApiHttpService, CallFuncService, DataRequest, DialogModel, DialogRef, NotificationsService, SidebarModel, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { PopupEditComponent } from './popup-edit/popup-edit/popup-edit.component';

@Component({
  selector: 'app-company-infor',
  templateUrl: './company-infor.component.html',
  styleUrls: ['./company-infor.component.scss']
})
export class CompanyInforComponent implements OnInit, AfterViewInit {

  functionID = 'WPT02';
  entityName = 'WP_News';
  gridViewName = 'grvNews';
  predicate = "NewsType =@0 Category = @1 and (ApproveStatus = @2 or ApproveStatus = @3) and Status = @4";
  dataValue = "1;0;5;null;2";
  fromName = "News";
  dataEdit :any;
  views: Array<ViewModel> = [];
  @ViewChild('panelLeftRef') panelLefRef :  TemplateRef<any>;
  @ViewChild('codxViews') codxView: ViewsComponent;
  constructor(
    private api:ApiHttpService,
    private callc:CallFuncService,
    private notifySvr:NotificationsService,
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
    this.loadData();
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
          console.log(res);
          this.dataEdit = res;
          this.changedt.detectChanges();
        });
  }

  clickShowPopupEdit(){
    let option = new DialogModel();
    option.DataService = this.codxView.dataService;
    option.FormModel = this.codxView.formModel;
    let modal = this.callc.openForm(PopupEditComponent,"",600,600,"",this.dataEdit,"",option); 
    modal.closed.subscribe(dt => {
      if(this.codxView.dataService.dataSelected)
      this.dataEdit = this.codxView.dataService.dataSelected;
      this.changedt.detectChanges();
    })
  }
  close(e:any,t:CompanyInforComponent){
    var result = e.event?.result;
    if(result){
      t.dataEdit = result;
      t.dataEdit.contents = result.contents;
      t.notifySvr.notifyCode('E0026');
      t.changedt.detectChanges();
    } 
  }
}

