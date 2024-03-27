import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormModel } from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { isObservable } from 'rxjs';

@Component({
  selector: 'lib-view-list-processes',
  templateUrl: './view-list-processes.component.html',
  styleUrls: ['./view-list-processes.component.css'],
})
export class ViewListProcessesComponent {
  @Input() data: any;
  @Input() formModel: FormModel;
  @Input() vllBP016 = [];
  @Output() dbClickEvent = new EventEmitter<any>();

  info: any;
  constructor(private shareService: CodxShareService, private detectorRef: ChangeDetectorRef) {}
  ngOnInit(): void {
    this.getInfo();
  }
  getInfo() {
    let paras = [this.data.createdBy];
    let keyRoot = 'UserInfo' + this.data.createdBy;
    let info = this.shareService.loadDataCache(
      paras,
      keyRoot,
      'SYS',
      'AD',
      'UsersBusiness',
      'GetOneUserByUserIDAsync'
    );
    if (isObservable(info)) {
      info.subscribe((item) => {
        this.info = item;
      });
    } else this.info = info;
  }

  popoverCrr: any;
  popoverDataSelected: any;
  lstPermissions = [];
  dataPermissions: any;
  lstUsersPositions = [];
  async popoverEmpList(p: any, data = null) {
    if (this.popoverCrr && this.popoverCrr?.isOpen()) {
      this.popoverCrr.close();
      this.lstPermissions = [];
    }
    if (this.popoverDataSelected) {
      if (this.popoverDataSelected.isOpen()) {
        this.lstPermissions = [];
        this.popoverDataSelected.close();
      }
    }

    if (p) {
      var element = document.getElementById(data?.recID);
      if (element) {
        var t = this;
        this.dataPermissions = data;
        this.lstPermissions = data?.permissions ?? [];
        let lstIDs = this.lstPermissions
          .filter(
            (x) =>
              x.objectID &&
              x.objectID.trim() !== '' &&
              (x.objectType == 'U' || x.objectType == '1')
          )
          .map((q) => q.objectID)
          .filter((value, index, self) => self.indexOf(value) === index);
      }
    }
  }

  searchName(e) {
    if (this.dataPermissions?.permissions) {
      if (e == null || e?.trim() == '') {
        this.lstPermissions = this.dataPermissions?.permissions ?? [];
        return;
      }

      this.lstPermissions = this.dataPermissions?.permissions.filter(
        (x) =>
          (x.objectName &&
            x.objectName?.trim() != '' &&
            this.fuzzySearch(e, x.objectName)) ||
          (x.objectID &&
            x.objectID?.trim() != '' &&
            this.fuzzySearch(e, x.objectID))
      );
    }
    this.detectorRef.detectChanges();
  }


  fuzzySearch(needle: string, haystack: string): boolean {
    const haystackLower = haystack
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s/g, '');

    const needleLower = needle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s/g, '');

    const regex = new RegExp([...needleLower].join('.*'));

    return regex.test(haystackLower);
  }

  clickMF(e, data) {
    this.dbClickEvent.emit({e: e, data: data});
  }
}
