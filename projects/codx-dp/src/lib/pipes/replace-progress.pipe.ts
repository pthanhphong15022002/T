import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replaceProgress'
})
export class ReplaceProgressPipe implements PipeTransform {

  transform(progress: number,  arg1: number,): string { 
    progress = progress >= 0 ? progress : 0;
    return progress.toFixed(arg1) + "%";
  }

}
