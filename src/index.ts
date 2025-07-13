export const simplePassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
export const mediumPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
export const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
export interface Phones {
  [key: string]: string;
}
export interface Status {
  success: string|number;
  username: string|number;
  contact: string|number;
  error: string|number;
  format_username: string|number;
  format_contact: string|number;
  format_password: string|number;
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
export interface Result {
  status: SignupStatus;
  message?: string;
  errors?: ErrorMessage[];
}
export type SignupResult = Result;
export interface SignupService<S extends User> {
  signup(user: S): Promise<Result|string|number>;
  verify?(id: string, code: string): Promise<boolean>;
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
    this.verify = this.verify.bind(this);
  }
  signup(user: S): Promise<Result|string|number> {
    return this.http.post<Result|string|number>(this.url, user);
  }
  verify(id: string, code: string, password?: string): Promise<boolean> {
    const s = this.url2 + '/' + id + '/' + code;
    const p = password ? password : '';
    return this.http.post<boolean>(s, { password: p});
  }
}
export const UserRegistrationClient = Client;
export const SignupClient = Client;
export interface StringMap {
  [key: string]: string;
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
export function isEmail(email?: string): boolean {
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
export function formatText(...args: any[]): string {
  let formatted = args[0]
  if (!formatted || formatted === "") {
    return ""
  }
  for (let i = 1; i < args.length; i++) {
    const regexp = new RegExp("\\{" + (i - 1) + "\\}", "gi")
    formatted = formatted.replace(regexp, args[i])
  }
  return formatted
}
export function validate<T extends User>(user: T, r: StringMap, checkUsername: (s1: string) => boolean, checkContact: (s1?: string) => boolean, requiredPassword: boolean, confirmPassword: string, reg?: RegExp, showError?: (m: string, field?: string) => void): boolean|ErrorMessage[] {
  if (showError) {
    if (isEmpty(user.username)) {
      const msg = formatText(r.error_required, r.username);
      showError(msg, 'username');
      return false;
    } else if (checkUsername && !checkUsername(user.username)) {
      const msg = formatText(r.error_username);
      showError(msg, 'username');
      return false;
    }
    if (isEmpty(user.contact)) {
      const msg = formatText(r.error_required, r.contact);
      showError(msg, 'contact');
      return false;
    } else if (checkContact && !checkContact(user.contact)) {
        const msg = formatText(r.error_contact);
        showError(msg, 'contact');
        return false;
    }
    if (requiredPassword) {
      if (isEmpty(user.password)) {
        const msg = formatText(r.error_required, r.password);
        showError(msg, 'password');
        return false;
      } else {
        if (reg && !reg.test(user.password)) {
          const msg = r.error_password_exp;
          showError(msg, 'password');
          return false;
        }
        if (user.password !== confirmPassword) {
          const msg = r.error_confirm_password;
          showError(msg, 'confirmPassword');
          return false;
        }
      }
    }
    return true;
  } else {
    const errs: ErrorMessage[] = [];
    if (isEmpty(user.username)) {
      const msg = formatText(r.error_required, r.username);
      const e = createError('required', 'username', msg);
      errs.push(e);
    } else if (checkUsername) {
      if (!checkUsername(user.username)) {
        const msg = formatText(r.error_username);
        const e = createError('exp', 'username', msg);
        errs.push(e);
      }
    }
    if (isEmpty(user.contact)) {
      const msg = formatText(r.error_required, r.contact);
      const e = createError('required', 'contact', msg);
      errs.push(e);
    } else if (checkContact) {
      if (!checkContact(user.contact)) {
        const msg = formatText(r.error_contact);
        const e = createError('exp', 'contact', msg);
        errs.push(e);
      }
    }
    if (requiredPassword) {
      if (isEmpty(user.password)) {
        const msg = formatText(r.error_required, r.password);
        const e = createError('required', 'password', msg);
        errs.push(e);
      } else {
        if (reg && !reg.test(user.password)) {
          const msg = formatText(r.error_password_exp, r.password);
          const e = createError('exp', 'password', msg);
          errs.push(e);
        }
        if (user.password !== confirmPassword) {
          const msg = r.error_confirm_password;
          const e = createError('equal', 'confirmPassword', msg);
          errs.push(e);
        }
      }
    }
    return errs;
  }
}
export function getMessage(res: string|number, status: Status, r: StringMap): string {
  if (res === status.success) {
    return r.success_sign_up;
  } else if (res === status.username) {
    return r.error_sign_up_username;
  } else if (res === status.contact) {
    return r.error_sign_up_contact;
  } else if (res === status.format_username) {
    return r.error_username;
  } else if (res === status.format_contact) {
    return r.error_contact;
  } else if (res === status.format_password) {
    return r.error_password_exp;
  } else {
    return r.fail_sign_up;
  }
}
export function signup<S extends User> (
  register: (user: S) => Promise<Result|string|number>,
  status: Status,
  user: S, r: StringMap,
  showMessage: (msg: string, field?: string) => void,
  showError: (msg: string, field?: string) => void,
  handleError: (err: any) => void,
  loading?: LoadingService): void {
  if (loading) {
    loading.showLoading();
  }
  register(user).then(res => {
    const s = (typeof res === 'string' || typeof res === 'number' ? res : res.status);
    const msg = getMessage(s, status, r);
    if (s === status.success) {
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
    register: (user: S) => Promise<Result|string|number>,
    status: Status,
    user: S,
    passRequired: boolean,
    confirmPassword: string,
    r: StringMap,
    showMessage: (msg: string, field?: string) => void,
    showError: (msg: string, field?: string) => void,
    hideMessage: (field?: string) => void,
    chkUsername: (s1: string) => boolean,
    chkContact: (s1?: string) => boolean,
    check: (u: S, r2: StringMap, valUsername: (s1: string) => boolean, valContact: (s1?: string) => boolean, requirePass: boolean, confirmPassword: string, reg?: RegExp, showE?: (m: string, field?: string) => void) => boolean|ErrorMessage[],
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
  signup(register, status, user, r, showMessage, showError, handleError, loading);
}
