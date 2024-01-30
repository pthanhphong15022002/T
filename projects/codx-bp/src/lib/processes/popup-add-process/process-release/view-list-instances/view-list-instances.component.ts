import { Component, Input } from '@angular/core';
import { ApiHttpService } from 'codx-core';

@Component({
  selector: 'lib-view-list-instances',
  templateUrl: './view-list-instances.component.html',
  styleUrls: ['./view-list-instances.component.css'],
})
export class ViewListInstancesComponent {
  @Input() dataSelected: any;
  @Input() formModel: any;
  @Input() lstStages = [];

  countCurrent = 1;

  constructor(private api: ApiHttpService){

  };

  ngOnInit(): void {}



  getColor(data) {
    let color = 'step'; // Mặc định là 'step'
    const lst = this.lstStages;

    if (lst.some((x) => x.recID == data.recID)) {
      let currentIdx = lst.findIndex((x) => x.recID == data?.recID);

      if (
        currentIdx <
        lst.findIndex((x) => x.recID == this.dataSelected?.currentStage)
      ) {
        // Nếu index của item hiện tại nhỏ hơn index của '3'
        color = 'step old'; // Gán lớp 'step old'
      } else if (
        currentIdx ===
        lst.findIndex((x) => x.recID == this.dataSelected?.currentStage)
      ) {
        // Nếu index của item hiện tại bằng index của '3'
        color = 'step current'; // Gán lớp 'step current'
      }
    }
    return color; // Trả về lớp CSS
  }
}
