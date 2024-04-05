import {
  Component,
  EventEmitter,
  Injector,
  Input,
  Optional,
  Output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import {
  AuthService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { CodxEpService } from '../../codx-ep.service';

@Component({
  selector: 'popup-adjusted-allocation',
  templateUrl: 'popup-adjusted-allocation.component.html',
  styleUrls: ['popup-adjusted-allocation.component.scss'],
})
export class PopupAdjustedAllocationComponent extends UIComponent {
  data: any;
  headerText = '';
  subHeaderText = '';
  recID: any;
  dialogRef: DialogRef;
  constructor(
    private injector: Injector,
    private authService: AuthService,
    private codxEpService: CodxEpService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.recID = dialogData?.data.recID;
    this.dialogRef = dialogRef;
  }

  ngAfterViewInit(): void {}

  onInit(): void {
    this.codxEpService.getBookingByRecID(this.recID).subscribe((res: any) => {
      if (res) {
        res?.items?.forEach((item) => {
          if (item?.issueQuantity == 0 || item?.issueQuantity == null) {
            item.issueQuantity = item?.quantity;
          }
        });
        this.data = res;
        this.detectorRef.detectChanges();
      }
    });
  }

  onSaveForm() {
    let overQuantity = this.data?.items.filter(
      (x) => x?.issueQuantity != x?.quantity
    );
    if (overQuantity?.length > 0) {
      this.notificationsService?.alertCode('EP024').subscribe((alr) => {
        if (alr?.event?.status == 'Y') {
          this.codxEpService.addUpdateBooking(this.data,false).subscribe((res) => {
            if (res) {
              this.dialogRef && this.dialogRef.close(true);
            }
          });
        } else {
          return;
        }
      });
    }
    else{
      this.codxEpService.addUpdateBooking(this.data,false).subscribe(res=>{
        if(res){
          this.dialogRef && this.dialogRef.close(true);
        }
      })
    }
  }

  valueQuantityChange(event: any) {
    if (event?.data != null && event?.field) {
      if (event?.data < 0) {
        event.data = 0;
      }
      this.data?.items?.forEach((item) => {
        if (item?.itemID === event?.field) {
          item.issueQuantity = event?.data;
        }
      });
      this.detectorRef.detectChanges();
    }
  }
}
