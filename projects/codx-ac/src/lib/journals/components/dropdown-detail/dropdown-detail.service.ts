import { Injectable } from '@angular/core';
import { CodxAcService } from '../../../codx-ac.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DropdownDetailService {
  constructor(private acService: CodxAcService) {}

  getUserGroups(): Observable<any[]> {
    return this.acService.loadComboboxData('Share_GroupUsers', 'AD');
  }

  getUserRoles(): Observable<any[]> {
    return this.acService.loadComboboxData('Share_UserRoles', 'AD');
  }
}
