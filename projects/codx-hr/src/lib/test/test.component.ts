import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CacheService } from 'codx-core';

@Component({
  selector: 'lib-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent {
  data: any;
  funcID: any;
  lstDtDis: any;
  gridViewSetup: any;
  formModel:any;
  constructor(private cache:CacheService,
    private router: ActivatedRoute){
    this.router.params.subscribe((params) => {
      this.funcID = params['FuncID'];
      if(this.funcID)
     this.cache.functionList(this.funcID).subscribe((fuc) => {
        this.formModel = {
          entityName: fuc?.entityName,
          formName: fuc?.formName,
          funcID: this.funcID,
          gridViewName: fuc?.gridViewName,
        };
      });    
    });
    
  }
}
