import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CodxWsService } from '../../codx-ws.service';
import { isObservable } from 'rxjs';

@Component({
  selector: 'lib-menu-list',
  templateUrl: './menu-list.component.html',
  styleUrls: ['./menu-list.component.scss']
})
export class MenuListComponent implements OnInit{
  @Input() funcID:any;
  @Output() selectedChange = new EventEmitter();
  funcList:any;
  selectedIndex = 0;
  constructor(private codxWsService: CodxWsService)
  {

  }
  
  ngOnInit(): void {
    this.getFuncList();
  }
  
  getFuncList()
  {
    var fucList = this.codxWsService.loadFuncList("WS") as any;

    if(isObservable(fucList))
    {
      fucList.subscribe((item : any)=>{
        if(item) {
          this.funcList = item.filter(x=>x.parentID == this.funcID);
        }
      })
    }
    else {
      this.funcList = fucList.filter(x=>x.parentID == this.funcID);
    }
  }

  menuChange(item:any, index:any)
  {
    this.selectedIndex = index;
    this.selectedChange.emit(item);
  }

  imgToSvg(e:any)
  {

  }
}
