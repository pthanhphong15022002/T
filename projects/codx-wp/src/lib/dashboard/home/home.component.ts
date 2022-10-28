
import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CacheService, CallFuncService, DialogModel, LayoutService, PageTitleService, ViewModel, ViewType } from 'codx-core';
import { PopupSearchPostComponent } from './list-post/popup-search/popup-search.component';
@Component({
  selector: 'codx-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  constructor(
    private callFC:CallFuncService,
    private page: PageTitleService,
    private cache: CacheService,
    private router: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.router.params.subscribe((params) => {
      let funcID = params['funcID'];
      this.cache.functionList(funcID).subscribe(f=>{
        if(f){
          this.page.setSubTitle(f.customName);
        }
      });
    });    
  }

  clickShowPopupSearch()
  {
    let option = new DialogModel();
    option.IsFull = true;
    this.callFC.openForm(PopupSearchPostComponent,"",0,0,"",null,"",option);
  }
}
