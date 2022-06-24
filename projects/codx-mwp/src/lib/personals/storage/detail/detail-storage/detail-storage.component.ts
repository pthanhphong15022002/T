import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { AuthStore } from 'codx-core';
import { UpdateDetailStorageComponent } from '../update-detail-storage/update-detail-storage.component';

@Component({
  selector: 'app-detail-storage',
  templateUrl: './detail-storage.component.html',
  styleUrls: ['./detail-storage.component.scss']
})
export class DetailStorageComponent implements OnInit {

  user: any;
  dataValue = '';
  data: any;
  predicate = '';

  @ViewChild('lstComment', { read: ViewContainerRef }) lstComment!: ViewContainerRef;
  constructor(private authStore: AuthStore) {
    this.user = this.authStore.get();
   }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(){
    this.loadListPostComponent();
  }

  private loadListPostComponent() { 
    // var a = this.lstComment.createComponent(ListPostComponent);
    // a.instance.predicate = this.predicate;
    // a.instance.dataValue = this.dataValue;
    // a.instance.isShowCreate = false;
  }

}
