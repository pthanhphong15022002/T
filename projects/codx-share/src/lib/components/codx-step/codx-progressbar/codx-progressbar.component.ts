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
  @Input() size = 40;
  // @Input() type = 1;
  id = '';
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
      // this.load(Math.floor(this.progress));
      setTimeout(() => {
        this.onLoad();
      },100);
    }
    
  }
  ngOnInit(): void {
    this.id = Util.uid();
    this.HTMLProgress = `<div style="font-size:12px;font-weight:600;color:${this.color};fill:${this.color};margin-top: 2px;"><span></span></div>`;
    this.fontSizeCustom = Math.floor(this.size / 3).toString() + 'px';
    this.sizeCustom = this.size.toString() + 'px';
    this.sizespan = Math.floor(this.size / 1.25).toString() + 'px';
  }

  onLoad(){
    this.annotation.refresh();
  };
  // type1 = 'Circular';
  // fontSizeCustom = '';
  // sizeCustom = '';
  // sizespan = '';
  // HTMLProgress = '<div style="font-size:12px;font-weight:bold;color:#005DC7;fill:#005DC7;margin-top: 2px;"><span></span></div>'
  // id = Util.uid();
  // ngOnInit(): void {
  //   this.fontSizeCustom = Math.floor(this.size / 3).toString() + 'px';
  //   this.sizeCustom = this.size.toString() + 'px';
  //   this.sizespan = Math.floor(this.size / 1.25).toString() + 'px';
  // }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes?.progress) {
  //     this.load(Math.floor(this.progress));
  //   }
  // }

  // ngAfterViewInit() {
  //   this.load(Math.floor(this.progress));
  // }
  getbackgroundColor() {
    return `--color: ${this.color}; --size: ${this.sizeCustom}; --size-span: ${this.sizespan}; --font-size: ${this.fontSizeCustom}`;
  }

  load(percent) {
    let circularProgress = document.querySelector(
      '.circular-progress-' + this.id
    ) as HTMLElement;
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
