import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CountryList } from './countries.constant';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  /* Public Properties */
  searchForm!: FormGroup;
  lovCountries = CountryList;

  /* Life Cycle Hooks */
  ngOnInit(): void {
    this.buildForm();
  }

  /* Private Methods */
  private buildForm(): void {
    this.searchForm = new FormGroup({
      country: new FormControl(null, Validators.required),
    })
  }
}
