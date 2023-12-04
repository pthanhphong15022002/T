import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { CodxWsService } from '../../codx-ws.service';
import { isObservable } from 'rxjs';

@Component({
  selector: 'lib-menu-list-approval',
  templateUrl: './menu-list-approval.component.html',
  styleUrls: ['./menu-list-approval.component.scss'],
})
export class MenuListApprovalComponent implements OnInit{

  @Input() module: string = "";
  @Input() funcID: any;
  @Output() clickChange = new EventEmitter<any>();
  
  funcList:any;
  listParentGroup:any;

  listFavorite = [{customName:"Tất cả",functionID:"All"}];
  selectedIndex = "All";

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
    if(isObservable(fucList))fucList.subscribe((item : any)=>{ 
      if(item) this.funcList = item.filter(x=>x.parentID == "WS005")
    })
    else this.funcList = fucList.filter(x=>x.parentID == "WS005");
  }

  getParentGroup()
  {
    var parentG = this.codxWsService.loadParentGroup(this.funcID);
    if(isObservable(parentG)) parentG.subscribe((item:any)=>{
      if(item) {
        this.listParentGroup = item;
        if(this.module && this.module != "WS") this.listParentGroup = this.listParentGroup.filter(x=>x.functionID == this.module)
      }
    })
    else {
      this.listParentGroup = parentG;
      if(this.module && this.module != "WS") this.listParentGroup = this.listParentGroup.filter(x=>x.functionID == this.module)
    }
  }

  selectedChange(data:any)
  {
    this.selectedIndex = data?.functionID;
    this.clickChange.emit(this.selectedIndex);
  }
}
