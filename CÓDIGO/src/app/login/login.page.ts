import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoaderService } from '../_shared/loader/loader.service';
import { SessionService } from '../_shared/services/session.service';
import { UserService } from '../_shared/services/user.service';

@Component({
    selector: 'app-login',
    templateUrl: 'login.page.html',
    styleUrls: ['login.page.scss']
})
export class LoginPage {
    error: string = ""
    credential: any = {
        name: "",
        password: ""
    }
    constructor(
        private httpClient: HttpClient,
        private cdr: ChangeDetectorRef,
        private loaderService: LoaderService,
        private userService: UserService,
        private router: Router,
        private sessionService: SessionService
    ) {

    }

    async login() {
        this.loaderService.show();
        try {
            let u: any = await this.sessionService.login(this.credential);
            this.sessionService.setSession(u.token);
            this.sessionService.saveSession();
            this.error = "";
            this.router.navigate(['/menu'])
        }
        catch (ex) {
            this.error = ex.error.mensaje
            setTimeout(() => {
                this.error = "";
            }, 3000);
        }
        this.loaderService.hide();
    }
}
