import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'read-more-v2',
  templateUrl: './readmorev2.component.html',
  styleUrls: ['./readmorev2.component.scss']
})
export class Readmorev2Component implements OnInit {
  @Input() shortContent: string;
  @Input() content: string;
  read: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

  toggleContent() {
    this.read = !this.read;
  }

}
