import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'read-more',
  templateUrl: './readmore.component.html',
  styleUrls: ['./readmore.component.scss'],
})
export class ReadMoreComponent implements OnInit {


  @Input() content: string;
  @Input() textColor: string;
  @Input() limit: number;
  @Input() completeWords: boolean;
  @Input() showReadMore: boolean = true;
  @Input() maxmimun: number = 100;
  isContentToggled: boolean = true;
  nonEditedContent: string;

  constructor() { }

  ngOnInit() {
    this.nonEditedContent = this.content;
    this.content = this.formatContent(this.content);
  }

  toggleContent() {
    this.isContentToggled = !this.isContentToggled;
    this.content = this.isContentToggled ? this.nonEditedContent : this.formatContent(this.content);
  }

  formatContent(content: string) {
    if (!content || content.length < this.maxmimun) return content;

    this.isContentToggled = false;
    if (this.completeWords) {
      this.limit = content.substr(0, this.limit).lastIndexOf(' ');
    }
    return `${content.substr(0, this.limit)}...`;
  }


}
