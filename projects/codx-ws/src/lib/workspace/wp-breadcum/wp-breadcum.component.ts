import { Component, Input, OnInit } from '@angular/core';
import { CodxWsService } from '../../codx-ws.service';
import { isObservable } from 'rxjs';

@Component({
  selector: 'lib-wp-breadcum',
  templateUrl: './wp-breadcum.component.html',
  styleUrls: ['./wp-breadcum.component.css']
})
export class WpBreadcumComponent implements OnInit{
  @Input() funcID:any;

  func:any;
  constructor(private codxWSService: CodxWsService) 
  {
    
  }

  ngOnInit(): void {
    this.getFunc();
  }

  getFunc()
  {
    var getFunc = this.codxWSService.loadFunc(this.funcID);
    if(isObservable(getFunc))
    {
      getFunc.subscribe(item=>{
        this.func = item;
      })
    }
    else this.func = getFunc;
  }
}
