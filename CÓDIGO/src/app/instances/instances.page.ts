import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-moment';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { LoaderService } from '../_shared/loader/loader.service';

@Component({
    selector: 'app-instances',
    templateUrl: 'instances.page.html',
    styleUrls: ['instances.page.scss']
})
export class InstancesPage implements OnInit, OnDestroy {
    instances = [];
    interval = null;
    chart: any;
    constructor(
        private httpClient: HttpClient,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private loaderService: LoaderService
    ) {

    }

    ngOnInit(): void {
        this.init();
        this.interval = setInterval(() => {
            this.getInstances();
        }, 3000);
    }
    ngOnDestroy(): void {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    async init() {
        this.loaderService.show();
        await this.getInstances();
        this.loaderService.hide();
    }

    async getInstances() {
        //this.loaderService.show();
        try {
            this.instances = (await this.httpClient.get(environment.api).toPromise()) as any;
        }
        catch (ex) {

        }
        //this.loaderService.hide();
        this.cdr.detectChanges();
    }

    async start(instance) {
        await this.init();
        await this.httpClient.post(environment.api + "start", {
            instanceId: instance.instanceId
        }).toPromise()
    }

    async stop(instance) {
        await this.init();
        await this.httpClient.post(environment.api + "stop", {
            instanceId: instance.instanceId
        }).toPromise();

    }

    back() {
        this.router.navigate(['/menu'])
    }

    schedules(i) {
        this.router.navigate(['/instance/' + i.instanceId + '/schedules'])
    }

    async downloadExcell(i) {
        this.loaderService.show();
        let res = (await this.httpClient
            .get(environment.api + 'records/' + i.instanceId)
            .toPromise() as []);
        let g = res.map((x: any) => {
            return { x: moment(x.date), y: x.type };
        });
        let records = res
            .map((r: any) => {
                var type = "ACTIVO";
                if (r.type == 1) {
                    type = "ENCENDIDO"
                }
                if (r.type == -1) {
                    type = "APAGADO"
                }
                return [r.date.split("T").join(" "), type];
            });

        const title = 'Reporte Instancia ' + i.name;
        const header = ["Fecha", "Tipo"]


        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet('Reporte');

        // Add new row
        let titleRow = worksheet.addRow([title]);
        // Set font, size and style in title row.
        titleRow.font = { name: 'Arial', family: 4, size: 16, bold: true };
        // Blank Row
        worksheet.addRow([]);
        let headerRow = worksheet.addRow(header);
        headerRow.font = { name: 'Arial', family: 4, size: 12, bold: true };
        worksheet.addRows(records);
        worksheet.columns[0].width = 30;

        Chart.register(...registerables);
        var myChart = new Chart(document.getElementById('MyChart') as any, {
            type: 'line',
            data: {
                labels: [], datasets: [{
                    data: g,
                    showLine: false,
                    label: 'Historial'
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'hour',
                            displayFormats: {
                                hour: 'MM-DD HH:mm'
                            }
                        }
                    }
                }
            }
        });
        setTimeout(() => {
            var image = myChart.toBase64Image();
            let logo = workbook.addImage({
                base64: image,
                extension: 'png',
            });
            worksheet.addImage(logo, 'D3:P28');
            workbook.xlsx.writeBuffer().then((data) => {
                let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                fs.saveAs(blob, 'Reporte.xlsx');
            });
            myChart.destroy();
            this.loaderService.hide();
        }, 500);
        //Add row with current date
        // let subTitleRow = worksheet.addRow(['Fecha : ' + this.datePipe.transform(new Date(), 'medium')]);
    }

}
