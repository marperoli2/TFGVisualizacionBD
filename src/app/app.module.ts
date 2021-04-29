import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

//d3 components
import { PartToWholeComponent } from './part-to-whole/part-to-whole.component';
import { NominalComparisonComponent } from './nominal-comparison/nominal-comparison.component';


//toast components

const routes: Routes = [

  { path: 'nominalComparison', component: NominalComparisonComponent },
  { path: 'partToWhole', component: PartToWholeComponent },

]

@NgModule({
  declarations: [
    AppComponent,
    NominalComparisonComponent,
    PartToWholeComponent,
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
