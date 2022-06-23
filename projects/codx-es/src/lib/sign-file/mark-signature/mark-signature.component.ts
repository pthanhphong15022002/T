import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ViewsComponent } from 'codx-core';
import { CodxEsService } from '../../codx-es.service';

@Component({
  selector: 'app-mark-signature',
  templateUrl: './mark-signature.component.html',
  styleUrls: ['./mark-signature.component.scss']
})
export class MarkSignatureComponent implements OnInit {

  constructor(
    private esService: CodxEsService,
    private df: ChangeDetectorRef,

  ) { }

  files
  switch_1 = true;
  switch_2 = true;
  switchControl: FormControl

  service
  document



  @ViewChild('actions') actions : ViewsComponent;
  
  ngOnInit(): void {
    this.esService.loadSignFiles().subscribe(
      res => {
        this.files = res[0]

        this.df.detectChanges()

      })
    this.switchControl = new FormControl(false)
  }
  selectFile() {

  }

  selectApprover() {

  }

  changeSwitchState(crrV, which) {
    switch (which) {
      case 'sw1':
        this.switch_1 = !crrV
        break;
      case 'sw2':
        this.switch_2 = !crrV
        break;
    }

  }
}
