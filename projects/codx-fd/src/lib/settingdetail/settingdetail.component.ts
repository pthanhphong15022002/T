import { ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiHttpService, NotificationsService, TenantStore, UIComponent } from 'codx-core';
import { ModelPage } from 'projects/codx-ep/src/public-api';
import { CodxFdService } from '../codx-fd.service';

@Component({
  selector: 'lib-settingdetail',
  templateUrl: './settingdetail.component.html',
  styleUrls: ['./settingdetail.component.css']
})
export class SettingdetailComponent extends UIComponent implements OnInit {
  datafuntion = null;
  type = "";
  lstPattent = null;
  item = { PolicyControl: '' };
  isLockCoin = false;
  isLockDedicate = false;
  tenant: string;

  constructor(private fedsv: CodxFdService,
    private changedr: ChangeDetectorRef,
    private at: ActivatedRoute,
    private notificationsService: NotificationsService,
    private location: Location,
    private tenantStore: TenantStore,
    injector: Injector,
  ) {
    super(injector);
    this.tenant = this.tenantStore.get()?.tenant;
  }
  redirectPage(page) {
    // this.router.navigate(["/" + this.tenant + "/fed/setting"], { queryParams: { funcID: "FED204", page: page } });
  }

  // LoadData() {
  //   this.api
  //     .call(
  //       "ERM.Business.FED",
  //       "SettingsBusiness",
  //       "GetDataForPolicyCardAsync",
  //       [this.type]
  //     )
  //     .subscribe((res) => {
  //       if (res && res.msgBodyData.length > 0) {
  //         if(res.msgBodyData[0].parameter.PolicyControl){
  //           this.item.PolicyControl = res.msgBodyData[0].parameter.PolicyControl;
  //           this.handleLock(this.item.PolicyControl);
  //         }
  //         else{
  //           this.handleLock('0');
  //         }

  //         this.changedr.detectChanges();
  //       }
  //     });

  // }

  onSaveCMParameter(objectUpdate) {
    this.api
      .callSv(
        "SYS",
        "ERM.Business.CM",
        "ParametersBusiness",
        "SaveParamsOfPolicyAsync",
        ["FED_Parameters", this.type, JSON.stringify(objectUpdate)]
      )
      .subscribe((res) => {
        if (res && res.msgBodyData.length > 0) {
          if (res.msgBodyData[0] === true) {
            this.changedr.detectChanges();
          }
        }
      });
  }
  changeLock(data) {
    this.isLockCoin = data.isLockCoin;
    this.isLockDedicate = data.isLockDedicate;
  }
  onInit(): void {

    this.at.queryParams.subscribe(params => {
      if (params && params.funcID) {
        switch (params.funcID) {
          case "FED20411":
            this.type = this.fedsv.type = "1";
            break;
          case "FED20412":
            this.type = this.fedsv.type = "2";
            break;
          case "FED20413":
            this.type = this.fedsv.type = "3";
            break;
          case "FED20414":
            this.type = this.fedsv.type = "4";
            break;
          case "FED20415":
            this.type = this.fedsv.type = "5";
            break;
          case "FED20416":
            this.type = this.fedsv.type = "6";
            break;
          case "FED20417":
            this.type = this.fedsv.type = "7";
            break;
        }
        this.api.call("ERM.Business.SYS", "FunctionListBusiness", "GetAsync", ["", params.funcID]).subscribe(res => {
          //this.ngxLoader.stop();
          if (res && res.msgBodyData[0]) {
            var data = res.msgBodyData[0] as [];
            this.datafuntion = data;
            this.changedr.detectChanges();
          }
        })
        //this.LoadData();
        //this.LoadData();
      }
    })
  }
  openCreate(): void {
    $('#create_card').addClass('offcanvas-on');
  }
  closeCreate(): void {
    $('#create_card').removeClass('offcanvas-on');
  }

  backLocation() {
    // this.location.back();
  }
}
