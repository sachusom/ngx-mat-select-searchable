import { FocusMonitor } from '@angular/cdk/a11y';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  Component, ElementRef, EventEmitter,
  HostBinding, Input, OnChanges, OnDestroy, OnInit, Optional,
  Output, Self, SimpleChanges, ViewChild
} from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NgControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';

export class CustomErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl): boolean {
    return control.dirty && control.invalid;
  }
}

@Component({
  selector: 'ngx-mat-select-searchable',
  templateUrl: './ngx-mat-select-searchable.component.html',
  styleUrls: ['./ngx-mat-select-searchable.component.scss'],
  providers: [{
    provide: MatFormFieldControl,
    useExisting: NgxMatSelectSearchableComponent
  },
  {
    provide: ErrorStateMatcher,
    useClass: CustomErrorMatcher,
  }]
})
export class NgxMatSelectSearchableComponent implements OnInit, OnChanges, OnDestroy, MatFormFieldControl<any>, ControlValueAccessor {

  @Input() set value(value: any) {
    this.searchForm?.controls.selectedItem.patchValue(value);
    this.stateChanges.next();
    this.setSelectedValue(value);
  }
  get value(): any {
    return this.searchForm?.controls.selectedItem.value;
  }

  @Input() set placeholder(value: string) {
    this.placeHolder = value;
    this.stateChanges.next();
  }
  get placeholder(): string {
    return this.placeHolder;
  }

  @Input() get disabled(): boolean {
    return this.isDisabled;
  }
  set disabled(disabled: boolean) {
    this.isDisabled = disabled;
    this.setDisable();
    this.stateChanges.next();
  }

  get empty(): boolean {
    return !this.value;
  }

  get errorState(): any {
    const matcher = this.errorStateMatcher || this.errorMatcher;
    return this.errorMatcher.isErrorState(this.ngControl.control as FormControl, null);
  }

  @HostBinding('class.floated') get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
  }

  /* Constructor */
  constructor(
    private focusMonitor: FocusMonitor,
    private errorMatcher: ErrorStateMatcher,
    @Optional() @Self() public ngControl: NgControl,
  ) {
    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }

    this.buildForm();
  }
  static nextId = 0;

  @ViewChild(CdkVirtualScrollViewport, { static: true }) viewPort!: CdkVirtualScrollViewport;

  @ViewChild('searchInput') searchInput!: ElementRef;
  private placeHolder: any;
  private isDisabled = false;

  searchForm!: FormGroup;
  stateChanges = new Subject<void>();

  @ViewChild(MatSelect, { read: ElementRef, static: true }) matSelect!: ElementRef;

  /* I/O Properties */
  @Input() list: any[] = [];
  @Input() displayMember = 'text';
  @Input() valueMember = 'value';
  @Input() showClearText = false;
  @Input() lazyLoad = false;
  @Input() showAvatar = false;
  @Output() readonly selectionChange = new EventEmitter<any>();

  @Input() required!: boolean;
  @Input() errorStateMatcher!: ErrorStateMatcher;

  focused!: boolean;
  controlType = 'sxp-searchable-dropdown-custom';
  autofilled = false;
  orderedList: any[] = [];
  filteredList: any[] = [];
  itemTrigger!: string;

  @HostBinding() id = `sxp-searchable-dropdown-custom-${NgxMatSelectSearchableComponent.nextId++}`;
  @HostBinding('attr.aria-describedBy') describedBy = '';

  onChange!: (value: any) => void;
  onTouch!: (value: any) => void;

  /* Life Cycle Hooks */
  ngOnInit(): void {
    this.focusMonitor.monitor(this.matSelect).subscribe((focused) => {
      this.focused = !this.disabled && !!focused;
      this.stateChanges.next();
    });
    this.focusMonitor.monitor(this.matSelect).pipe(take(1)).subscribe(() => {
      this.onTouch(null);
    });
    this.searchForm.controls.selectedItem.valueChanges.subscribe((value) => {
      this.onChange(value);
      const item = this.orderedList?.find(x => x[this.valueMember] === value);
      this.selectionChange.emit(item);
    });
    this.searchForm.controls.searchText.valueChanges.subscribe((value) => {
      this.filterList(value);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.list && changes.list.currentValue) {
      this.presetList(changes.list.currentValue);
      this.setSelectedValue(this.searchForm?.controls?.selectedItem?.value);
    }
  }

  ngOnDestroy(): void {
    this.focusMonitor.stopMonitoring(this.matSelect);
    this.stateChanges.complete();
  }

  /* Public Methods */
  setDescribedByIds(ids: string[]): void {
    this.describedBy = ids.join('');
  }

  onContainerClick(event: MouseEvent): void {
    if (!this.disabled) {
      // this.focusMonitor.focusVia(this.matSelect, 'program');
    }
  }

  writeValue(obj: any): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.searchForm.disable();
    }
    else {
      this.searchForm.enable();
    }

    this.stateChanges.next();
  }

  openChange(event: any): void {
    if (event) {
      this.viewPort.scrollToIndex(0);
      this.viewPort.checkViewportSize();
      this.searchInput.nativeElement.focus();
    } else {
      this.viewPort.scrollToIndex(0);
      this.viewPort.checkViewportSize();
      this.searchForm?.controls?.searchText.setValue(null);
    }
  }

  onSelectionChange(event: any): void {
    if (!event.isUserInput) {
      return;
    }
    this.setSelectedValue(event.source.value);
  }

  clearSearch(): void {
    this.searchForm?.controls?.searchText.setValue(null);
  }

  viewportHeight(): number {
    const viewMaxHeight = 207;
    const itemHeight = 42;
    const contentLength = this.filteredList?.length * 42;
    if (contentLength > viewMaxHeight) {
      return viewMaxHeight;
    } else if (contentLength === 0) {
      return itemHeight;
    } else {
      return contentLength;
    }
  }

  /* Private Methods */
  private buildForm(): void {
    this.searchForm = new FormGroup({
      selectedItem: new FormControl(null),
      searchText: new FormControl(null),
    });
  }

  private setDisable(): void {
    if (this.disabled && this.searchForm) {
      this.searchForm.disable();
    }
    else if (this.searchForm) {
      this.searchForm.enable();
    }
  }

  private presetList(list: any[]): void {
    this.orderedList = list;
    this.filteredList = list;
  }

  private filterList(searchText: any): void {
    if (searchText) {
      this.filteredList = this.orderedList.filter((x) => x[this.displayMember].toLowerCase().includes(searchText.toLowerCase()));
    } else if (this.list || this.filteredList) {
      this.filteredList = this.orderedList && this.orderedList.length > 0 ? this.orderedList : this.list;
    } else {
      this.filteredList = [];
    }
  }

  private setSelectedValue(item: any): void {
    if (this.list && this.list.length > 0 && item) {
      this.orderedList = [...this.list];
      const idx = this.orderedList?.findIndex((x) => x[this.valueMember] === item);
      if (idx > -1) {
        const selectedItem = this.orderedList[idx];
        this.orderedList.splice(idx, 1);
        this.orderedList.unshift(selectedItem);

        this.filteredList = [...this.orderedList];
        this.itemTrigger = selectedItem[this.displayMember];
      }
    }
  }
}
