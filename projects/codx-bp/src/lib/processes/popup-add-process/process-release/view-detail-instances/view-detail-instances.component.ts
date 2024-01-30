import { ChangeDetectorRef, Component, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'lib-view-detail-instances',
  templateUrl: './view-detail-instances.component.html',
  styleUrls: ['./view-detail-instances.component.css'],
})
export class ViewDetailInstancesComponent {
  @Input() dataSelected: any;
  @Input() formModel: any;
  @Input() asideMode: string ;
  @Input() lstSteps = [];
  loaded: boolean;
  id: any;
  isShow = false;

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSelected']) {
      if (
        changes['dataSelected'].currentValue != null &&
        changes['dataSelected'].currentValue?.recID
      ) {
        if (changes['dataSelected'].currentValue?.recID == this.id) return;
        this.loaded = false;
        this.id = changes['dataSelected'].currentValue?.recID;
        this.dataSelected = JSON.parse(
          JSON.stringify(changes['dataSelected'].currentValue)
        );
        this.loaded = true;

      }
    }
  }

  clickShowTab(isShow) {
    this.isShow = isShow;
    this.changeDetectorRef.detectChanges();
  }

}
