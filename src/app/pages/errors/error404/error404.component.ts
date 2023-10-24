import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CacheService } from 'codx-core';

@Component({
  selector: 'codx-error404',
  templateUrl: './error404.component.html',
  styleUrls: ['./error404.component.scss'],
})
export class Error404Component implements OnInit {
  mssgCode = 'SYS013';
  mssgCode1 = 'SYS032';
  mssgCode2 = 'SYS032';
  mssgCode3 = 'SYS032';
  mssgCode4 = 'SYS032';

  mssgCode5 = 'SYS032';
  title = '';
  constructor(
    private cache: CacheService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cache.message(this.mssgCode).subscribe((res) => {
      if (res) {
        this.title = res.customName || res.defaultName || '';
        this.changeDetectorRef.detectChanges();
      }
    });
  }
}
