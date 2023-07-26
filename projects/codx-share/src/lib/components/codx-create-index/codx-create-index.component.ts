import { ChangeDetectorRef, Component, Optional } from '@angular/core';
import { ApiHttpService, AuthService, AuthStore, DialogData, DialogRef, NotificationsService } from 'codx-core';

@Component({
  selector: 'lib-codx-create-index',
  templateUrl: './codx-create-index.component.html',
  styleUrls: ['./codx-create-index.component.css']
})
export class CodxCreateIndexComponent {
  dialog: DialogRef;
  listModule: any[] = [];
  constructor(
    private api: ApiHttpService,
    private auth: AuthService,
    private notifyService: NotificationsService,
    private changeDetectorRef: ChangeDetectorRef,
    private authstore: AuthStore,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    this.dialog = dialog;
  }

  ngOnInit(): void {
    this.api
      .execSv('SYS', 'ERM.Business.SYS', 'FunctionListBusiness', 'GetModulesAsync')
      .subscribe((res: any) => {
        this.listModule = res || [];
      });
  }

  selectedModule(module:any)
  {
    debugger
  }

  onSave()
  {

  }
}
