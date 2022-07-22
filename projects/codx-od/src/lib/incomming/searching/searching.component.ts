import { Component, OnInit, AfterViewInit, AfterViewChecked } from '@angular/core';
import { CallFuncService } from 'codx-core';
import { CodxFullTextSearch } from 'projects/codx-share/src/lib/components/codx-fulltextsearch/codx-fulltextsearch.component';
@Component({
  selector: 'app-od-searching',
  templateUrl: './searching.component.html',
})

export class SearchingComponent implements OnInit , AfterViewInit , AfterViewChecked  {
  constructor(  
    private callfunc: CallFuncService,
  ){}
  ngAfterViewChecked(): void {
    //this.callfunc.openForm(CodxFullTextSearch,"",null,null,'ODT6',null,"",);
  }
  ngAfterViewInit(): void {
    this.callfunc.openForm(CodxFullTextSearch,"",null,null,'ODT6',null,"");
  }
  ngOnInit(): void {
    
  }
  ngAfterContentInit(): void{
    this.callfunc.openForm(CodxFullTextSearch,"",null,null,'ODT6',null,"");
  }
  aaa()
  {
    this.callfunc.openForm(CodxFullTextSearch,"",null,null,'ODT6',null,"");
  }
}
