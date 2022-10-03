
import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { CallFuncService, DialogModel, LayoutService, ViewModel, ViewType } from 'codx-core';
import { PopupSearchPostComponent } from './list-post/popup-search/popup-search.component';
@Component({
  selector: 'codx-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit {

  constructor(
    private callFC:CallFuncService
  ) { }

  ngOnInit(): void {
  }
  clickShowPopupSearch()
  {
    let option = new DialogModel();
    option.IsFull = true;
    this.callFC.openForm(PopupSearchPostComponent,"",0,0,"",null,"",option);
  }
}
