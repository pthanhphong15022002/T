import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationsService, UIComponent } from 'codx-core';

@Component({
  selector: 'lib-setting-policy-lines',
  templateUrl: './setting-policy-lines.component.html',
  styleUrls: ['./setting-policy-lines.component.scss'],
})
export class SettingPolicyLinesComponent extends UIComponent implements OnInit {
  tabActive = 1;
  policy;
  lstPolicyLine = [];
  objectUpdate = {
    recID: null,
    value: null,
    itemSelect: '',
    transID: '',
    itemSelectName: '',
  };
  recIDPolicy;
  functionID: any;
  functionList: any;

  constructor(
    private changedr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private notificationsService: NotificationsService,
    private location: Location,
    injector: Injector
  ) {
    super(injector);
    this.route.queryParams.subscribe((params) => {
      if (params.funcID) {
        this.functionID = params.funcID;
        this.cache.functionList(params.funcID).subscribe((res) => {
          if (res) this.functionList = res;
        });
      }
    });
  }

  onInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params.recID) {
        this.recIDPolicy = params.recID;
        this.loadData(params.recID);
      }
    });
  }

  redirectPage(page, index) {}
  backLocation() {
    this.location.back();
  }
  savePolicyLines() {
    if(!this.objectUpdate.recID) delete this.objectUpdate.recID;
    this.objectUpdate.transID = this.recIDPolicy;
    this.api
      .exec<any>(
        'FD',
        'PoliciesLinesBusiness',
        'UpdateDetailPolicyLinesAsync',
        [this.objectUpdate, this.isModeAdd]
      )
      .subscribe((result) => {
        if (result) {
          result.itemSelectName = this.objectUpdate.itemSelectName;
          this.updateListPolicyLine(result);
          this.notificationsService.notifyCode('SYS019');
          this.modalService.dismissAll();
        }
      });
  }
  updateListPolicyLine(item) {
    let index = this.lstPolicyLine.findIndex((p) => p.recID == item.recID);
    if (index >= 0) {
      this.lstPolicyLine[index] = item;
    } else {
      this.lstPolicyLine.push(item);
    }
  }
  isModeAdd: any;
  open(templateOpen, item, isModeAdd) {
    this.isModeAdd = isModeAdd;
    if (item) {
      this.objectUpdate.recID = item.recID;
      this.objectUpdate.value = item.value;
      this.objectUpdate.itemSelect = item.itemSelect;
      this.objectUpdate.itemSelectName = item.itemSelectName;
    } else {
      this.objectUpdate = {
        recID: null,
        value: null,
        itemSelect: '',
        transID: '',
        itemSelectName: '',
      };
    }
    this.modalService.open(templateOpen, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
      size: 'sm',
    });
  }
  loadData(recID) {
    this.api
      .exec<any>('FD', 'PoliciesBusiness', 'GetListPolicyLineByRecIDAsync', [
        recID,
      ])
      .subscribe((res) => {
        if (res) {
          this.policy = res.policy;
          this.lstPolicyLine = res.lstPolicyLines;
          this.changedr.detectChanges();
        }
      });
  }

  valueChange(data) {
    if (data) {
      if (data.field == 'itemSelect') {
        this.objectUpdate.itemSelect = data.data;
        this.objectUpdate.itemSelectName =
          data.component.itemsSelected[0].PositionName;
      } else {
        this.objectUpdate['value'] = data.data;
      }
    }
  }

  deletePolicyLine(recID) {
    this.api
      .exec<any>('FD', 'PoliciesLinesBusiness', 'DeleteAsync', [recID])
      .subscribe((res) => {
        if (res) {
          this.notificationsService.notifyCode('SYS019');
          this.lstPolicyLine = this.lstPolicyLine.filter(
            (item) => item.recID !== recID
          );
        }
      });
  }
}
