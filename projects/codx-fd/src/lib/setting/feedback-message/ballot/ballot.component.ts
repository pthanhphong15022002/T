import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Injector,
  ViewEncapsulation,
} from '@angular/core';
import { ApiHttpService, NotificationsService, UIComponent } from 'codx-core';
import _ from 'lodash';
import { BallotService } from './ballot.service';

@Component({
  selector: 'app-ballot',
  templateUrl: './ballot.component.html',
  styleUrls: ['./ballot.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BallotComponent extends UIComponent implements OnInit {
  @Input() funcID: string;
  @Input() type: string;

  reload = false;
  lstPattent = null;
  constructor(
    private changedr: ChangeDetectorRef,
    private ptsv: BallotService,
    private notificationsService: NotificationsService,
    private confirmationDialogService: NotificationsService,
    private injector: Injector
  ) {
    super(injector);
  }

  onInit(): void {
    this.LoadData();
  }

  ngAfterViewInit() {
    this.ptsv.component = this;
  }

  LoadData() {
    //this.ngxLoader.start();
    this.api
      .call('ERM.Business.FED', 'PattentsBusiness', 'GetCardTypeAsync', [
        this.type,
      ])
      .subscribe((res) => {
        //this.ngxLoader.stop();
        if (res && res.msgBodyData[0]) {
          var data = res.msgBodyData[0] as any[];
          //data.push({});
          this.lstPattent = data;
          this.lstPattent.push({});
          this.changedr.detectChanges();
        }
      });
  }

  mouseover($event) {
    $($event.srcElement)
      .closest('.card-img')
      .find('#dropdownMenuButton')
      .show();
  }
  mouseout($event) {
    $($event.srcElement)
      .closest('.card-img')
      .find('#dropdownMenuButton')
      .hide();
  }

  reLoadData(data) {
    this.reload = true;
    if (data.isDefault) {
      var arr = [];
      this.lstPattent.filter(function (element, index) {
        if (element['isDefault'] === true) element.isDefault = false;
        arr.push(element);
        return arr;
      });
      this.lstPattent = [...arr];
    }
    if (data.cardType != this.type) {
      _.remove(this.lstPattent, { recID: data.recID });
    } else {
      if (this.ptsv.indexEdit > -1) this.lstPattent[this.ptsv.indexEdit] = data;
      else {
        this.lstPattent[this.lstPattent.length - 1] = data;
        this.lstPattent.push({});
      }
    }

    //this.lstPattent.push({});
    this.changedr.detectChanges();
  }

  reloadChanged(e) {
    this.reload = e;
  }
  trackByfn(index, item) {
    return item.patternID + item.modifiedOn;
  }
  openCreate(recid = '', i = -1, elm = null): void {
    //this.ptsv.recID = recid;
    var $imgpat = $('span.img-pat', $(elm));
    if ($imgpat.length > 0) {
      var color = $imgpat.css('background-color');
      this.ptsv.colorimg = color;
    } else {
      this.ptsv.colorimg = '';
    }
    this.ptsv.indexEdit = i;
    this.ptsv.appendRecID(recid);
    $('#create_card').addClass('offcanvas-on');
  }

  delete(recID, i = -1) {
    // this.confirmationDialogService
    //   .confirmLang('DoYouWantToDelete', 'Bạn có muốn xóa ?')
    //   .then((confirmed) => {
    //     if (confirmed) {
    //       this.api
    //         .callSv('FED', 'FED', 'PattentsBusiness', 'DeleteAsync', [recID])
    //         .subscribe((res) => {
    //           if (res) {
    //             this.LoadData();
    //             if (res.error) {
    //               this.notificationsService.notify(res.error.errorMessage);
    //             } else if (res.msgBodyData) {
    //             }
    //           }
    //         });
    //     }
    //   })
    //   .catch(() => console.log(''));
  }
  closeCreate(): void {
    $('#create_card').removeClass('offcanvas-on');
  }
}
