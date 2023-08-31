import { Component, Injector, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  DataRequest,
  FormModel,
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
  @Input() setting;
  @Input() settingValue;
  @Input() policyRecID: string;
  @Input() formModel: FormModel;
  getFrom: string = '';
  value;
  id;
  lstLines = [];

  constructor(
    private modalService: NgbModal,
    private tenantStore: TenantStore,
    private notification: NotificationsService,
    private fdService: CodxFdService,

    injector: Injector
  ) {
    super(injector);
  }

  onInit(): void {
    if (this.setting) {
      switch (this.setting.referedType) {
        case '2': {
          this.getFrom = this.setting.referdValue;
          this.cache.valueList(this.getFrom).subscribe((data) => {
            data?.datas?.forEach((e) => {
              this.lstLines.push({ field: e.value, text: e.text });
            });
            console.log('vll', this.lstLines);
            this;
          });
          break;
        }

        case '3': {
          switch (this.setting.referdValue) {
            case 'Behaviors': {
              switch (this.settingValue.RuleSelected) {
                case '1': {
                  this.getFrom = 'Behaviors_Grp';
                  break;
                }
                case '2': {
                  this.getFrom = 'Behaviors';

                  break;
                }
              }
              this.cache.combobox(this.getFrom).subscribe((data) => {
                let gridModel = new DataRequest();
                gridModel.entityName = data.entityName;
                gridModel.entityPermission = data.entityName;
                gridModel.pageLoading = false;
                gridModel.comboboxName = data.comboboxName;
                this.fdService
                  .getDataCbbx(gridModel, data.service)
                  .subscribe((cbbData) => {
                    let map = JSON.parse(cbbData[0]);
                    map?.forEach((e) => {
                      this.lstLines.push({
                        field: e.CompetenceID,
                        text: e.CompetenceName,
                      });
                    });
                  });
              });
              break;
            }
            case 'Positions': {
              this.getFrom = 'Positions';
              this.lstLines.push({
                field: null,
                text: 'Tất cả',
              });
              console.log('sett', this.setting);
              break;
            }
          }
          break;
        }
      }
    }
    console.log('policyRecID', this.policyRecID);
  }

  valueChange(e, ele) {
    this.value = e.data;
  }

  open(content, id, value) {
    this.id = id;
    this.detectorRef.detectChanges();

    console.log('click open ', id);

    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
      size: 'sm',
    });
  }

  save(modal) {
    console.log('save');

    // this.api
    //   .call('ERM.Business.FD', 'PoliciesLinesBusiness', 'SaveAsync', [
    //     this.id,
    //     this.value,
    //     this.policy.itemType,
    //     this.policy.recID,
    //   ])
    //   .subscribe((res) => {
    //     if (res && res.msgBodyData[0]) {
    //       var data = res.msgBodyData[0];
    //       for (let i = 0; i < this.lstPolicyLine.length; i++) {
    //         if (this.lstPolicyLine[i].id == data.itemSelect)
    //           this.lstPolicyLine[i].value = data.value;
    //       }
    //       this.changedr.detectChanges();
    //       modal.dismiss('Cross click');
    //       this.notification.notifyCode('SYS007');
    //     } else this.notification.notifyCode('SYS021');
    //   });
  }

  delete(recID, id) {
    console.log('delete');

    // this.api
    //   .call('ERM.Business.FED', 'PoliciesLinesBusiness', 'DeleteAsync', [recID])
    //   .subscribe((res) => {
    //     var t = this;
    //     if (res && res.msgBodyData[0]) {
    //       // _.filter(this.lstPolicyLine, function (o) {
    //       //   if (o.id == id) {
    //       //     o.value = 0;
    //       //     t.changedr.detectChanges();
    //       //   }
    //       // });
    //     }
    //   });
  }
}
