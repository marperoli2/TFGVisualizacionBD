import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';

import { PartToWholeComponent } from './part-to-whole/part-to-whole.component';
import { NominalComparisonComponent } from './nominal-comparison/nominal-comparison.component';
import { CorrelationComponent } from './correlation/correlation.component';
import { DistributionComponent } from './distribution/distribution.component';
import { TimeSeriesComponent } from './time-series/time-series.component';
import { DeviationComponent } from './deviation/deviation.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [

  { path: 'nominalComparison', component: NominalComparisonComponent },
  { path: 'partToWhole', component: PartToWholeComponent },
  { path: 'correlation', component: CorrelationComponent },
  { path: 'distribution', component: DistributionComponent },
  { path: 'timeSeries', component: TimeSeriesComponent },
  { path: 'deviation', component: DeviationComponent },
  { path: '', component: HomeComponent },

]

@NgModule({
  declarations: [
    AppComponent,
    NominalComparisonComponent,
    PartToWholeComponent,
    CorrelationComponent,
    DistributionComponent,
    TimeSeriesComponent,
    DeviationComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot(routes),
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
