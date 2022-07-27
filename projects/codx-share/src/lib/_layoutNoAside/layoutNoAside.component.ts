import { CodxShareService } from './../codx-share.service';
import { Component, OnInit, Injector } from '@angular/core';
import { LayoutBaseComponent } from 'codx-core';
import { Observable } from 'rxjs';
@Component({
  selector: 'lib-layoutNoAside',
  templateUrl: './layoutNoAside.component.html',
  styleUrls: ['./layoutNoAside.component.css'],
})
export class LayoutNoAsideComponent extends LayoutBaseComponent {
  module = '';
  override aside = false;
  //override asideFixed = true;
  // override asideTheme: 'dark' | 'light' | 'transparent' = 'transparent';
  //override toolbar = false;
  constructor(inject: Injector, private codxShareService: CodxShareService) {
    super(inject);
  }

  onInit(): void {
    this.codxShareService.hideAside.subscribe(res => {
      if (res != null)
        this.setAside(res);
    })
  }

  onAfterViewInit(): void { }
}
