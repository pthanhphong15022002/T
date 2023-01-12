import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-redirect-to',
  templateUrl: './redirect-to.component.html',
  styleUrls: ['./redirect-to.component.scss'],
})
export class RedirectToComponent implements OnInit {
  constructor(private aR: ActivatedRoute) {}

  ngOnInit(): void {
    this.aR.queryParams.subscribe((res) => {
      console.log(res);
    });
  }
}
