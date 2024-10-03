import { JsonPipe, NgClass, NgIf } from '@angular/common';
import { Component, inject, input, OnInit, output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TextInputComponent } from '../_forms/text-input/text-input.component';
import { AccountService } from '../_services/account.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, JsonPipe, NgClass, NgIf, TextInputComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  private accountService = inject(AccountService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  cancelRegister = output<boolean>();
  registerForm: FormGroup = new FormGroup({});
  maxDate = new Date();
  validationErrors: string[] | undefined;

  ngOnInit(): void {
    this.initializeForm();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
  }

  initializeForm() {
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(12),
        ],
      ],
      confirmPassword: [
        '',
        [Validators.required, this.matchValues('password')],
      ],
      gender: ['male'],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', [Validators.required, this.isAnAdult()]],
      city: ['', Validators.required],
      country: ['', Validators.required],
    });
    this.registerForm.controls['password'].valueChanges.subscribe({
      next: () => {
        this.registerForm.controls['confirmPassword'].updateValueAndValidity();
      },
    });
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control.value === control.parent?.get(matchTo)?.value
        ? null
        : { isMatching: true };
    };
  }

  isAnAdult(): ValidatorFn {
    return (control: AbstractControl) => {
      const enteredDate = new Date(control.value);
      const today = new Date();
      const age = today.getFullYear() - enteredDate.getFullYear();
      const monthDifference = today.getMonth() - enteredDate.getMonth();
      const dayDifference = today.getDay() - enteredDate.getDay();

      if (
        age >= 18 ||
        (age === 18 &&
          (monthDifference > 0 ||
            (monthDifference === 0 && dayDifference >= 0)))
      ) {
        return null;
      }

      return { isNotAnAdult: true };
    };
  }

  isAnInvalidInput(formName: string): boolean {
    if (
      this.registerForm.get(formName)?.errors &&
      this.registerForm.get(formName)?.touched
    ) {
      return true;
    } else {
      return false;
    }
  }

  register() {
    console.log(this.registerForm.value);

    if (this.registerForm.invalid) {
      return;
    }

    this.accountService.register(this.registerForm.value).subscribe({
      next: () => this.router.navigateByUrl('/members'),
      error: (error) => {
        console.log(error);
        this.validationErrors = error;
      },
    });
  }

  cancel() {
    this.cancelRegister.emit(false);
  }
}
