import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiHttpService, CacheService, LayoutService } from 'codx-core';


@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.scss']
})
export class PersonalComponent implements OnInit {
  parentID: string = "WPT0321";
  formName: string="";
  gridViewName: string="";
  constructor(router: Router, private layout: LayoutService,private api: ApiHttpService, private cachesv: CacheService, private changedt: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.cachesv.functionList("WPT032").subscribe((res:any)=>{
      if(res){
        this.formName = res.formName;
        this.gridViewName = res.gridViewName;
        this.cachesv.moreFunction(this.formName, this.gridViewName).subscribe((res: any)=>{
          console.log(res);
          this.changedt.detectChanges();
        });
      }
    });

    this.get();
   
  }
  get()
  {
    this.api.execSv<any>("SYS","ERM.Business.SYS","MoreFunctionsBusiness","GetMoreByParentAsync", this.parentID).subscribe((result) =>{
     console.log(result);
     this.changedt.detectChanges();
   });
  }
}
