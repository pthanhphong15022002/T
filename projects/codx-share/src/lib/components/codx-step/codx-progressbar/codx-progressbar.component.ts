import {
  ProgressBar,
  ProgressAnnotation,
  IProgressValueEventArgs,
  ILoadedEventArgs,
  ProgressTheme,
  AnimationModel,
} from '@syncfusion/ej2-progressbar';
import { EmitType } from '@syncfusion/ej2-base';
ProgressBar.Inject(ProgressAnnotation);
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Util } from 'codx-core';

@Component({
  selector: 'codx-progressbar',
  templateUrl: './codx-progressbar.component.html',
  styleUrls: ['./codx-progressbar.component.scss'],
})
export class ProgressbarComponent implements OnInit, OnChanges {
  @ViewChild('annotation') annotation: ProgressBar;
  @Input() progress = 0;
  @Input() color = '#005DC7';
  @Input() size = 36;
  @Input() stype = 1;
  @Input() class = '';
  // @Input() type = 1;
  id = Util.uid();
  HTMLProgress = '';
  type: string = 'Circular';
  min: number = 0;
  max: number = 100;
  startAngle: number = 0;
  endAngle: number = 0;
  width: string = '55';
  height: string = '55';
  animation: AnimationModel = { enable: true, duration: 1000, delay: 0 };
  progressChange = 0;

  fontSizeCustom = '';
  sizeCustom = '';
  sizespan = '';

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.progress){
      this.progressChange = JSON.parse(JSON.stringify(this.progress));
      setTimeout(() => {
        this.onLoad();
        this.load(Math.floor(this.progress));
      },100);
    }    
  }
  ngOnInit(): void {
    this.HTMLProgress = `<div style="font-size:12px;font-weight:600;color:${this.color};fill:${this.color};margin-top: 2px;"><span></span></div>`;
    this.fontSizeCustom = Math.floor(this.size / 3).toString() + 'px';
    this.sizeCustom = this.size.toString() + 'px';
    let sizespan = Math.floor(this.size / 1.25);
    sizespan = sizespan%2 == 0 ? sizespan : sizespan + 1;
    this.sizespan = sizespan.toString() + 'px';
  }

  onLoad(){
    if(this.annotation){
      this.annotation.refresh();
    }
  };


  // ngAfterViewInit() {
  //   this.load(Math.floor(this.progress));
  // }
  getbackgroundColor() {
    return `--color: ${this.color}; --size: ${this.sizeCustom}; --size-span: ${this.sizespan}; --font-size: ${this.fontSizeCustom}`;
  }

  load(percent) {
    let cla = '.circular-progress-' + this.id
    let circularProgress = document.querySelector(cla) as HTMLElement;
    let progressValue = document.querySelector('.progress-value-' + this.id);
    if (circularProgress && progressValue) {
      let progressStartValue = 0;
      let progressEndValue = percent;
      if(percent == 0){
        progressValue.textContent = `${progressStartValue}%`;
          circularProgress.style.background = `conic-gradient(${this.color} ${
            progressStartValue * 3.6
          }deg, #ededed 0deg)`;
      }else{
        let progress = setInterval(() => {
          progressStartValue++;

          progressValue.textContent = `${progressStartValue}%`;
          circularProgress.style.background = `conic-gradient(${this.color} ${
            progressStartValue * 3.6
          }deg, #ededed 0deg)`;

          if (progressStartValue >= progressEndValue) {
            clearInterval(progress);
          }
        }, 20);
      }

    }
  }
}
