import {
  Component,
  Input,
  ChangeDetectorRef,
  SimpleChanges,
} from '@angular/core';
import { FormModel } from 'codx-core';

@Component({
  selector: 'codx-view-img-contact',
  templateUrl: './view-img-contact.component.html',
  styleUrls: ['./view-img-contact.component.scss'],
})
export class ViewImgContactComponent {
  @Input() lstContact = [];
  @Input() numberIms = 1;
  @Input() formModel: FormModel;
  @Input() sizeImg = 25;
  listUserSearch = [];
  listUser = [];

  popupSearch: any;
  popupOld: any;
  popoverList: any;
  popoverDetail: any;

  constructor(private changeDectec: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    this.listUserSearch = [];
    this.listUser = [];
    this.changeDectec.detectChanges();

  }

  seachUser(e, value, p) {
    setTimeout(() => {
      e.stopPropagation();
      this.popupSearch = p;
      this.listUserSearch = value;
      this.listUser = value;
    }, 200);

    this.changeDectec.detectChanges();
  }

  searchName(e) {
    if (e.trim() == '') {
      this.listUserSearch = this.listUser;
      return;
    }
    let value = e.trim().toLowerCase();
    setTimeout(() => {
      this.listUserSearch = this.listUser.filter(
        (item) => item.contactName.toString().toLowerCase().search(value) >= 0
      );
    }, 200);
    this.changeDectec.detectChanges();

    // this.listUserSearch = resouscesSearch;
  }

  setTextPopover(text) {
    return text;
  }
  PopoverDetail(e, p: any, emp) {
    let parent = e.currentTarget.parentElement.offsetWidth;
    let child = e.currentTarget.offsetWidth;
    if (this.popupOld?.popoverClass !== p?.popoverClass) {
      this.popupOld?.close();
    }

    if (emp != null) {
      this.popoverList?.close();
      this.popoverDetail = emp;
      if (emp.contactName != null) {
        if (parent <= child) {
          p.open();
        }
      }
    } else p.close();
    this.popupOld = p;
    this.changeDectec.detectChanges();
  }
}
