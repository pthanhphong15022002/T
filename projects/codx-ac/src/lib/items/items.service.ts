import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ApiHttpService, NotificationsService } from 'codx-core';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  constructor(
    private notiService: NotificationsService,
    private api: ApiHttpService
  ) {}
  
  deleteImage(objectId: string, objectType: string) {
    return this.api
      .execSv(
        'DM',
        'ERM.Business.DM',
        'FileBussiness',
        'DeleteByObjectIDAsync',
        [objectId, objectType, true]
      )
      .subscribe((res) => console.log(res));
  }
}
