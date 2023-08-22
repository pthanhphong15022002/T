import {
  Component,
  OnInit,
  Injector,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import {
  CallFuncService,
  DialogModel,
  DialogRef,
  LayoutBaseComponent,
  SidebarModel,
} from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';

import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'lib-layout-instances',
  templateUrl: './layout-instances.component.html',
  styleUrls: ['./layout-instances.component.css'],
})
export class LayoutInstancesComponent extends LayoutBaseComponent {
  @ViewChild('popupGuide') popupGuide;
  vllApplyFor = 'DP002';
  dialog!: DialogRef;
  processView: any;
  stepViews: any[];
  dialogGuide: DialogRef;
  funcID: any;
  formModel: any;
  // override aside = false;
  // override toolbarFixed = false;
  constructor(
    inject: Injector,
    private changDef: ChangeDetectorRef,
    private codxShareService: CodxShareService,
    private callfc: CallFuncService,
    private activedRouter: ActivatedRoute
  ) {
    super(inject);
    let a = this.activedRouter.snapshot.paramMap;
    debugger;
    //cai nay truyền dong dc nè ...da có cách
    //   this.router.events.subscribe((val) => {
    //     if(val &&  val instanceof NavigationEnd){
    //       let arr = val.url.split('/') ;
    //       if(arr.length >0){
    //         this.module = arr[1].toLocaleUpperCase() ;
    //       }
    //     }
    // });
    this.module = 'AC';

    // this.layoutModel.asideDisplay=false;
    // this.layoutModel.toolbarFixed=false;
  }

  onInit(): void {
    // this.codxShareService.hideAside.subscribe((res) => {
    //   if (res != null) this.setAside(res);
    // });
  }

  onAfterViewInit(): void {}

  viewNameProcess(ps) {
    // this.processView = ps;
    // this.stepViews = [];
    // if (this.processView?.steps?.length > 0)
    //   this.processView.steps.forEach((x) => {
    //     if (!x.isFailStep && !x.isSuccessStep) {
    //       let obj = {
    //         stepName: x.stepName,
    //         memo: x.memo,
    //       };
    //       this.stepViews.push(obj);
    //     }
    //   });
    // this.changDef.detectChanges();
  }

  showGuide(p) {
    // p.close();
    // let option = new DialogModel();
    // option.zIndex = 1001;
    // this.dialogGuide = this.callfc.openForm(
    //   this.popupGuide,
    //   '',
    //   600,
    //   470,
    //   '',
    //   null,
    //   '',
    //   option
    // );
  }
}
