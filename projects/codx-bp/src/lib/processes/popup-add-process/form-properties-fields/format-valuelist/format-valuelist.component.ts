import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { ApiHttpService, CacheService } from 'codx-core';

@Component({
  selector: 'lib-format-valuelist',
  templateUrl: './format-valuelist.component.html',
  styleUrls: ['./format-valuelist.component.css']
})
export class FormatValuelistComponent {
  @Input() item: any;

  datasVll = [];
  mutiSelectVll: boolean;
  plancehoderVll = '';
  fields = { text: 'textValue', value: 'value', icon: 'icon', color: 'color', textColor: 'textColor' };
  constructor(private cache: CacheService, private api: ApiHttpService, private detectorRef: ChangeDetectorRef){

  }

  ngOnInit(): void {
    if(this.item?.refValue != null && this.item?.refValue?.trim() != ''){
      this.loadDataVll();
    }

  }

  ngAfterViewInit(): void {


  }

  loadDataVll() {
    this.api
      .execSv<any>('SYS', 'SYS', 'ValueListBusiness', 'GetAsync', [
        this.item?.refValue,
      ])
      .subscribe((vl) => {
        if (vl) {
          this.mutiSelectVll = vl?.multiSelect;
          this.plancehoderVll = vl?.note;
          const defaultValues = vl?.defaultValues?.split(';');
          const iconSets = vl?.iconSet?.split(';');
          const colorSets = vl?.colorSet?.split(';');
          const textColorSets = vl?.textColorSet?.split(';');

          if (!defaultValues || defaultValues?.length == 0) {
            this.datasVll = [];
            return;
          }

          if (vl.listType == 1) {
            for(let i = 0; i < defaultValues.length; i++){
              let tmp = {};
              tmp['textValue'] = defaultValues[i];
              tmp['value'] = defaultValues[i];
              tmp['icon'] = iconSets[i];
              tmp['color'] = colorSets[i];
              tmp['textColor']= textColorSets[i];
              this.datasVll.push(tmp);
            }
          }

          //chua lam 2
        } else this.datasVll = [];
      });
  }

}
