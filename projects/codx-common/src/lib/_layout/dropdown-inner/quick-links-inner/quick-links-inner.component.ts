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
  @Input() show = false;
  lstFull: any[] = [];
  lstModule: any[] = [];
  lstGroup: any[] = [];
  constructor(public codxService: CodxService) {}
  ngOnInit() {
    this.codxService.modulesOb$.subscribe((res) => {
      this.lstModule = this.lstFull = res || [];
      var arrGroupID = [];
      this.lstFull.filter((x) => {
        if (x.functionType == 'G' && !arrGroupID.includes(x.functionID)) {
          arrGroupID.push(x.functionID);
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
      this.lstModule.push({ _itemHome: true, groupID: '', saleGroup: '' });
      this.lstGroup.unshift({ groupID: '', groupName: '' });
    });
  }
}
