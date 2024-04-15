import { Component, OnInit } from '@angular/core';


@Component({
    selector: 'lib-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
    dashboardCards = [
        {
          iconClass: "icon-attach_money",
          iconColor: "#08AD36",
          backgroundColor: "#CEFFDC",
          subtitle: "Tổng mức lương NV",
          number: "$47.5 M",
          percent: "+ 2.9%",
          borderColor: "#0DA738",
          percentColor: "#0DA738",
          borderBottom: "5px solid #0DA738"
        },
        {
          iconClass: "icon-i-hand-thumbs-up",
          iconColor: "#FF00A8",
          backgroundColor: "#FFE2E6",
          subtitle: "Mức độ hài lòng của NV",
          number: "90%",
          percent: "+ 2.9%",
          borderColor: "#FF00A8",
          percentColor: "#FF00A8",
          borderBottom: "5px solid #FF00A8"
        },
        {
          iconClass: "icon-groups",
          iconColor: "#005DC7",
          backgroundColor: "#EAF9FF",
          subtitle: "NV đang làm việc",
          number: "221",
          percent: "+ 2.9%",
          borderColor: "#005DC7",
          percentColor: "#005DC7",
          borderBottom: "5px solid #005DC7"
        },
        {
          iconClass: "icon-person_add",
          iconColor: "#FFA800",
          backgroundColor: "#FFF4DE",
          subtitle: "Mới vào làm trong tháng",
          number: "01",
          percent: "+ 2.9%",
          borderColor: "#FFA800",
          percentColor: "#FFA800",
          borderBottom: "5px solid #FFA800"
        },
        {
          iconClass: "icon-person_remove",
          iconColor: "#6C757D",
          backgroundColor: "#F1F1FA",
          subtitle: "Đã nghỉ việc trong tháng",
          number: "01",
          percent: "+ 2.9%",
          borderColor: "#6C757D",
          percentColor: "#6C757D",
          borderBottom: "5px solid #6C757D"
        }
      ];
}