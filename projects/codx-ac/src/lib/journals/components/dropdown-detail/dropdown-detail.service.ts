import { Injectable } from '@angular/core';
import { CodxAcService } from '../../../codx-ac.service';

@Injectable({
  providedIn: 'root',
})
export class DropdownDetailService {
  userGroups: any[];
  userRoles: any[];

  constructor(private acService: CodxAcService) {
    this.acService
      .loadComboboxData('Share_GroupUsers', 'AD')
      .subscribe((res) => {
        this.userGroups = res;
      });
    this.acService
      .loadComboboxData('Share_UserRoles', 'AD')
      .subscribe((res) => {
        this.userRoles = res;
      });
  }
}
