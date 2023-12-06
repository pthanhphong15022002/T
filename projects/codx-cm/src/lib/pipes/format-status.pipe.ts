import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatStatus'
})
export class FormatStatusPipe implements PipeTransform {

  transform(value, lstLeads = [], lstProcesss = [], field: string) {
    if(value && lstLeads?.length > 0){
      var obj = {};
      var idx = lstLeads.findIndex((x) => x.recID == value);

      if (idx != -1) {
        const data = lstLeads[idx];
        obj['applyProcess'] = data?.applyProcess;
        const process = lstProcesss?.find(
          (x) => x.processId == data?.processID
        );
        if (process != null) {
          const stepCurrent = process?.tmpSteps?.find(
            (x) => x.stepId == data?.stepID
          );
          if (stepCurrent != null) {
            obj['icon'] = stepCurrent?.icon;
            obj['iconColor'] = stepCurrent?.iconColor;
            obj['textColor'] = stepCurrent?.textColor;
            obj['backgroundColor'] = stepCurrent?.backgroundColor;
            obj['currentStepName'] = stepCurrent?.stepName;
          }
        }
      }
      return obj[field];
    }
    return null;
  }

}
