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

  toCamelCase(pascalCase: string): string {
    return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);
  }

  toPascalCase(camelCase: string): string {
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  }

  validateFormData(
    formGroup: FormGroup,
    gridViewSetup: any,
    irregularFields: string[] = []
  ): boolean {
    console.log(formGroup);
    console.log(gridViewSetup);

    const controls = formGroup.controls;
    let isValid: boolean = true;
    for (const propName in controls) {
      if (controls[propName].invalid) {
        const gvsPropName =
          irregularFields.find(
            (i) => i.toLowerCase() === propName.toLowerCase()
          ) ?? this.toPascalCase(propName);

        this.notiService.notifyCode(
          'SYS009',
          0,
          `"${gridViewSetup[gvsPropName]?.headerText}"`
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
