import { ChangeDetectorRef, Component, Injector, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { ApiHttpService, CacheService, CallFuncService, CodxFormComponent, DialogData, DialogRef, FormModel, NotificationsService, UIComponent } from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { ChartOfAccounts } from '../../models/ChartOfAccounts.model';

@Component({
  selector: 'lib-pop-add-accounts',
  templateUrl: './pop-add-accounts.component.html',
  styleUrls: ['./pop-add-accounts.component.css']
})
export class PopAddAccountsComponent extends UIComponent implements OnInit {
  @ViewChild('form') form: CodxFormComponent;
  dialog!: DialogRef;
  chartOfAccounts: ChartOfAccounts;
  @Input() headerText:any;
  formType:any;
  gridViewSetup:any;
  formModel: FormModel;
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    { icon: 'icon-playlist_add_check', text: 'Thiết lập', name: 'Establish' },
  ];
  constructor(
    private inject: Injector,
    override cache: CacheService,
    private acService: CodxAcService,
    override api: ApiHttpService,
    private dt: ChangeDetectorRef, 
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData,
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.formType = dialogData.data?.formType;
    this.chartOfAccounts = dialog.dataService!.dataSelected;
    this.cache.gridViewSetup('ChartOfAccounts', 'grvChartOfAccounts').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
        console.log(this.gridViewSetup);
      }
    });
  }

  onInit(): void {
  }
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
  }
  onSave(){
    console.log(this.chartOfAccounts);
  }
  valueChange(e:any){
    this.chartOfAccounts[e.field] = e.data;

    console.log(e);
  }
}
