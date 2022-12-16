import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoaderService } from '../_shared/loader/loader.service';
import { SessionService } from '../_shared/services/session.service';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss']
})
export class UsersComponent {
    users: any = [];
    session: Observable<any>;
    constructor(
        private httpClient: HttpClient,
        private loaderService: LoaderService,
        private router: Router,
        private sessionService: SessionService
    ) {
        this.session = this.sessionService._session;
        // this.getUsers(); 
    }

    ionViewWillEnter() {
        this.getUsers();
    }

    async getUsers() {
        this.loaderService.show();
        this.users = await this.httpClient.get(environment.api + 'users').toPromise();
        this.loaderService.hide();
    }
    back() {
        this.router.navigate(['/menu']);
    }

    addUser() {
        this.router.navigate(['/user']);
    }

    updateUser(u) {
        this.router.navigate(['/user/' + u.id]);
    }

    async deleteUser(u) {
        this.loaderService.show();
        await this.httpClient.delete(environment.api + 'users/' + u.id).toPromise();
        await this.getUsers();
    }
}
