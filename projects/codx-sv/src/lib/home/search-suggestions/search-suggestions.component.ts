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
  dialog:any;
  vllSV003:any;
  vllSV005:any;
  constructor(
    private svService : CodxSvService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  { 
    this.dialog = dialog;
  }
  ngOnInit(): void {
    //Lấy vll
    this.getVll();
  }

  
  getVll()
  {
    var vllSV003 = this.svService.loadValuelist("SV003");

    if(isObservable(vllSV003))
    {
      vllSV003.subscribe(item=>{if(item) this.vllSV003 = item})
    }
    else this.vllSV003 = vllSV003;

    
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
}
