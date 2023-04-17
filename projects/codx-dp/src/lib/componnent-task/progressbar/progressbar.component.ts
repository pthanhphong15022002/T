import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'codx-progressbar',
  templateUrl: './progressbar.component.html',
  styleUrls: ['./progressbar.component.scss'],
})
export class ProgressbarComponent implements OnInit {
  ngOnInit(): void {
    this.load();
  }

  load() {
    const ppc = document.querySelector('.progress-pie-chart') as HTMLElement;
    const percent = parseInt(ppc.getAttribute('data-percent') as string);
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
