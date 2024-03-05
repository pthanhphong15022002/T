import { Component, Input, OnInit } from '@angular/core';
import { CacheService } from 'codx-core';

@Component({
  selector: 'lib-add-process-userinfo',
  templateUrl: './add-process-userinfo.component.html',
  styleUrls: ['./add-process-userinfo.component.css']
})
export class AddProcessUserinfoComponent implements OnInit{
  @Input() formModel:any

  vllBP022:any;
  constructor(
    private cache:CacheService
  )
  {

  }


  ngOnInit(): void {
    this.getVll();
  }

  getVll()
  {
    this.cache.valueList("BP022").subscribe(item=>{
      this.vllBP022 = item;
    })
  }
}
