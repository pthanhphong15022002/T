declare var window: any;
import { CodxOmService } from '../../codx-om.service';
import { OMCONST } from '../../codx-om.constant';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  CacheService,
  CallFuncService,
  ApiHttpService,
  NotificationsService,
  AuthStore,
} from 'codx-core';

@Component({
  selector: 'lib-okr-trees',
  templateUrl: './okr-trees.component.html',
  styleUrls: ['./okr-trees.component.scss'],
})
export class OkrTreesComponent implements OnInit, AfterViewInit {
  @Input() funcID:any;
  @Input() dataOKRPlans:any;
  @Input() okrFM:any;
  @Input() okrVll:any;
  @Input() orgUnitTree:any;
  @Input() okrGrv:any;
  dataTree: any;
  listDistribute: any;
  isAfterRender: boolean;
  curUser: any;
  openAccordionAlign=[];
  constructor(
    //private callfunc: CallFuncService,
    //private cache: CacheService,
    private codxOmService: CodxOmService,
    //private api: ApiHttpService,
    //private notificationsService: NotificationsService,
    private changeDetectorRef: ChangeDetectorRef,
    private authStore: AuthStore,
  ) {    
    this.curUser = authStore.get();
  }
  //_______________________Base Func_________________________//
  ngOnInit(): void {
    
    this.getOrgTreeOKR();
  }
  ngAfterViewInit() {
    
  }

  //-----------------------End-------------------------------//

  //_______________________Base Event________________________//

  clickMF(e: any, data: any) {}
  selectionChange(parent) {
    if (!parent.isItem) {
      parent.data.items= parent.data.items;
    }
  }
  //-----------------------End-------------------------------//

  //_______________________Get Data Func_____________________//
  getOrgTreeOKR() {
    if (this.curUser?.employee != null) {
      let tempOrgID = '';
      let okrLevel='';
      switch (this.funcID) {
        case OMCONST.FUNCID.COMP:
          tempOrgID = this.curUser?.employee.companyID;
          okrLevel =OMCONST.VLL.OKRLevel.COMP;
          break;
        case OMCONST.FUNCID.DEPT:
          tempOrgID = this.curUser?.employee.departmentID;
          okrLevel =OMCONST.VLL.OKRLevel.DEPT;
          break;
        case OMCONST.FUNCID.ORG:
          tempOrgID = this.curUser?.employee.orgUnitID;
          okrLevel =OMCONST.VLL.OKRLevel.ORG;
          break;
        case OMCONST.FUNCID.PERS:
          tempOrgID = this.curUser?.employee.employeeID;          
          okrLevel =OMCONST.VLL.OKRLevel.PERS;
          break;
      }
      this.codxOmService.getOrgTreeOKR(this.dataOKRPlans?.recID,tempOrgID).subscribe((listOrg: any) => {
        if (listOrg) {          

            this.orgUnitTree=[listOrg];
            this.changeDetectorRef.detectChanges();
            this.isAfterRender=true;
        }
      });
    }
  }

  //-----------------------End-------------------------------//

  //_______________________Validate Func_____________________//

  //-----------------------End-------------------------------//

  //_______________________Logic Func________________________//

  //-----------------------End-------------------------------//

  //_______________________Logic Event_______________________//

  //-----------------------End-------------------------------//

  //_______________________Custom Func_______________________//
  getItemOKRAlign(i: any, recID: any) {
    this.openAccordionAlign[i] = !this.openAccordionAlign[i];
    // if(this.dataOKR[i].items && this.dataOKR[i].items.length<=0)
    //   this.okrService.getKRByOKR(recID).subscribe((item:any)=>{
    //     if(item) this.dataOKR[i].items = item
    //   });
  }
  //-----------------------End-------------------------------//

  //_______________________Custom Event______________________//

  //-----------------------End-------------------------------//

  //_______________________Popup_____________________________//

  //-----------------------End-------------------------------//
  clickTreeNode(evt:any){
    evt.stopPropagation();
    evt.preventDefault();
  }
}
