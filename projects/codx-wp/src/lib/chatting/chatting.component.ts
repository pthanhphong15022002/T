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
} from 'codx-core';

@Component({
  selector: 'lib-chatting',
  templateUrl: './chatting.component.html',
  styleUrls: ['./chatting.component.css']
})
export class ChattingComponent extends UIComponent implements AfterViewInit {
 

  @ViewChild("itemTemplate") itemTemplate: TemplateRef<any>;
  @ViewChild("panelRightRef") panelRightRef: TemplateRef<any>;

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
    private  inject: Injector
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
        panelRightRef: this.panelRightRef
      }
    }]
  }

  onInit(): void {
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
