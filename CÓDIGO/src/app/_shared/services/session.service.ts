import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import jwt_decode from "jwt-decode";
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class SessionService {
    private session = new BehaviorSubject<any>(null);
    _session = this.session.asObservable();


    private SESSION_TAG = "13105997-2297-4a41-b5f1-2ef2a6269a50";



    constructor(
        private route: Router,
        private httpClient: HttpClient
    ) {
        this.loadSession();
    }

    loadSession() {
        var token = sessionStorage.getItem(this.SESSION_TAG);
        if (token != null) {
            this.setSession(token);
            this.route.navigate(['/menu']);
        }
    }

    setSession(token) {
        var decoded = this.decodeToken(token);
        decoded.token = token;

        this.session.next(decoded);
    }

    saveSession() {
        sessionStorage.setItem(this.SESSION_TAG, this.session.getValue().token);
    }

    getSession() {
        return this.session.getValue();
    }

    close() {
        sessionStorage.removeItem(this.SESSION_TAG);
        this.session.next(null);
        this.route.navigate(['/users/login']);
    }

    async login(login: any) {

        var response = await this.httpClient.post(environment.api + 'users/login', {
            name: login.name, password: login.password
        }).toPromise();

        return response;
    }

    decodeToken(token: string) {
        var decoded: any = jwt_decode(token);
        console.log(decoded)
        return decoded;
    }
}