import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customStages',
})
export class CustomStagesPipe implements PipeTransform {
  transform(value, lstData = []) {
    let html = '';
    if (value == null || lstData == null) return null;
    const data = lstData.find((x) => x.recID == value);
    if (data == null) return html;

    if(data?.settings){
      const setting = JSON.parse(data?.settings);
      let icon = setting?.icon as string;
      if(icon != null && icon.trim() != ''){
        html = `<span class="icon-16 me-2 ${icon}"></span>`;
      }
    }

    html+= `<span>${data?.stepName}</span>`

    return html;
  }
}
