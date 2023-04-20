import { Component } from '@angular/core';
import { CacheService } from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'lib-approval-hrcontract',
  templateUrl: './approval-hrcontract.component.html',
  styleUrls: ['./approval-hrcontract.component.css']
})
export class ApprovalHRContractComponent {
  className = 'EContractsBusiness';
  method = 'GetListApprovalAsync';
  idField = 'recID';
  data: any;
  funcID: any;
  itemDetailId: any;
  lstDtDis: any;
  gridViewSetup: any;
  request : any;
  formModel:any;

  constructor(private cache:CacheService,
    private hrService: CodxHrService,
    private router: ActivatedRoute){
    this.router.params.subscribe((params) => {
      this.funcID = params['FuncID'];
      this.itemDetailId = params['id'];
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

  ngOnInit(): void {
    this.router.params.subscribe((params) => {
      this.itemDetailId = params['id'];
      if(this.itemDetailId){
        this.getDataDetail();
      }
    })
  }

  getDataDetail(){
    this.hrService.loadDataEContract(this.itemDetailId).subscribe((res) => {
      if (res) {
        this.data = res;
      }
    });
  }
}
