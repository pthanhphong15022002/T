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
  @Input() formModel: FormModel;
  @Input() lstPolicyLines = [];

  getFrom: string = '';
  value;
  id;
  lstLines = [];
  policy;
  mode = 'add' || 'edit';
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
    console.log('lstPolicyLines ', this.lstPolicyLines);

    if (this.setting) {
      this.policy = this.setting.policy;
      // console.log('policyRecID ', this.policyRecID);
      console.log('policy ', this.setting.policy);
      switch (this.setting.referedType) {
        case '2': {
          this.getFrom = this.setting.referdValue;
          this.cache.valueList(this.getFrom).subscribe((data) => {
            data?.datas?.forEach((e) => {
              let pl = this.lstPolicyLines.find(
                (pl) => pl.itemSelect == e.value
              );
              this.lstLines.push({
                field: e.value,
                text: e.text,
                value: pl?.value,
              });
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
                      let pl = this.lstPolicyLines.find(
                        (pl) => pl.itemSelect == e.CompetenceID
                      );
                      this.lstLines.push({
                        field: e.CompetenceID,
                        text: e.CompetenceName,
                        value: pl?.value,
                      });
                    });
                  });
              });
              break;
            }
            case 'Positions': {
              this.getFrom = 'Positions';
              let nullPL = this.lstPolicyLines?.find(
                (pl) => pl.itemSelect == null
              );
              if (nullPL == null) {
                this.lstLines.push({
                  field: null,
                  text: 'Tất cả',
                  value: null,
                });
              } else {
                this.lstLines.push({
                  field: nullPL.itemSelect,
                  text: '',
                  value: nullPL.value,
                });
              }

              this.lstPolicyLines?.forEach((pl) => {
                if (pl.itemSelect && pl.transID == this.policy.recID) {
                  this.lstLines.push({
                    field: pl.itemSelect,
                    text: '',
                    value: pl.value,
                  });
                }
              });
              console.log('sett', this.setting);
              break;
            }
          }
          break;
        }
      }
    }
    // console.log('policyRecID', this.policyRecID);
  }

  valueChange(e, ele) {
    this.value = e.data;
  }

  changePosition(evt) {
    this.id = evt?.data;
    console.log('change position', evt);
  }

  open(content, id, value, mode = 'edit') {
    this.mode = mode;
    this.id = id;
    this.value = value;
    this.detectorRef.detectChanges();

    console.log('click open ', id);

    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
      size: 'md',
    });
  }

  save(modal) {
    console.log('save', this.id, modal);

    this.api
      .call('ERM.Business.FD', 'PoliciesLinesBusiness', 'SaveAsync', [
        this.id,
        this.value,
        this.policy.itemType,
        this.policy.recID,
      ])
      .subscribe((res) => {
        if (res && res.msgBodyData[0]) {
          let data = res.msgBodyData[0];
          let isAdded = false;
          for (let i = 0; i < this.lstPolicyLines.length; i++) {
            if (this.lstPolicyLines[i].id == data.itemSelect) {
              isAdded = true;
              this.lstPolicyLines[i].value = data.value;
            }
          }
          if (!isAdded) {
            this.lstPolicyLines.push(data);
            this.lstLines.push({
              field: data.itemSelect,
              text: '',
              value: data.value,
            });
          }
          this.value = undefined;
          this.detectorRef.detectChanges();
          modal.dismiss('Cross click');
          this.notification.notifyCode('SYS007');
        } else this.notification.notifyCode('SYS021');
      });
  }

  delete(recID, id) {
    console.log('delete');

    // this.api
    //   .call('ERM.Business.FED', 'PoliciesLinesBusiness', 'DeleteAsync', [recID])
    //   .subscribe((res) => {
    //     let t = this;
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
