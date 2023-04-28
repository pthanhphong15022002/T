import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CallFuncService,
  DialogModel,
  DialogRef,
  LayoutBaseComponent,
  SidebarModel,
} from 'codx-core';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class LayoutComponent extends LayoutBaseComponent {
  @ViewChild('popupGuide') popupGuide;
  vllApplyFor = 'DP002';
  dialog!: DialogRef;
  processView: any;
  stepViews: any[];
  dialogGuide: DialogRef;
  funcID: any;
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
    this.module = 'DP';
  }

  onInit(): void {
   
  }

  onAfterViewInit(): void {
   
  }

  openFormNoteDrawer() {
    let option = new SidebarModel();
    option.Width = '550px';
    this.dialog = this.callfc.openSide(NoteDrawerComponent, '', option);
    this.dialog.closed.subscribe();
  }

  viewNameProcess(ps) {
    this.processView = ps;
    this.stepViews = [];
    if (this.processView?.steps?.length > 0)
      this.processView.steps.forEach((x) => {
        if (!x.isFailStep && !x.isSuccessStep) {
          let obj = {
            stepName: x.stepName,
            memo: x.memo,
          };
          this.stepViews.push(obj);
        }
      });
    this.changDef.detectChanges();
  }

  hidenNameProcess(){
    this.processView =null ;
    this.stepViews = [];
  }

  showGuide(p) {
    p.close();
    let option = new DialogModel();
    option.zIndex = 1001;

    this.dialogGuide = this.callfc.openForm(
      this.popupGuide,
      '',
      600,
      470,
      '',
      null,
      '',
      option
    );
  }
}
