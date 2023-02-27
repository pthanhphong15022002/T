import { Injectable } from '@angular/core';
import { ApiHttpService, NotificationsService } from 'codx-core';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  constructor(
    private notiService: NotificationsService,
    private api: ApiHttpService
  ) {}

  toCamelCase(pascalCase: string): string {
    return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);
  }

  validateFormData(
    formData: any,
    gridViewSetup: any,
    requiredFields: { gvsPropName: string; dataPropName?: string }[]
  ): boolean {
    let isValid: boolean = true;
    for (const rf of requiredFields) {
      const dataPropName = rf?.dataPropName ?? this.toCamelCase(rf.gvsPropName);
      if (!formData[dataPropName]?.trim()) {
        this.notiService.notifyCode(
          'SYS009',
          0,
          `"${gridViewSetup[rf.gvsPropName]?.headerText}"`
        );
        isValid = false;
      }
    }
    return isValid;
  }

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
