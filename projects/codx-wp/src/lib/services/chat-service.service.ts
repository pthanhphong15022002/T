import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatServiceService {

  // service test
  constructor(

  ) { }

  private _closeBoxChat$ = new Subject();
  private _openBoxChat$ = new Subject();


  public close$ = this._closeBoxChat$.asObservable();
  public openBoxChat$ = this._openBoxChat$.asObservable();


  closeBoxChat(reason?: any) {
    this._closeBoxChat$.next(reason);
  }
  // open box chat
  openBoxChat(reason?: any) {
    this._openBoxChat$.next(reason);
  }
  // rendering component
  renderComponent(groupID:string){
    let _eleChatContainer = document.getElementsByTagName("codx-chat-box");
    let _boxChats = Array.from(_eleChatContainer);
    let _boxChat = _boxChats.find(e => e.id === groupID);
    if(!_boxChat){

    }
  }
}
