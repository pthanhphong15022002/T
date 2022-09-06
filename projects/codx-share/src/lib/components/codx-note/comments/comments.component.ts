import { Component, Inject, OnInit, Injector } from '@angular/core';
import { UIComponent } from 'codx-core';

@Component({
  selector: 'lib-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css'],
})
export class CommentsComponent extends UIComponent implements OnInit {
  constructor(private injector: Injector) {
    super(injector);
  }

  onInit(): void {}
}
