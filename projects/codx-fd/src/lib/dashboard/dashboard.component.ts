import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { WPService } from '@core/services/signalr/apiwp.service';
import { SignalRService } from '@core/services/signalr/signalr.service';
import { Post } from '@shared/models/post';
import { CodxListviewComponent, ApiHttpService, AuthService, CodxService, ViewModel, ViewType, UIComponent, ButtonModel } from 'codx-core';

@Component({
  selector: 'lib-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent extends UIComponent implements OnInit, AfterViewInit {


  predicate = `Category =@0 `;
  dataValue = "3";
  memberType = "3";
  predicateCoins = `UserID=@0 AND ( TransType = "1" OR TransType = "2" OR TransType = "4" OR TransType = "5" OR TransType = "6")`;
  dataValueCoins = "";
  arrVll = ["L1422", "L1419"];
  reciver = [];
  sender = [];
  dataRadio = null;
  views: Array<ViewModel> = [];
  buttonAdd: ButtonModel;
  user = null;
  pagination = {
    clickable: true,
    renderBullet: function (index, className) {
      return '<span style="cursor: pointer;" class="' + className + '"></span>';
    },
  };

  @ViewChild('panelContent') panelContent: TemplateRef<any>;
  @ViewChild('listviewCoins') listviewComponent: CodxListviewComponent;
  @ViewChild('listview') listview: CodxListviewComponent;
  dataRef: Post;
  isLoading = true;
  crrId = "";
  constructor(
    private injector: Injector,
    private dr: ChangeDetectorRef,
    private auth: AuthService,
    private signalRApi: WPService,
    private signalR: SignalRService,

  ) {
    super(injector)
    this.dataValueCoins = this.auth.userValue.userID;
    this.subscribeToEvents();
  }
  ngAfterViewInit(): void {
    this.buttonAdd = {
      id: 'btnAdd',
    };
    this.views = [{
      type: ViewType.content,
      active: true,
      showButton: true,
      model: {
        panelLeftRef: this.panelContent
      }
    }];

  }
  onInit(): void {

    this.user = this.auth.userValue;
    this.api.call("ERM.Business.FD", "CardsBusiness", "GetDataForWebAsync", []).subscribe(res => {
      if (res && res.msgBodyData != null && res.msgBodyData.length > 0) {
        var data = res.msgBodyData[0] as [];
        this.reciver = data['fbReceiver'];
        this.sender = data['fbSender'];
        this.dr.detectChanges();
      }
    });
  }


  async showWith(id, memberType) {
    console.log('id, memberType: ', id, memberType);
  }



  votePost(id) {
    this.signalRApi.votePost(id).subscribe(res => { });
  }

  removePost(data) {
    this.signalRApi.deletePost(data.id).subscribe(res => {
      if (!res.error) {
        // this.listview.removeHandler(data, 'id');
      }
    });
  }


  showContent(e) {
    e.toggleContent();
  }


  replyTo(parent, id) {
    // this.crrId = id;
    // $('#' + parent).find('.input-comment').focus();
  }

  sendComment(id, input: any) {
    let text = input.value;
    if (!text) {
      alert("Vui lòng nhập nội dung");
      return;
    }
    let recID = this.crrId || id;
    if (recID)
      this.signalRApi.postComment(recID, text, this.crrId).subscribe(res => {
        input.value = '';
      })
  }
  //#region communication
  private subscribeToEvents(): void {
    const t = this;
    this.signalR.signalData.subscribe((post: Post) => {
      if (post.category != "2") {
        // t.listview.addHandler(post, true, 'id');
      }
    });
  }



  clickShowItem(data: any) {
    console.log('tmpCardDetail: ', data)
  }

  clickShowPupopAdd(event: any) {
    console.log(event)
  }

}
