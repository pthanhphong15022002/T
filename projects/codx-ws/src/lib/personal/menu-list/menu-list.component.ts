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
  selectedIndex = "WS00611";
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
          var data = item.filter(x=>x.parentID == this.funcID);
          this.funcList = this.formatData(data,item);
          this.selectedChange.emit(this.selectedIndex);
        }
      })
    }
    else {
      var data = fucList.filter(x=>x.parentID == this.funcID);
      this.funcList = this.formatData(data,fucList);
      this.selectedChange.emit(this.selectedIndex);
    }
  }

  formatData(data:any , listFunc:any)
  {
    data.forEach(element => {
      element.childs = listFunc.filter(x=>x.parentID == element.functionID);
    });
    return data;
  }

  menuChange(item:any)
  {
    this.selectedIndex = item?.functionID;
    this.selectedChange.emit(this.selectedIndex);
  }

  imgToSvg(e:any)
  {

  }
}
