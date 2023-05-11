import { Component, HostBinding, Input } from '@angular/core';
import { CodxService } from 'codx-core';

@Component({
  selector: 'erm-quick-links-inner',
  templateUrl: './quick-links-inner.component.html',
})
export class QuickLinksInnerComponent {
  @HostBinding('class') class = 'd-flex align-items-center';
  // @HostBinding('attr.data-kt-menu') dataKtMenu = 'true';
  @Input() buttonMarginClass: any;
  @Input() buttonIconClass: any;
  @Input() buttonHeightClass: any;
  lstFull: any[] = [];
  lstModule: any[] = [];
  lstGroup: any[] = [];
  constructor(public codxService: CodxService) {}
  ngOnInit() {
    this.codxService.modulesOb$.subscribe((res) => {
      this.lstModule = this.lstFull = res || [];
      var arrGroupID = [];
      this.lstFull.filter((x) => {
        if (x.saleGroup && !arrGroupID.includes(x.saleGroup)) {
          arrGroupID.push(x.saleGroup);
        }
      });
      if (arrGroupID.length > 0) {
        arrGroupID.forEach((element) => {
          this.lstModule = this.lstModule.filter(
            (x) => x.functionID != element
          );
          let func = this.lstFull.find((x) => x.functionID == element);
          let obj: any = {};
          obj['groupID'] = element;
          if (func) {
            obj['groupName'] = func.customName || func.defaultName;
          }
          this.lstGroup.push(obj);
        });
      }
      this.lstGroup.unshift({ groupID: '', groupName: '' });
    });
  }
}
