import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { CodxSvService } from '../../codx-sv.service';
import { isObservable } from 'rxjs';
@Component({
  selector: 'app-search-suggestions',
  templateUrl: './search-suggestions.component.html',
  styleUrls: ['./search-suggestions.component.scss']
})
export class SearchSuggestionsComponent implements OnInit {
  
  tags:any;
  dialog:any;
  vllSV005:any;
  formModel:any;
  dataFilter:any;

  constructor(
    private svService : CodxSvService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  { 
    this.dialog = dialog;
    this.formModel = dt?.data?.formModel
  }
  ngOnInit(): void {
    //Lấy vll
    this.getVll();
  }

  getVll()
  {
    var tags = this.svService.loadTags(this.formModel?.entityName) as any;

    if(isObservable(tags))
    {
      tags.subscribe((item:any)=>{if(item) this.tags = item?.datas})
    }
    else this.tags = tags?.datas;

    
    var vllSV005 =  this.svService.loadValuelist("SV005") as any;
    if(isObservable(vllSV005))
    {
      vllSV005.subscribe((item : any)=>{ 
        if(item) this.vllSV005 = item.datas
      })
    }
    else this.vllSV005 = vllSV005.datas;


  }

  selectedGroupType(id:any)
  {
    this.removeElementsByClass("sv-sg-active");
    document.getElementById("sv-sg-"+id).classList.add("sv-sg-active");
  }

  removeElementsByClass(className){
    const elements = document.getElementsByClassName(className);
    for(var i =0 ; i < elements.length ; i++)
    {
      elements[i].classList.remove("sv-sg-active");
    }
  }

  filter(groupType:any,tagName:any)
  {
    var data = 
    {
      groupType : groupType,
      tagName: tagName,
      page:1,
      pageSize: 20
    }
  }
}
