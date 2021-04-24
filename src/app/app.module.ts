import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

//d3 components
import { NominalComparisonComponent } from './d3/nominal-comparison/nominal-comparison.component';
import { NominalComparisonToastComponent } from './toast/nominal-comparison-toast/nominal-comparison-toast.component';
import { NominalComparisonChartsjsComponent } from './chartsjs/nominal-comparison-chartsjs/nominal-comparison-chartsjs.component';

//toast components

const routes: Routes = [

  { path: 'd3/nominalComparison', component: NominalComparisonComponent },
  { path: 'toast/nominalComparison', component: NominalComparisonToastComponent },
  { path: 'chartsjs/nominalComparison', component: NominalComparisonChartsjsComponent },



]

@NgModule({
  declarations: [
    AppComponent,
    NominalComparisonComponent,
    NominalComparisonToastComponent,
    NominalComparisonChartsjsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot(routes),

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
