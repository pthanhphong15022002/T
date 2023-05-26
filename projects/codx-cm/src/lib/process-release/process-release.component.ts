import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CodxCmService } from '../codx-cm.service';

@Component({
  selector: 'lib-process-release',
  templateUrl: './process-release.component.html',
  styleUrls: ['./process-release.component.css'],
})
export class ProcessReleaseComponent  {
  funcID: any;
  dataObj: any;

  constructor(
    private activedRouter: ActivatedRoute,
    private coxdCM: CodxCmService
  ) {
    this.activedRouter.params.subscribe((param) => {
      this.funcID = param['funcID'];
      let recID = param['recID'];
       let data ={
        activeDefault :recID,
        func0Default: this.funcID =='CM0201'?'CM02':'CM04',
        funcIDDefault :this.funcID 
      }
      this.coxdCM.childMenuDefault.next(data)
      this.dataObj = { processID: recID };
    });
  }

  ngOnInit(): void {
   // this.changeFunction();
  }
  // changeFunction() {
  //   this.coxdCM.childMenuClick.subscribe((res) => {
  //     if (res) {
  //       if (this.dataObj.procesID != res) this.dataObj = { processID: res };
  //     }
  //   });
  // }
}
