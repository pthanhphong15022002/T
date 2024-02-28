import { Component, Injector, Optional } from '@angular/core';
import { DialogData, DialogRef, UIComponent } from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';
import { map } from 'rxjs';

@Component({
  selector: 'lib-journal-viewsetting',
  templateUrl: './journal-viewsetting.component.html',
  styleUrls: ['./journal-viewsetting.component.css']
})
export class JournalViewsettingComponent extends UIComponent {
  dialog!: DialogRef;
  journal: any;
  vllAC125: any = [];
  vllAC126: any = [];
  vllAC108: any = [];
  vllAC109: any = [];
  vllAC111: any = [];
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.journal = dialogData.data.journal;
  }

  onInit(): void {
    this.acService.setPopupSize(this.dialog, '450px', 'auto');
    this.getVll('AC134', 'journalTypes134');
    this.getVll('AC135', 'journalTypes135');
    this.getVll('AC136', 'journalTypes136');
    this.getVll('AC137', 'journalTypes137');
    this.getVll('AC138', 'journalTypes138');
    this.getVll('AC125', 'vllAC125');
    this.getVll('AC126', 'vllAC126');
    this.getVll('AC108', 'vllAC108');
    this.getVll('AC109', 'vllAC109');
    this.getVll('AC111', 'vllAC111');
  }

  getVll(vllCode: string, propName: string) {
    this.cache
      .valueList(vllCode)
      .pipe(map((d) => d.datas.map((v) => v.value)))
      .subscribe((res) => {
        this[propName] = res;
      });
  }
}
