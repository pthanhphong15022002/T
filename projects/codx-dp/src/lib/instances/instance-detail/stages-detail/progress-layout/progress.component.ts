import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'codx-progress-layout',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit{
  @Input() progress: any;
  @Input() type = 1;
  id = ''
  HTMLProgress = `<div style="font-size:12px;font-weight:bold;color:#005DC7;fill:#005DC7;margin-top: 2px;"><span></span></div>`
  ngOnInit(){
    this.id = "progress" + (Math.random()*100000000).toString();
  }
}
