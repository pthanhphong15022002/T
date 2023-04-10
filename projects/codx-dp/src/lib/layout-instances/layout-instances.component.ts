import {
  Component,
  OnInit,
  Injector,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import {
  CallFuncService,
  DialogModel,
  DialogRef,
  LayoutBaseComponent,
  SidebarModel,
} from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'lib-layout-instances',
  templateUrl: './layout-instances.component.html',
  styleUrls: ['./layout-instances.component.css'],
})
export class LayoutInstancesComponent extends LayoutBaseComponent {
  @ViewChild('popupGuide') popupGuide;
  vllApplyFor = 'DP002';
  module = '';
  override aside = false;
  override toolbarFixed = false;

  //override asideFixed = true;
  // override asideTheme: 'dark' | 'light' | 'transparent' = 'transparent';
  //override toolbar = false;
  //dataProcess = new BehaviorSubject<any>(null);
  processView: any;
  stepViews = [];
  dialogGuide: DialogRef;

  constructor(
    inject: Injector,
    private changDef: ChangeDetectorRef,
    private codxShareService: CodxShareService,
    private callfc: CallFuncService
  ) {
    super(inject);
  }

  onInit(): void {
    this.codxShareService.hideAside.subscribe((res) => {
      if (res != null) this.setAside(res);
    });
  }

  onAfterViewInit(): void {}

  openFormNoteDrawer() {
    let option = new SidebarModel();
    option.Width = '550px';
    this.callfc.openSide(NoteDrawerComponent, '', option);
  }
  viewNameProcess(ps) {
    this.processView = ps;
    if (this.processView?.steps?.length > 0)
      this.processView.steps.forEach((x) => {
        if (!x.isFailStep && !x.isSuccessStep) {
          let obj = {
            stepName: x.stepName,
            memo: x.memo
          };
          this.stepViews.push(obj);
        }
      });
    this.changDef.detectChanges();
  }

  showGuide(p) {
    p.close();
    let option = new DialogModel();
    option.zIndex = 1001;

    this.dialogGuide = this.callfc.openForm(
      this.popupGuide,
      '',
      600,
      450,
      '',
      null,
      '',
      option
    );
  }
}
