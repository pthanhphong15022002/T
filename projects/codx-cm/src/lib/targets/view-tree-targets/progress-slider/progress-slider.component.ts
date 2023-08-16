import { Component, Input, SimpleChanges, ViewChild } from '@angular/core';
import { SliderComponent } from '@syncfusion/ej2-angular-inputs';

@Component({
  selector: 'codx-progress-slider',
  templateUrl: './progress-slider.component.html',
  styleUrls: ['./progress-slider.component.css'],
})
export class ProgressSliderComponent {
  @ViewChild('slider') slider: SliderComponent;

  @Input() progress: number;

  progressOut: number;
  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.progress) {
      this.progressOut = JSON.parse(
        JSON.stringify(parseFloat(this.progress.toFixed(2)))
      );
    }
  }

  reload() {
    if (this.slider) {
      this.slider.value = JSON.parse(
        JSON.stringify(this.progressOut));
      this.slider.writeValue(this.progressOut);
      this.slider['refreshing'] = true;
      this.slider.refresh();
    }
  }

  formatNumberWithout(data) {
    if (data > 100) {
      return data % 100;
    }
    return data;
  }

  getProgressBarWidth(progressOut) {
    const formattedProgress = this.formatNumberWithout(progressOut);
    const width = progressOut <= 100 ? progressOut : formattedProgress;
    return width + '%';
  }
}
