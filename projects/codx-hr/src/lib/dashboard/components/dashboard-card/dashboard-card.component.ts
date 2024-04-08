import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-dashboard-card',
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.css']
})
export class DashboardCardComponent {
  @Input() iconClass: string = "icon-attach_money"; 
  @Input() iconColor: string = "#000"; 
  @Input() backgroundColor: string = '#000'
  @Input() subtitle: string = '';
  @Input() number: string = '0';
  @Input() percent: string = '+0%';
  @Input() borderColor: string = '#000';
  @Input() percentColor: string = '#000';
  @Input() borderBottom: string;
}
