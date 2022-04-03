import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiHttpService, AuthStore, NotificationsService, ResponseModel, TenantStore } from "codx-core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { Post } from "src/shared/models/post";

@Injectable({
  providedIn: 'root'
})
export class WPService {
  constructor(private http: HttpClient,
    private api: ApiHttpService,
    private notifi: NotificationsService,
    private authStore: AuthStore,
    private tenant: TenantStore) {
  }

  getPost(id) {
    return this.api.exec<Post>('WP', 'CommentBusiness', 'GetPostByIDAsync', id);
  }

  getData(pageIndex = 0, pageSize = 10, search?) {
    return this.api.exec<Post>('ERM.Business.WP', 'CommentBusiness', 'GetListPostAsync', [pageSize, pageIndex, search]);
  }

  getPostDetail(id) {
    return this.api.call('ERM.Business.WP', 'CommentBusiness', 'GetListPostDetailAsync', id);
  }

  loadPageComment(id, pageIndex) {
    return this.api.exec<Post>('ERM.Business.WP', 'CommentBusiness', 'LoadPageCommentAsync', [id, pageIndex]);
  }

  loadSubComment(id, pageIndex) {
    return this.api.exec<Post>('ERM.Business.WP', 'CommentBusiness', 'GetSubCommentAsync', [id, pageIndex]);
  }

  updateContent(data) {
    return this.api.exec<any>('ERM.Business.WP', 'CommentBusiness', 'UpdateAsync', data);
  }

  getVoted(id) {
    return this.api.call('WP', 'VotesBusiness', 'GetVoted', id);
  }

  postComment(id, content, parentId, type = "WP_Comments") {
    return this.post('api/wp/comment', 'CommentBusiness', 'PublishCommentAsync', [id, content, parentId, type]);
  }

  createPost(data) {
    const url = "api/wp/post";
    return this.post(url, 'CommentBusiness', 'PublishPostAsync', data);
  }

  share(data) {
    const url = "api/wp/share";
    return this.post(url, 'CommentBusiness', 'ShareForAsync', data);
  }

  votePost(id) {
    return this.post('api/wp/votepost', 'VotesBusiness', 'VotePostAsync', id);
  }

  checkfile(form) {
    const url = "wp/CheckFile";
    return this.api.post(url, form);
  }

  deletePost(id) {
    return this.post('api/wp/deletePost', 'CommentBusiness', 'DeletePostAsync', id);
  }

  shared(id, type) {
    return this.post('api/wp/shar', 'CommentBusiness', 'FeedBackPostAsync', [id, type]);
  }

  post(url, className, methodName, data?): Observable<any> {

    if (data !== null && data !== undefined && !Array.isArray(data)) {
      data = [data];
    }

    const request: any = {
      isJson: true,
      service: "WP",
      assemblyName: "ERM.Business.WP",
      className,
      methodName,
      msgBodyData: data
    };

    const user = this.authStore.get();
    if (user) {
      request.userID = user.userID;
      request.bUID = user.bUID;
      request.tenant = user.tenant;
    } else {
      let tenant = this.tenant.getName();
      request.tenant = tenant;
    }

    return this.http.post<any>(`${environment.apiUrl}/${url}`, request)
      .pipe(map(result => {
        const resp = new ResponseModel(result);
        if (resp && resp.error) {
          // this.notifi.toast(resp.error);
          console.log(resp.error)
        }

        return resp;
      }));
  }
}
