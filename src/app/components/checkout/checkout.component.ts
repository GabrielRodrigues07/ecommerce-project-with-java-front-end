import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Luv2ShopFormService} from "../../services/luv2-shop-form.service";
import {Country} from "../../common/country";
import {State} from "../../common/state";
import {Luv2ShopValidators} from "../../validators/luv2-shop-validators";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCartYears: number[] = [];
  creditCartMonths: number[] = [];

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(private formBuilder: FormBuilder,
              private luv2ShopFormService: Luv2ShopFormService) {
    this.checkoutFormGroup = formBuilder.group({
      title: formBuilder.control('initial value', Validators.required)
    });
  }

  ngOnInit(): void {

    this.checkoutFormGroup = this.formBuilder.group({

      customer: this.formBuilder.group({
        firstName: new FormControl('', [
          Validators.required,
          Validators.minLength(3),
          Luv2ShopValidators.notOnlyWhitespace
        ]),
        lastName: new FormControl('', [
          Validators.required,
          Validators.minLength(3),
          Luv2ShopValidators.notOnlyWhitespace
        ]),
        email: new FormControl('', [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$') // works for anuvagmail.com
        ])
      }),

      shippingAddress: this.formBuilder.group({
        country: new FormControl('', [Validators.required]),
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(3),
          Luv2ShopValidators.notOnlyWhitespace
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(3),
          Luv2ShopValidators.notOnlyWhitespace
        ]),
        state: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.minLength(3),
          Luv2ShopValidators.notOnlyWhitespace
        ])
      }),

      billingAddress: this.formBuilder.group({
        country: new FormControl('', [Validators.required]),
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(3),
          Luv2ShopValidators.notOnlyWhitespace
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(3),
          Luv2ShopValidators.notOnlyWhitespace
        ]),
        state: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.minLength(3),
          Luv2ShopValidators.notOnlyWhitespace
        ])
      }),

      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [
          Validators.required,
          Validators.minLength(3),
          Luv2ShopValidators.notOnlyWhitespace
        ]),
        cardNumber: new FormControl('', [
          Validators.required,
          Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [
          Validators.required,
          Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
      })
    });

    this.checkoutFormGroup.reset({title: 'new value'});

    // populate credit cart months
    const startMonth: number = new Date().getMonth();
    console.log("startMonth: " + startMonth);

    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved credit cart months: " + JSON.stringify(data));
        this.creditCartMonths = data;
      }
    );

    // populate credit cart years

    this.luv2ShopFormService.getCreditCardYears().subscribe(
      data => {
        console.log("Retrieved credit cart years: " + JSON.stringify(data));
        this.creditCartYears = data;
      }
    );

    // populate countries
    this.luv2ShopFormService.getCountries().subscribe(
      data => {
        console.log("Retrieved countries: " + JSON.stringify(data));
        this.countries = data;
      }
    );
  }

  onSubmit() {
    console.log("Handling the submit button");
    console.log(this.checkoutFormGroup.get('customer')?.value);

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
    }

    console.log("CheckoutFormGroup is valid: " + this.checkoutFormGroup.valid);
  }

  copyShippingAddressToBillingAddress(event: Event) {
    const isChecked = (<HTMLInputElement>event.target).checked;

    if (isChecked) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      this.billingAddressStates = this.shippingAddressStates;

    }else {
      this.checkoutFormGroup.controls['billingAddress'].reset();

      this.billingAddressStates = [];
    }
  }

  handleMonthsAndYears() {

    const creditCardFormGroup = this.checkoutFormGroup.get("creditCard");
    let creditCard = creditCardFormGroup?.value;

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCard.expirationYear);

    // if current year equals the selected year, then start with the current month

    let startMonth: number;

    if (currentYear == selectedYear) {
      startMonth = new Date().getMonth() + 1;
    }
    else {
      startMonth = 1;
    }

    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved credit cart months: " + JSON.stringify(data));
        this.creditCartMonths = data;
      }
    )
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);

    this.luv2ShopFormService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        } else {
          this.billingAddressStates = data;
        }
        // select first item by default
        formGroup?.get('state')?.setValue(data[0]);
      }
    );
  }

  get firstName() {
    return this.checkoutFormGroup.get('customer.firstName');
  }

  get lastName() {
    return this.checkoutFormGroup.get('customer.lastName');
  }

  get email() {
    return this.checkoutFormGroup.get('customer.email');
  }

  get shippingAddressStreet() {
    return this.checkoutFormGroup.get('shippingAddress.street');
  }

  get shippingAddressCity() {
    return this.checkoutFormGroup.get('shippingAddress.city');
  }

  get shippingAddressState() {
    return this.checkoutFormGroup.get('shippingAddress.state');
  }

  get shippingAddressZipCode() {
    return this.checkoutFormGroup.get('shippingAddress.zipCode');
  }

  get shippingAddressCountry() {
    return this.checkoutFormGroup.get('shippingAddress.country');
  }

  get billingAddressStreet() {
    return this.checkoutFormGroup.get('billingAddress.street');
  }

  get billingAddressCity() {
    return this.checkoutFormGroup.get('billingAddress.city');
  }

  get billingAddressState() {
    return this.checkoutFormGroup.get('billingAddress.state');
  }

  get billingAddressZipCode() {
    return this.checkoutFormGroup.get('billingAddress.zipCode');
  }

  get billingAddressCountry() {
    return this.checkoutFormGroup.get('billingAddress.country');
  }

  get creditCardType() {
    return this.checkoutFormGroup.get('creditCard.cardType');
  }

  get creditCardNameOnCard() {
    return this.checkoutFormGroup.get('creditCard.nameOnCard');
  }

  get creditCardNumber() {
    return this.checkoutFormGroup.get('creditCard.cardNumber');
  }

  get creditCardSecurityCode() {
    return this.checkoutFormGroup.get('creditCard.securityCode');
  }

}
