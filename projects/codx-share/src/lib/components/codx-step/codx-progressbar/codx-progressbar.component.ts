import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'codx-progressbar',
  templateUrl: './codx-progressbar.component.html',
  styleUrls: ['./codx-progressbar.component.scss'],
})
export class ProgressbarComponent implements OnInit, OnChanges {
  @Input() progress = 0;
  @Input() color = '#005DC7';
  @Input() size = 40;

  fontSizeCustom = '';
  sizeCustom = '';
  sizespan = '';
  ngOnInit(): void {
    this.fontSizeCustom = Math.floor(this.size / 3).toString() + 'px';
    this.sizeCustom = this.size.toString() + 'px';
    this.sizespan = Math.floor(this.size / 1.25).toString() + 'px';
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.progress) {
      this.load(Math.floor(this.progress));
    }
  }

  getbackgroundColor() {
    return `--color: ${this.color}; --size: ${this.sizeCustom}; --size-span: ${this.sizespan}; --font-size: ${this.fontSizeCustom}`;
  }

  load(percent) {
    let circularProgress = document.querySelector(
      '.circular-progress'
    ) as HTMLElement;
    let progressValue = document.querySelector('.progress-value');
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
