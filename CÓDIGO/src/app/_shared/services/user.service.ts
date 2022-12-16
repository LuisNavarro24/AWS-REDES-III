import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(
        private httpClient: HttpClient
    ) {

    }

    login(login): Promise<any> {
        return this.httpClient.post(environment.api + 'users/login', login).toPromise();
    }
}