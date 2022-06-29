import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ViewModel, ViewsComponent, ApiHttpService, CodxService, CallFuncService, ViewType, SidebarModel } from 'codx-core';
import { PopupAddComponent } from '../popup/popup-add/popup-add.component';

@Component({
  selector: 'lib-view-detail',
  templateUrl: './view-detail.component.html',
  styleUrls: ['./view-detail.component.css']
})
export class ViewDetailComponent implements OnInit {

  NEW_TYPE = {
    post: "1",
    video: "2"
  }
  category:string ="";
  recID:string = "";
  funcID:string = "";
  dataItem:any;
  listViews = [];
  listTag = [];
  listNews=[];
  views: Array<ViewModel> = [
    {
      id: '1',
      type: ViewType.listdetail,
      active: false
    },
  ];
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('codxViews') codxViews: ViewsComponent;
  constructor(private api:ApiHttpService,
    private codxService:CodxService,
    private route:ActivatedRoute,
    private callfc:CallFuncService,
    private changedt: ChangeDetectorRef) { }
  ngOnInit(): void {
    this.recID =  this.route.snapshot.paramMap.get("recID");
    this.category = this.route.snapshot.paramMap.get("category");
    this.funcID = this.route.snapshot.paramMap.get("funcID");
    this.loadData(this.recID,this.category);
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.content,
        active: true,
        model: {
          panelLeftRef: this.panelLeftRef,
        }
      },
    ];
    this.changedt.detectChanges();
  }
  loadData(recID:string, category:string){
    this.api.execSv("WP","ERM.Business.WP","NewsBusiness","GetNewsInforAsync",recID).subscribe(
      (res) => {
        if(res){
          this.dataItem = res;
        }
      }
    );
    this.api.execSv("WP","ERM.Business.WP","NewsBusiness","GetDataNewsAsync",category).subscribe(
      (res) => {
        if(res)
        {
          this.listViews = res[0];
          this.listNews = res[1];
        }}
      );
    this.changedt.detectChanges();
  }
  clickViewDeital(data:any){
    this.api.execSv("WP","ERM.Business.WP","NewsBusiness","UpdateViewNewsAsync",data.recID).subscribe(
      (res) => {
        if(res){
          this.codxService.navigate('','/wp/'+data.category+'/view-detail/'+ data.recID +'/'+this.funcID);
          this.loadData(data.recID,data.category);
        }
    });
  }
  clickTag(data:any){
    let funcID =  this.route.snapshot.params["funcID"];
    this.codxService.navigate('','/wp/tag/'+funcID+'/tagID/'+data.value);
  }

  clickShowPopupCreate(){
    let option = new SidebarModel();
    option.DataService = this.codxViews.dataService;
    option.FormModel = this.codxViews.formModel;
    option.Width = '550px';
    this.callfc.openSide(PopupAddComponent,null,option);
  }
  clickShowPopupSearch(){
    // this.callfc.openForm(PopupSearchComponent,"Tìm kiếm",900,700,"")
  }

  clickClosePopup(){
    // this.viewbase.currentView.closeSidebarRight();
  }

}
