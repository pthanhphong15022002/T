import { Component, Input, OnInit } from '@angular/core';
import { CacheService, CallFuncService } from 'codx-core';
import { OkrEditComponent } from '../okr-edit/okr-edit.component';

@Component({
  selector: 'lib-okr-targets',
  templateUrl: './okr-targets.component.html',
  styleUrls: ['./okr-targets.component.css']
})
export class OkrTargetsComponent implements OnInit {

  @Input() dataOKR : any;
  @Input() formModel : any;
  @Input() gridView:any;
  dtStatus = [];
  openAccordion = [];
  constructor(
    private callfunc: CallFuncService,
    private cache : CacheService
  ) { }

  ngOnInit(): void {
    this.cache.valueList('OM002').subscribe(item=>{
      if(item?.datas) this.dtStatus = item?.datas;
    })
  }
  //Lấy danh sách kr của mục tiêu
  getItemOKR(i:any,recID:any)
  {
    this.openAccordion[i] = !this.openAccordion[i];
    // if(this.dataOKR[i].child && this.dataOKR[i].child.length<=0)
    //   this.okrService.getKRByOKR(recID).subscribe((item:any)=>{
    //     if(item) this.dataOKR[i].child = item
    //   });
  }

  clickMF(e:any)
  {
    var funcID = e?.functionID;
    switch(funcID)
    {
      case 'SYS03':
      {
        let dialog = this.callfunc.openSide(
          OkrEditComponent,
          [
            this.gridView
          ]
        );
        break;
      }
    }
  }
}
