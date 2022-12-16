import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoaderService {
    _state: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    state: Observable<boolean> = this._state.asObservable();

    show() {
        this._state.next(true);
    }
    hide() {
        this._state.next(false);

    }
}