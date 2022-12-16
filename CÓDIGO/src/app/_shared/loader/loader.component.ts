import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LoaderService } from './loader.service';

@Component({
    selector: 'app-loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {
    state: Observable<boolean>
    constructor(
        private loaderService: LoaderService
    ) {
        this.state = this.loaderService.state;
    }

    ngOnInit(): void { }
}
