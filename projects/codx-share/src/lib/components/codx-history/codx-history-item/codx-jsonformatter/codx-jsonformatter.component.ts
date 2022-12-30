import { Component, Input, OnInit ,ElementRef, AfterViewInit, ViewChild} from '@angular/core';
import JSONFormatter from 'json-formatter-js'

@Component({
  selector: 'codx-jsonformatter',
  templateUrl: './codx-jsonformatter.component.html',
  styleUrls: ['./codx-jsonformatter.component.css']
})
export class CodxJsonformatterComponent implements OnInit,AfterViewInit {

  @Input() value:any = null;
  constructor(private element: ElementRef) {}
  
  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if(this.value)
    {
      try {
        let data = JSON.parse(this.value);
        const formatter = new JSONFormatter(data,0);
        this.element.nativeElement.appendChild(formatter.render());
      } 
      catch (e) {}
    }
  }

}
