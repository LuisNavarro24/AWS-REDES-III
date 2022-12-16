import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from 'src/app/_shared/loader/loader.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
    user = {
        id: "",
        name: "",
        type: "",
        password: ""
    }
    constructor(
        private httpClient: HttpClient,
        private router: Router,
        private route: ActivatedRoute,
        private loaderService: LoaderService
    ) { }

    ngOnInit(): void { }

    ionViewWillEnter() {
        this.user = {
            id: "",
            name: "",
            type: "",
            password: ""
        }
        this.user.id = this.route.snapshot.paramMap.get('userId');
        if (this.user.id) {
            this.getUser();
        }
    }

    async getUser() {
        this.loaderService.show();
        this.user = (await this.httpClient.get(environment.api + 'users/' + this.user.id).toPromise()) as any;
        this.loaderService.hide();
    }
    back() {
        this.router.navigate(['/users']);
    }
    cancel() {
        this.router.navigate(['/users']);
    }
    async saveUser() {
        this.loaderService.show();
        try {

            await this.httpClient.post(environment.api + 'users', this.user).toPromise();
            this.router.navigate(['/users']);
        }
        catch (e) {

        }
        this.loaderService.hide();

    }
    isDisabled() {
        return !this.user.name || !this.user.type || !this.user.password;
    }
}
