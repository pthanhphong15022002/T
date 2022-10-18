import { 
  Component,
  ViewChild, 
  OnInit,
  TemplateRef,
  Injector,
  AfterViewInit,
} from '@angular/core';

import {
  ViewType,
  ViewModel,
  UIComponent,
  ButtonModel,
  CallFuncService,
  DialogModel,
} from 'codx-core';
import { PopupGroupComponent } from './popup-group/popup-group.component';

@Component({
  selector: 'lib-chatting',
  templateUrl: './chatting.component.html',
  styleUrls: ['./chatting.component.css']
})
export class ChattingComponent extends UIComponent implements AfterViewInit {
 

  @ViewChild("itemTemplate") itemTemplate: TemplateRef<any>;
  @ViewChild("panelRightRef") panelRightRef: TemplateRef<any>;
  @ViewChild("tmpSearch") tmpSearch: TemplateRef<any>;


  views: Array<ViewModel> = [];
  changeDetectorRef: any;
  currView?: TemplateRef<any>;
  
  button?: ButtonModel;
  fileService: any;
  data: any[];
  listFolders: any;
  isSearch: boolean;
  textSearch: any;
  textSearchAll: any;
  predicates: any;
  values: any;
  searchAdvance: boolean;
  totalSearch: number;
  isFiltering: boolean;
  searchListObj: any;
  user: any;
  constructor
  (
    private  inject: Injector,//service mở cửa sổ
  ) 
  {
    super(inject);
  }
  ngAfterViewInit(): void {
    this.views = [{
      type : ViewType.listdetail,
      active:true,
      sameData:true,
      model:{
        template: this.itemTemplate,
        panelRightRef: this.panelRightRef,
        panelLeftRef:this.tmpSearch
      }
    }]
  }

  onInit(): void {
    //this.api.execSv("WP","ERM.Business.WP","ChatBusiness","AddChatTestAsync").subscribe();
  }

  clikPopup(){
    let dialogModel = new DialogModel();
    dialogModel.DataService = this.view.dataService;
    dialogModel.FormModel = this.view.formModel;
    this.callfc.openForm("CreateGroupComponent","Tao nhom chat",0,0,"",null,"",dialogModel);
  }

  doFilter(event: any) {
    if (event == '') {
      this.isFiltering = false;
      return;
    }
    this.isFiltering = true;
    if (this.searchListObj) {
      this.searchListObj.SearchText = event;
      this.searchListObj.options.page = 1;
      this.searchListObj.options.pageLoading = true;
      this.searchListObj.options['dataValue'] = this.user.userID;
      this.searchListObj.loadData();
    }
  }

  openCreategroupForm() {
     //this.callfc.openForm(CreateGroupComponent, "Tạo nhóm chat", 800, 600);
     let dialogModel = new DialogModel();
    dialogModel.DataService = this.view.dataService;
    dialogModel.FormModel = this.view.formModel;
    this.callfc.openForm(PopupGroupComponent,"Tao nhom chat",0,0,"",null,"",dialogModel);
  }

  viewChanging(event) {
    // this.dmSV.page = 1;
    //this.getDataFile("");
  }
 
  changeView(event) {
    //this.currView = null;
    //this.currView = event.view.model.template2;
    
    
    //  this.data = [];
    //  this.changeDetectorRef.detectChanges();
  }
  onLoading($event): void {
   
  }

}
