import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-process-step',
  templateUrl: './process-step.component.html',
  styleUrls: ['./process-step.component.scss'],
})
export class ProcessStepComponent implements OnInit {
  @Input() data = null;
  approvers = [];
  constructor() {}

  ngOnInit(): void {
    if (this.data) {
      this.approvers = this.data.approvers;
    }
  }
}
