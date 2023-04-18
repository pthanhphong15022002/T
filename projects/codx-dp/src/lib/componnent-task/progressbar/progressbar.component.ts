import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'codx-progressbar',
  templateUrl: './progressbar.component.html',
  styleUrls: ['./progressbar.component.scss'],
})
export class ProgressbarComponent implements OnInit,OnChanges {
  @Input() progress = 0;
  @Input() color = '#005DC7';
  @Input() size = 40;
  @Input() fontSize = 12;

  fontSizeSpan = ''
  ngOnInit(): void {
    this.progress = 0;
    this.fontSizeSpan = this.fontSize.toString() + 'px';
  }

  ngOnChanges(changes: SimpleChanges){
    if(changes?.progress){
      let progress = 0;
      for(let i = 0; i <= this.progress; i++) {
        setTimeout(() => {
          progress = i;
          this.load(progress);
        },1000)
        
      }
    }
  }
  load(percent) {
    const ppc = document.querySelector('.progress-pie-chart') as HTMLElement;
    const deg = (360 * percent) / 100;
    if (percent > 50) {
      ppc.classList.add('gt-50');
    }   
    const progressFill = document.querySelector('.ppc-progress-fill') as HTMLElement;
    progressFill.style.transform = `rotate(${deg}deg)`;  
    const percentsSpan = document.querySelector('.ppc-percents span') as HTMLElement;
    percentsSpan.innerHTML = `${percent}%`;
  }
}
