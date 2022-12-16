import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from "@angular/material/toolbar";

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from "@angular/material/select";
import { MatTableModule } from '@angular/material/table';


@NgModule({
    imports: [
        MatSelectModule,
        MatToolbarModule,
        MatCardModule,
        MatButtonModule, MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        FormsModule, MatIconModule, MatRadioModule, MatCheckboxModule,
        MatTableModule
    ],
    exports: [
        MatSelectModule,
        MatTableModule,
        MatToolbarModule,
        MatCardModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        FormsModule,
        MatIconModule, MatRadioModule, MatCheckboxModule
    ]
})
export class MaterialModules { }