import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CodxOdService {
  SetLayout = new BehaviorSubject<any>(null);
  constructor() { }
}
