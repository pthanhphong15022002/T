import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ViewModel, ViewsComponent, ApiHttpService, CodxService, CallFuncService, ViewType, SidebarModel, DialogModel, AuthService } from 'codx-core';
import { environment } from 'src/environments/environment';
import { PopupAddComponent } from '../popup/popup-add/popup-add.component';

@Component({
  selector: 'lib-view-detail',
  templateUrl: './view-detail.component.html',
  styleUrls: ['./view-detail.component.css']
})
export class ViewDetailComponent implements OnInit {

  NEWSTYPE = {
    post: "1",
    video: "2"
  }
  entityName:string = "WP_News";
  category:string ="";
  recID:string = "";
  funcID:string = "";
  dataItem:any;
  listViews = [];
  listTag = [];
  listNews=[];
  views: Array<ViewModel> = [];
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('codxViews') codxViews: ViewsComponent;
  constructor(private api:ApiHttpService,
    private codxService:CodxService,
    private auth:AuthService,
    private route:ActivatedRoute,
    private callfc:CallFuncService,
    private changedt: ChangeDetectorRef) { }
  ngOnInit(): void {
    this.route.params.subscribe((p:any) => {
      this.recID =  p["recID"];
      this.category = p["category"];
      this.funcID = p["funcID"];
      this.loadData(this.recID);
    });
    this.api
      .exec<any[]>('BS', 'TagsBusiness', 'GetModelDataAsync', this.entityName)
      .subscribe((o: any) => {
        if (o) {
          this.listTag = o.datas;
          this.changedt.detectChanges();
        }
      });
    
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
  srcVideo:string ="";
  loadData(recID:string){
    this.api.execSv("WP","ERM.Business.WP","NewsBusiness","GetNewsInforAsync",recID).subscribe(
      (res) => {
        if(res){
          this.dataItem = res[0];
          this.listViews = res[1];
          this.listNews = res[2];
          // this.api.execSv(
          //   "DM","ERM.Business.DM",
          //   "FileBussiness",
          //   "GetFilesByObjectIDImageAsync",
          //   this.dataItem.recID)
          // .subscribe((files:any[]) => {
          //   if(files && files.length > 0){
          //     files.map((f:any) => {
          //     this.srcVideo = `${environment.apiUrl}/api/dm/filevideo/${f.recID}?access_token=${this.auth.userValue.token}`;
          //     });
          //     this.changedt.detectChanges();
          //   }
          // });
        }
      }
    );
  }
  clickViewDeital(data:any){
    this.api.execSv("WP","ERM.Business.WP","NewsBusiness","UpdateViewNewsAsync",data.recID).subscribe(
      (res) => {
        if(res){
          this.codxService.navigate('','/wp/'+data.category+'/view-detail/'+ data.recID +'/'+this.funcID);
          this.loadData(data.recID);
        }
    });
  }
  clickTag(data:any){
    let funcID =  this.route.snapshot.params["funcID"];
    this.codxService.navigate('','/wp/tag/'+funcID+'/tagID/'+data.value);
  }

  clickShowPopupCreate(){
    let option = new DialogModel();
    option.DataService = this.codxViews.dataService;
    option.FormModel = this.codxViews.formModel;
    option.IsFull = true;
    this.callfc.openForm(PopupAddComponent,'',0,0,'',null,'',option);
  }

  searchField:string ="";
  tagUsers: any;
  show() {
    if (this.searchField == '' || this.searchField == null) return true;
    for (let index = 0; index < this.tagUsers.length; index++) {
      const element: any = this.tagUsers[index];
      if (
        element.objectName != null &&
        element.objectName
          .toLowerCase()
          .includes(this.searchField.toLowerCase())
      ) {
        return true;
      }
    }
    return false;
  }


  getShareUser(shareControl, commentID) {
    if (shareControl == '1') {
      this.api
        .exec<any>(
          'ERM.Business.WP',
          'CommentsBusiness',
          'GetShareOwnerListAsync',
          [commentID]
        )
        .subscribe((res) => {
          if (res) this.tagUsers = res;
        });
    } else {
      this.api
        .exec<any>(
          'ERM.Business.WP',
          'CommentsBusiness',
          'GetShareUserListAsync',
          [commentID]
        )
        .subscribe((res) => {
          if (res) {
            this.tagUsers = res;
          }
        });
    }
  }
}
