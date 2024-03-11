import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'checkRoleStep'
})
export class CheckRoleStepPipe implements PipeTransform {
  constructor(
  ) {}

  transform(isAdmin,insStep,group,task,isUpdateStep,isUpdateGroup,isOnlyView): boolean {
    // checkOwner() => () {}
    if(task){

    }else if(group){

    }else if(insStep) {

    }
    return null;
  }

}
