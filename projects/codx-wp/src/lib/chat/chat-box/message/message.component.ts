import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'lib-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

  @Input() message:any = null
  constructor() { }

  ngOnInit(): void {
  }

}
