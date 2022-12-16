import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PreloadAllModules, RouteReuseStrategy, RouterModule, Routes } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InstancesPage } from './instances/instances.page';
import { LoginPage } from './login/login.page';
import { MenuPage } from './menu/menu.page';
import { SchedulePage } from './schedules/schedule/schedule.page';
import { SchedulesPage } from './schedules/schedules.page';
import { UserComponent } from './users/user/user.component';
import { UsersComponent } from './users/users.component';
import { LoaderComponent } from './_shared/loader/loader.component';
import { MaterialModules } from './_shared/material.modules';

const routes: Routes = [
  {
    path: 'instances',
    component: InstancesPage
  },
  {
    path: 'instance/:id/schedules',
    component: SchedulesPage
  },
  {
    path: 'instance/:instanceId/schedule',
    component: SchedulePage
  },
  {
    path: 'schedule/:instanceId/schedules/:scheduleId',
    component: SchedulePage
  },
  {
    path: 'login',
    component: LoginPage
  },
  {
    path: 'menu',
    component: MenuPage
  },
  {
    path: 'users',
    component: UsersComponent
  },
  {
    path: 'user',
    component: UserComponent
  },
  {
    path: 'user/:userId',
    component: UserComponent
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];


@NgModule({
  declarations: [UserComponent, UsersComponent, AppComponent, LoaderComponent, LoginPage, InstancesPage, MenuPage, SchedulesPage, SchedulePage],
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
    BrowserModule, IonicModule.forRoot(), HttpClientModule, BrowserAnimationsModule, MaterialModules],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule { }
