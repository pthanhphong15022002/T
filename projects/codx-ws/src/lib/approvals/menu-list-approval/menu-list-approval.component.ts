import { Component, Input, OnInit } from '@angular/core';
import { CodxWsService } from '../../codx-ws.service';
import { isObservable } from 'rxjs';

@Component({
  selector: 'lib-menu-list-approval',
  templateUrl: './menu-list-approval.component.html',
  styleUrls: ['./menu-list-approval.component.scss']
})
export class MenuListApprovalComponent implements OnInit{
  @Input() funcID: any;
  funcList:any;
  listParentGroup:any;

  constructor(private codxWsService: CodxWsService)
  {
  }
  
  ngOnInit(): void {
    this.getFuncList();
    this.getParentGroup();
  }
  
  getFuncList()
  {
    var fucList = this.codxWsService.loadFuncList("WS") as any;
    if(isObservable(fucList))fucList.subscribe((item : any)=>{if(item)this.funcList = item.filter(x=>x.parentID == this.funcID)})
    else this.funcList = fucList.filter(x=>x.parentID == this.funcID);
  }

  getParentGroup()
  {
    var parentG = this.codxWsService.loadParentGroup(this.funcID);
    if(isObservable(parentG)) parentG.subscribe(item=>{if(item) this.listParentGroup = item})
    else this.listParentGroup = parentG
  }
}
