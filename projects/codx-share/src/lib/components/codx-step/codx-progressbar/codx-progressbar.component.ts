import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'codx-progressbar',
  templateUrl: './codx-progressbar.component.html',
  styleUrls: ['./codx-progressbar.component.scss'],
})
export class ProgressbarComponent implements OnInit,OnChanges {
  @Input() progress = 0;
  @Input() color = '#005DC7';
  @Input() size = 40;


  fontSizeCustom = '';
  sizeCustom = '';
  sizespan = '';
  ngOnInit(): void {
    this.fontSizeCustom = (Math.floor(this.size/3)).toString() + 'px';
    this.sizeCustom = this.size.toString() + 'px';
    this.sizespan = (Math.floor(this.size/1.25)).toString() + 'px';
  }

  ngOnChanges(changes: SimpleChanges){
    if(changes?.progress){
      this.load(Math.floor(this.progress));
    }
  }

  getbackgroundColor() {
    return `--color: ${this.color}; --size: ${this.sizeCustom}; --size-span: ${this.sizespan}`;
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
