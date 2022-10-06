import { ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActionArgs } from '@syncfusion/ej2-angular-grids';
import {
  ApiHttpService,
  NotificationsService,
  TenantStore,
  UIComponent,
} from 'codx-core';
import { CodxFdService } from '../../../codx-fd.service';

@Component({
  selector: 'lib-detail-policy',
  templateUrl: './detail-policy.component.html',
  styleUrls: ['./detail-policy.component.scss'],
})
export class DetailPolicyComponent extends UIComponent implements OnInit {
  cardtype: string;
  policy: any = null;
  lstPolicyLine: any = null;
  datachange = [];
  id = '';
  value = '';
  tenant: string;
  tabActive = 1;
  private recID;

  constructor(
    private fedsv: CodxFdService,
    private changedr: ChangeDetectorRef,
    private at: ActivatedRoute,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private tenantStore: TenantStore,
    private notification: NotificationsService,
    injector: Injector
  ) {
    super(injector);
    this.tenant = this.tenantStore.get()?.tenant;
  }
  redirectPage(page) {
    // this.router.navigate(['/' + this.tenant + '/fed/setting'], {
    //   queryParams: { funcID: 'FED204', page: page },
    // });
  }

  onInit(): void {
    this.at.queryParams.subscribe((params) => {
      this.cardtype = params.cardtype;
      if (params.recID) {
        this.recID = params.recID;
      }
      if (params && params.type) {
        let category = '2';
        let applyFor = '2';
        if (params.type == 'coin') {
          category = '1';
        }
        if (params.type == 'wallet') {
          this.cardtype = null;
          category = params.category;
          applyFor = '1';
          this.tabActive = 3;
        }
        this.api
          .call('ERM.Business.FD', 'PoliciesBusiness', 'GetPolicyAsync', [
            category,
            this.cardtype,
            applyFor,
            this.recID,
          ])
          .subscribe((res) => {
            if (res && res.msgBodyData[0]) {
              var data = res.msgBodyData[0] as [];
              this.policy = data['Policie'];
              this.lstPolicyLine = data['policyLine'];
              this.changedr.detectChanges();
            }
          });
      }
    });
  }

  // openCreate(): void {
  //   $('#create_card').addClass('offcanvas-on');
  // }
  // closeCreate(): void {
  //   $('#create_card').removeClass('offcanvas-on');
  // }

  valueChange(e, ele) {
    this.value = e.data;
  }

  update(recID, itemType) {
    this.ngOnInit();
  }
  backLocation() {
    // this.location.back();
  }
  open(content, id, value) {
    this.id = id;
    this.value = value;
    this.changedr.detectChanges();
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
      size: 'sm',
    });
  }

  save(modal) {
    this.api
      .call('ERM.Business.FD', 'PoliciesLinesBusiness', 'SaveAsync', [
        this.id,
        this.value,
        this.policy.itemType,
        this.policy.recID,
      ])
      .subscribe((res) => {
        if (res && res.msgBodyData[0]) {
          var data = res.msgBodyData[0];
          for (let i = 0; i < this.lstPolicyLine.length; i++) {
            if (this.lstPolicyLine[i].recID == data.recID)
              this.lstPolicyLine[i].value = data.value;
          }
          this.changedr.detectChanges();
          modal.dismiss('Cross click');
          this.notification.notifyCode('SYS007');
        } else this.notification.notifyCode('SYS021');
      });
  }

  delete(recID, id) {
    this.api
      .call('ERM.Business.FED', 'PoliciesLinesBusiness', 'DeleteAsync', [recID])
      .subscribe((res) => {
        var t = this;
        if (res && res.msgBodyData[0]) {
          // _.filter(this.lstPolicyLine, function (o) {
          //   if (o.id == id) {
          //     o.value = 0;
          //     t.changedr.detectChanges();
          //   }
          // });
        }
      });
  }
  action(para: ActionArgs): void {}
}
