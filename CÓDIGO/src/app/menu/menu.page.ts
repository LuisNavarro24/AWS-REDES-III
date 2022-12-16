import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SessionService } from '../_shared/services/session.service';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.page.html',
    styleUrls: ['./menu.page.scss']
})
export class MenuPage implements OnInit {
    session: Observable<any>;
    constructor(
        private router: Router,
        private httpClient: HttpClient,
        private sessionService: SessionService
    ) {
        this.session = this.sessionService._session;
    }

    ngOnInit(): void { }

    goInstances() {
        this.router.navigate(['/instances'])
    }

    goPermissions() {
        this.router.navigate(['/users'])
    }

    goExit() {
        this.router.navigate(['/login'])
    }

    downloadUsers() {
        var url = environment.api + 'users/download';
        const a = document.createElement('a')
        a.href = url
        a.download = url.split('/').pop()
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }
}
