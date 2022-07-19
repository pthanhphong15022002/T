import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";


@Injectable({
    providedIn: 'root'
})
export class NoteBookServices {

    data = new BehaviorSubject<any>(null);

    constructor(
    ) { }
}