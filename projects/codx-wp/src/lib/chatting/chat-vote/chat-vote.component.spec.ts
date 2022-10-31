import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatVoteComponent } from './chat-vote.component';

describe('ChatVoteComponent', () => {
  let component: ChatVoteComponent;
  let fixture: ComponentFixture<ChatVoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatVoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatVoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
