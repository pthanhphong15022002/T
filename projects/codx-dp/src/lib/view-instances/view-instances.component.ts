import {
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'lib-view-instances',
  templateUrl: './view-instances.component.html',
  styleUrls: ['./view-instances.component.css'],
})
export class ViewInstancesComponent implements OnInit, OnChanges {
  funcID: any;
  constructor(
    private activedRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnInit(): void {}
}
