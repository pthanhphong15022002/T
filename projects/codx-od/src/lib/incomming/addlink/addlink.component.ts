import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
} from '@angular/core';
import {
  convertHtmlAgency,
  extractContent,
  getIdUser,
} from '../../function/default.function';
import {
  ApiHttpService,
  CacheService,
  DialogData,
  DialogRef,
  NotificationsService,
  ViewsComponent,
} from 'codx-core';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { FormControl, FormGroup } from '@angular/forms';
import { DispatchService } from '../../services/dispatch.service';
@Component({
  selector: 'app-od-addlink',
  templateUrl: './addlink.component.html',
  styleUrls: ['./addlink.component.scss'],
})
export class AddLinkComponent implements OnInit {
  extractContent = extractContent;
  convertHtmlAgency = convertHtmlAgency;
  getIdUser = getIdUser;
  @Input() viewbase: ViewsComponent;
  @Input() isFilter = true;
  gridViewSetup: any;
  dialog: any;
  data: any;
  count = 0;
  addLinkForm = new FormGroup({
    recID: new FormControl(),
  });
  constructor(
    private api: ApiHttpService,
    private odService: DispatchService,
    private cache: CacheService,
    private notifySvr: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.gridViewSetup = dt?.data?.gridViewSetup;
  }
  ngOnInit(): void {
    //this.cache.gridViewSetup()
    this.searchText('');
  }

  searchText(val: any) {
    /* this.api.execSv<any>("OD","ERM.Business.CM", "DataBusiness", "GetFullTextSearchDataAsync",
    {
     /*filter:{} 
      query: "Phòng CNTT",
      functionID: "ODT3",
      entityName: "OD_Dispatches",
      page: 1,
      pageSize: 20
    }).subscribe((item) => {
      console.log(item);
    }); */
    this.api
      .execSv<any>('OD', 'CM', 'DataBusiness', 'SearchFullTextAdvAsync', {
        query: val,
        functionID: this.dialog?.formModel?.funcID,
        entityName: 'OD_Dispatches',
        page: 1,
        pageSize: 20,
      })
      .subscribe((item) => {
        this.count = 0;
        this.data = item;
        if (item[1]) this.count = item[1];
      });
  }

  onSave() {
    this.odService
      .addLink(
        this.dialog.dataService.dataSelected.recID,
        this.addLinkForm.value.recID,
        '',
        ''
      )
      .subscribe((item) => {
        if (item) 
        {
          this.notifySvr.notify("Liên kết thành công");
          this.dialog.close();
        }
        else this.notifySvr.notify("Liên kết không thành công");
      });
  }
}
