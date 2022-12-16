import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-schdule',
    templateUrl: './schedule.page.html',
    styleUrls: ['./schedule.page.scss']
})
export class SchedulePage implements OnInit {


    schedule: any = {
        scheduleId: "",
        instanceId: "",
        cron: "*/1 * * * *",
        type: 'false',
        name: "Tarea",
        time: "20:00",
        days: {}
    };
    constructor(
        private router: Router,
        private httpClient: HttpClient,
        private route: ActivatedRoute
    ) {

    }
    ionViewWillEnter() {
        this.schedule.instanceId = this.route.snapshot.paramMap.get('instanceId');
        this.schedule.scheduleId = this.route.snapshot.paramMap.get('scheduleId');
    }
    ngOnInit(): void { }



    cancel() {
        this.router.navigate(['/instance/' + this.schedule.instanceId + '/schedules'])
    }

    back() {
        this.router.navigate(['/instance/' + this.schedule.instanceId + '/schedules'])
    }

    async save() {
        var schedule: any = JSON.parse(JSON.stringify(this.schedule));
        var days: any = [];
        var keys = Object.keys(schedule.days).forEach(k => {
            if (schedule.days[k]) {
                days.push(k);
            }
        });
        var days = days.length > 0 ? days.join(',') : '*';
        schedule.cron = "0 " + schedule.time.split(":")[1] + " " + schedule.time.split(":")[0] + " * * " + days;
        schedule.type = schedule.type == 'false' ? false : true;

        await this.httpClient.post(environment.api + 'schedules', schedule).toPromise();
        this.router.navigate(['instance/' + schedule.instanceId + '/schedules'])
    }
}
