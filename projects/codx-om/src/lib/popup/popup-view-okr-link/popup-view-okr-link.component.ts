import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import {
  Component,
  inject,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { CodxOmService } from '../../codx-om.service';
import { OMCONST } from '../../codx-om.constant';

@Component({
  selector: 'popup-view-okr-link',
  templateUrl: './popup-view-okr-link.component.html',
  styleUrls: ['./popup-view-okr-link.component.scss'],
})
export class PopupViewOKRLinkComponent extends UIComponent {
  dialog: any;
  data: any;
  okrGrv: any;
  okrFM: any;
  isAfterRender = false;
  listLink = [];
  owner: any;
  constructor(
    private injector: Injector,
    private omService: CodxOmService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.dialog = dialogRef;
    this.data = dialogData.data[0];
    this.okrGrv = dialogData.data[1];
    this.okrFM = dialogData.data[2];
  }

  onInit(): void {
    if (this.data?.hasAssign) {
      let refType = this.data?.hasAssign.includes(OMCONST.VLL.HAS_ASSIGN)
        ? OMCONST.VLL.RefType_Link.Assign
        : this.data?.hasAssign.includes(OMCONST.VLL.HAS_DISTRIBUTE)
        ? OMCONST.VLL.RefType_Link.Distribute
        : OMCONST.VLL.RefType_Link.Link;
      this.omService
        .getOKRHavedLinks(this.data?.recID, refType)
        .subscribe((res: any) => {
          if (res) {
            this.listLink = res;
          }
          this.isAfterRender = true;
          this.detectorRef.detectChanges();
        });
    } else {
      this.cache.getCompany(this.data?.owner).subscribe((owner) => {
        if (owner) {
          this.owner = owner;
        }
        this.isAfterRender = true;
        this.detectorRef.detectChanges();
      });
    }
  }

  onSaveForm() {}
}
