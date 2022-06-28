import { ChangeDetectorRef, Component, Input, OnInit, Optional } from '@angular/core';
import { extendDeadline } from '../../models/dispatch.model';
import { DispatchService } from '../../services/dispatch.service';
import { extractContent } from '../../function/default.function';
import { ApiHttpService, DialogData, NotificationsService, ViewsComponent } from 'codx-core';
import { Dialog } from '@syncfusion/ej2-angular-popups';
@Component({
  selector: 'app-od-addlink',
  templateUrl: './addlink.component.html',
  styleUrls: ['./addlink.component.scss']
})
export class AddLinkComponent implements OnInit {
  @Input() viewbase: ViewsComponent;
  @Input() gridViewSetup     : any;
  @Input() isFilter          = true;
  constructor(
    private api: ApiHttpService
  ) 
  { 
   
  }
  ngOnInit(): void {
  }
  close()
  {
    //this.viewbase.currentView.closeSidebarRight();
  }
  aaa(val:any)
  {
    console.log(val)
  }
  searchText()
  {
    this.api.execSv<any>("OD","ERM.Business.CM", "DataBusiness", "GetFullTextSearchDataAsync",{
      query: "twt",
      functionID: "ODT1",
      entityName: "OD_Dispatches",
      page: 1,
      pageSize: 20
    }).subscribe((item) => {
      console.log(item);
    });
  }
}
