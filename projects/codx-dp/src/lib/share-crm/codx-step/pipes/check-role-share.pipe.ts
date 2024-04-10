import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'checkRoleShare'
})
export class checkRoleShare implements PipeTransform {
  constructor(
  ) {}

  transform(roles): boolean {
    return roles.some(x => x.roleType == "S")
  }

}
