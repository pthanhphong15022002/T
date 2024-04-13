import { Pipe, PipeTransform } from '@angular/core';
import { DP_Instances_Steps_Tasks } from '../../../models/models';
import { StepService } from '../step.service';

@Pipe({
  name: 'checkTaskLate'
})
export class checkTaskLate implements PipeTransform {
  constructor(
    private stepService: StepService,
  ) {}

  transform(task : DP_Instances_Steps_Tasks): boolean {
    if(!task || !task?.endDate) return false;
    let today = new Date();
    var check = this.stepService.compareDates(task?.endDate,today,"h") 
    if((['1','2'].includes(task?.status) || task.progress < 100) &&  check == -1){
      return true;
    }
    return false;
  }

}
