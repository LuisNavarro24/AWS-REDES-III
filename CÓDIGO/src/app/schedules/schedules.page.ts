import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { LoaderService } from '../_shared/loader/loader.service';

@Component({
    selector: 'app-schdules',
    templateUrl: './schedules.page.html',
    styleUrls: ['./schedules.page.scss']
})
export class SchedulesPage {
    instanceId: string = "";
    tasks: any = [];
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private httpClient: HttpClient,
        private loaderService: LoaderService
    ) {

    }

    ionViewWillEnter() {
        this.instanceId = this.route.snapshot.paramMap.get('id');
        this.loadTasks()
    }
    ngOnInit(): void {

    }

    back() {
        this.router.navigate(['/instances'])
    }

    async loadTasks() {
        this.loaderService.show();
        try {
            var days = {
                "SUN": "Domingo",
                "MON": "Lunes",
                "TUE": "Martes",
                "WED": "Miercoles",
                "THU": "Jueves",
                "FRI": "Viernes",
                "SAT": "Sabado"
            }
            this.tasks = (await this.httpClient.get(environment.api + 'schedules/' + this.instanceId).toPromise())['schedules'];
            this.tasks.forEach(t => {
                var splitted = t.cron.split(" ");
                t.minute = splitted[1]
                t.hour = splitted[2];
                t.days = splitted[5].split(",").map(d => days[d]).join(",");

            });
        }
        catch (ex) { }
        finally {

            this.loaderService.hide();
        }
    }

    create() {
        this.router.navigate(['/instance/' + this.instanceId + '/schedule'])
    }

    async delete(t) {

        await (this.httpClient.delete(environment.api + 'schedules/' + t.scheduleId).toPromise());
        await this.loadTasks();
    }

    async update(t) {

    }
}
