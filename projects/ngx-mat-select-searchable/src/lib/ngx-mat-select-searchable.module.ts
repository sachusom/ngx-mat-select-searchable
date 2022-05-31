import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { BrowserModule } from '@angular/platform-browser';
import { NgxMatSelectSearchableComponent } from './ngx-mat-select-searchable.component';

@NgModule({
  declarations: [
    NgxMatSelectSearchableComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    ScrollingModule
  ],
  exports: [
    NgxMatSelectSearchableComponent
  ]
})
export class NgxMatSelectSearchableModule { }
