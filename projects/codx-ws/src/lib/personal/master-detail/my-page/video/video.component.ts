import { Component } from '@angular/core';
import { AuthService, AuthStore, CacheService } from 'codx-core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'lib-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent {
  predicate = `ObjectType=@0 && IsDelete=@1 && CreatedBy=@2 && ReferType=@3`;
  dataValue: any;
  user: any;
  constructor(
    private cache: CacheService,
    private auth: AuthService,
    private authStore: AuthStore
  ) {
   
    this.user = this.authStore.get();
    this.dataValue = `WP_Comments;false;${this.user?.userID};video`;
  }
  getSrcVideo(data) {
    return (data['srcVideo'] = `${environment.urlUpload}/${data.pathDisk}`);
  }
}
