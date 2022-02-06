export const simplePassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
export const mediumPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
export const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export interface Phones {
  [key: string]: string;
}
// tslint:disable-next-line:class-name
export class resources {
  static phonecodes?: Phones;
  static email = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,4})$/i;
  static phone = /^\d{5,14}$/;
}
export interface User {
  username: string;
  password: string;
  contact?: string;
  /*
  language?: string;
  email?: string;
  phone?: string;
  givenName?: string;
  familyName?: string;
  middleName?: string;
  displayName?: string;
  gender?: string;
  dateOfBirth?: Date;
  */
}
export type SignupInfo = User;
export type Signup = User;
export type UserRegistration = User;
export interface ErrorMessage {
  field: string;
  code: string;
  param?: string|number|Date;
  message?: string;
}
export enum SignupStatus {
  Success = 0,
  UserNameError = 1,
  ContactError = 2,
  Error = 4
}
export interface SignupResult {
  status: SignupStatus;
  message?: string;
  errors?: ErrorMessage[];
}

export interface SignupService<S extends User> {
  signup(user: S): Promise<SignupResult>;
  verifyUser?(id: string, code: string): Promise<boolean>;
  verifyUserAndSavePassword?(id: string, code: string, password: string): Promise<boolean|number>;
}
interface Headers {
  [key: string]: any;
}
export interface HttpRequest {
  get<T>(url: string, options?: {headers?: Headers}): Promise<T>;
  delete<T>(url: string, options?: {headers?: Headers}): Promise<T>;
  post<T>(url: string, obj: any, options?: {headers?: Headers}): Promise<T>;
  put<T>(url: string, obj: any, options?: {headers?: Headers}): Promise<T>;
  patch<T>(url: string, obj: any, options?: {headers?: Headers}): Promise<T>;
}
// tslint:disable-next-line:max-classes-per-file
export class Client<S extends User> implements SignupService<S> {
  constructor(protected http: HttpRequest, protected url: string, protected url2: string) {
    this.signup = this.signup.bind(this);
    this.verifyUser = this.verifyUser.bind(this);
    this.verifyUserAndSavePassword = this.verifyUserAndSavePassword.bind(this);
  }
  signup(signupInfo: S): Promise<SignupResult> {
    return this.http.post<SignupResult>(this.url, signupInfo);
  }
  verifyUser(id: string, code: string): Promise<boolean> {
    const s = this.url2 + '/' + id + '/' + code;
    return this.http.get<boolean>(s);
  }
  verifyUserAndSavePassword(id: string, code: string, password: string): Promise<boolean|number> {
    const s = this.url2 + '/' + id + '/' + code;
    return this.http.post(s, password);
  }
}
export const UserRegistrationClient = Client;
export const SignupClient = Client;
export interface ResourceService {
  resource(): any;
  value(key: string, param?: any): string;
  format(...args: any[]): string;
}
export interface LoadingService {
  showLoading(firstTime?: boolean): void;
  hideLoading(): void;
}
export function isPhone(str: string): boolean {
  if (!str || str.length === 0 || str === '+') {
    return false;
  }
  if (str.charAt(0) !== '+') {
    return resources.phone.test(str);
  } else {
    const phoneNumber = str.substring(1);
    if (!resources.phonecodes) {
      return resources.phone.test(phoneNumber);
    } else {
      if (resources.phone.test(phoneNumber)) {
        for (let degit = 1; degit <= 3; degit++) {
          const countryCode = phoneNumber.substr(0, degit);
          if (countryCode in resources.phonecodes) {
            return true;
          }
        }
        return false;
      } else {
        return false;
      }
    }
  }
}
export function isEmail(email: string): boolean {
  if (!email || email.length === 0) {
    return false;
  }
  return resources.email.test(email);
}
export function isValidUsername(s: string): boolean {
  if (isEmpty(s)) {
    return false;
  }
  if (isEmail(s)) {
    return true;
  }
  if (isPhone(s)) {
    return true;
  }
  const s2 = s + '@gmail.com';
  return isEmail(s2);
}
export function isEmpty(str?: string): boolean {
  return (!str || str === '');
}
export function createError(code: string, field: string, msg: string): ErrorMessage {
  return { code, field, message: msg };
}
export function validate<T extends User>(user: T, r: ResourceService, checkUsername: (s1: string) => boolean, checkContact: (s1?: string) => boolean, requiredPassword: boolean, confirmPassword: string, reg?: RegExp, showError?: (m: string, field?: string) => void): boolean|ErrorMessage[] {
  if (showError) {
    if (isEmpty(user.username)) {
      const msg = r.format(r.value('error_required'), r.value('username'));
      showError(msg, 'username');
      return false;
    } else if (checkUsername && !checkUsername(user.username)) {
      const msg = r.format(r.value('error_username'));
      showError(msg, 'username');
      return false;
    }
    if (isEmpty(user.contact)) {
      const msg = r.format(r.value('error_required'), r.value('contact'));
      showError(msg, 'contact');
      return false;
    } else if (checkContact && !checkContact(user.contact)) {
        const msg = r.format(r.value('error_contact'));
        showError(msg, 'contact');
        return false;
    }
    if (requiredPassword) {
      if (isEmpty(user.password)) {
        const msg = r.format(r.value('error_required'), r.value('password'));
        showError(msg, 'password');
        return false;
      } else {
        if (reg && !reg.test(user.password)) {
          const msg = r.value('error_password_exp');
          showError(msg, 'password');
          return false;
        }
        if (user.password !== confirmPassword) {
          const msg = r.value('error_confirm_password');
          showError(msg, 'confirmPassword');
          return false;
        }
      }
    }
    return true;
  } else {
    const errs: ErrorMessage[] = [];
    if (isEmpty(user.username)) {
      const msg = r.format(r.value('error_required'), r.value('username'));
      const e = createError('required', 'username', msg);
      errs.push(e);
    } else if (checkUsername) {
      if (!checkUsername(user.username)) {
        const msg = r.format(r.value('error_username'));
        const e = createError('exp', 'username', msg);
        errs.push(e);
      }
    }
    if (isEmpty(user.contact)) {
      const msg = r.format(r.value('error_required'), r.value('contact'));
      const e = createError('required', 'contact', msg);
      errs.push(e);
    } else if (checkContact) {
      if (!checkContact(user.contact)) {
        const msg = r.format(r.value('error_contact'));
        const e = createError('exp', 'contact', msg);
        errs.push(e);
      }
    }
    if (requiredPassword) {
      if (isEmpty(user.password)) {
        const msg = r.format(r.value('error_required'), r.value('password'));
        const e = createError('required', 'password', msg);
        errs.push(e);
      } else {
        if (reg && !reg.test(user.password)) {
          const msg = r.format(r.value('error_password_exp'), r.value('password'));
          const e = createError('exp', 'password', msg);
          errs.push(e);
        }
        if (user.password !== confirmPassword) {
          const msg = r.value('error_confirm_password');
          const e = createError('equal', 'confirmPassword', msg);
          errs.push(e);
        }
      }
    }
    return errs;
  }
}
export function getMessage(status: SignupStatus, r: ResourceService): string {
  if (status === SignupStatus.Success) {
    return r.value('success_sign_up');
  } else if (status === SignupStatus.UserNameError) {
    return r.value('error_sign_up_username');
  } else if (status === SignupStatus.ContactError) {
    return r.value('error_sign_up_contact');
  } else {
    return r.value('fail_sign_up');
  }
}
export function signup<S extends User> (
  register: (user: S) => Promise<SignupResult>,
  user: S, r: ResourceService,
  showMessage: (msg: string, field?: string) => void,
  showError: (msg: string, field?: string) => void,
  handleError: (err: any) => void,
  loading?: LoadingService): void {
  if (loading) {
    loading.showLoading();
  }
  register(user).then(res => {
    const msg = getMessage(res.status, r);
    if (res.status === SignupStatus.Success) {
      showMessage(msg);
    } else {
      showError(msg);
    }
    if (loading) {
      loading.hideLoading();
    }
  }).catch(err => {
    handleError(err);
    if (loading) {
      loading.hideLoading();
    }
  });
}
export function validateAndSignup<S extends User> (
    register: (user: S) => Promise<SignupResult>,
    user: S,
    passRequired: boolean,
    confirmPassword: string,
    r: ResourceService,
    showMessage: (msg: string, field?: string) => void,
    showError: (msg: string, field?: string) => void,
    hideMessage: (field?: string) => void,
    chkUsername: (s1: string) => boolean,
    chkContact: (s1?: string) => boolean,
    check: (u: S, r2: ResourceService, valUsername: (s1: string) => boolean, valContact: (s1: string) => boolean, requirePass: boolean, confirmPassword: string, reg?: RegExp, showE?: (m: string, field?: string) => void) => boolean|ErrorMessage[],
    handleError: (err: any) => void,
    reg?: RegExp,
    loading?: LoadingService,
    showCustomError?: (msg: string|ErrorMessage[]) => void) {
  const s = (showCustomError ? undefined : showError);
  const results = check(user, r, chkUsername, chkContact, passRequired, confirmPassword, reg, s);
  if (results === false) {
    return;
  } else if (Array.isArray(results) && results.length > 0) {
    if (showCustomError) {
      showCustomError(results);
    }
    return;
  } else {
    hideMessage();
  }
  signup(register, user, r, showMessage, showError, handleError, loading);
}
