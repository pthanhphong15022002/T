import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'lib-okr-targets',
  templateUrl: './okr-targets.component.html',
  styleUrls: ['./okr-targets.component.css']
})
export class OkrTargetsComponent implements OnInit {

  @Input() dataOKR : any;
  @Input() formModel : any;
  openAccordion = [];
  constructor() { }

  ngOnInit(): void {
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
}
