import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'codx-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit{
  @Input() progress: any;
  id = ''

  ngOnInit(){
    this.id = "progress" + (Math.random()*100000000).toString();
  }
}
