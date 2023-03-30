import {
  AfterViewInit,
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
export class AddLinkComponent implements OnInit , AfterViewInit {
  extractContent = extractContent;
  convertHtmlAgency = convertHtmlAgency;
  getIdUser = getIdUser;
  @Input() viewbase: ViewsComponent;
  @Input() isFilter = true;
  headerText: any;
  gridViewSetup: any;
  dialog: any;
  data: any;
  dataSelected: any;
  dataLink: any = []
  formModel:any;
  count = 0;
  funcID : any;
  addLinkForm = new FormGroup({
    recID: new FormControl(),
  });
  tabInfo: any[] = [
    { icon: '', text: 'Liên kết', name: 'tbLink' },
    { icon: '', text: 'Văn bản đã liên kết', name: 'tbLinkText' },
  ];
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
    this.headerText = dt?.data?.headerText;
    this.dataSelected = dt?.data?.data;
    this.formModel =  JSON.stringify(dialog?.formModel);
    this.formModel = JSON.parse(this.formModel);
    this.funcID = dialog?.formModel?.funcID
    this.formModel.funcID = "";
  }
  ngAfterViewInit(): void {
    this.setHeight();
  }
  ngOnInit(): void {
    this.searchText('');
    this.getDataLink();
  }

  setHeight()
  {
    let height = window.innerHeight;
    if(height && height>0) document.getElementById("h-scroll").style.maxHeight = (height - 250) + "px";
  }

  getDataLink()
  {
    if(this.dataSelected?.recID)
    {
      this.odService.getDetailDispatch(this.dataSelected?.recID, this.formModel?.entityName , "source").subscribe(item=>{
        if(item && item.linkss && item.linkss.length > 0) this.dataLink = item?.linkss;
      })
    }
    
  }

  searchText(val: any) {
    /* this.api.execSv<any>("OD","ERM.Business.Core", "DataBusiness", "GetFullTextSearchDataAsync",
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
      .execSv<any>('OD', 'Core', 'DataBusiness', 'SearchFullTextAdvAsync', {
        query: val,
        functionID: this.funcID,
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
        this.dataSelected?.recID,
        this.addLinkForm.value.recID,
        '',
        ''
      )
      .subscribe((item) => {
        if (item) 
        {
          this.notifySvr.notify('Liên kết thành công');
          this.dialog.close();
        } else this.notifySvr.notify('Liên kết không thành công');
      });
  }
}
