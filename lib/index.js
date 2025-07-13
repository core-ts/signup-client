"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simplePassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
exports.mediumPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
exports.strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
var resources = (function () {
  function resources() {
  }
  resources.email = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,4})$/i;
  resources.phone = /^\d{5,14}$/;
  return resources;
}());
exports.resources = resources;
var SignupStatus;
(function (SignupStatus) {
  SignupStatus[SignupStatus["Success"] = 0] = "Success";
  SignupStatus[SignupStatus["UserNameError"] = 1] = "UserNameError";
  SignupStatus[SignupStatus["ContactError"] = 2] = "ContactError";
  SignupStatus[SignupStatus["Error"] = 4] = "Error";
})(SignupStatus = exports.SignupStatus || (exports.SignupStatus = {}));
var Client = (function () {
  function Client(http, url, url2) {
    this.http = http;
    this.url = url;
    this.url2 = url2;
    this.signup = this.signup.bind(this);
    this.verify = this.verify.bind(this);
  }
  Client.prototype.signup = function (user) {
    return this.http.post(this.url, user);
  };
  Client.prototype.verify = function (id, code, password) {
    var s = this.url2 + '/' + id + '/' + code;
    var p = password ? password : '';
    return this.http.post(s, { password: p });
  };
  return Client;
}());
exports.Client = Client;
exports.UserRegistrationClient = Client;
exports.SignupClient = Client;
function isPhone(str) {
  if (!str || str.length === 0 || str === '+') {
    return false;
  }
  if (str.charAt(0) !== '+') {
    return resources.phone.test(str);
  }
  else {
    var phoneNumber = str.substring(1);
    if (!resources.phonecodes) {
      return resources.phone.test(phoneNumber);
    }
    else {
      if (resources.phone.test(phoneNumber)) {
        for (var degit = 1; degit <= 3; degit++) {
          var countryCode = phoneNumber.substr(0, degit);
          if (countryCode in resources.phonecodes) {
            return true;
          }
        }
        return false;
      }
      else {
        return false;
      }
    }
  }
}
exports.isPhone = isPhone;
function isEmail(email) {
  if (!email || email.length === 0) {
    return false;
  }
  return resources.email.test(email);
}
exports.isEmail = isEmail;
function isValidUsername(s) {
  if (isEmpty(s)) {
    return false;
  }
  if (isEmail(s)) {
    return true;
  }
  if (isPhone(s)) {
    return true;
  }
  var s2 = s + '@gmail.com';
  return isEmail(s2);
}
exports.isValidUsername = isValidUsername;
function isEmpty(str) {
  return (!str || str === '');
}
exports.isEmpty = isEmpty;
function createError(code, field, msg) {
  return { code: code, field: field, message: msg };
}
exports.createError = createError;
function formatText() {
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  var formatted = args[0];
  if (!formatted || formatted === "") {
    return "";
  }
  for (var i = 1; i < args.length; i++) {
    var regexp = new RegExp("\\{" + (i - 1) + "\\}", "gi");
    formatted = formatted.replace(regexp, args[i]);
  }
  return formatted;
}
exports.formatText = formatText;
function validate(user, r, checkUsername, checkContact, requiredPassword, confirmPassword, reg, showError) {
  if (showError) {
    if (isEmpty(user.username)) {
      var msg = formatText(r.error_required, r.username);
      showError(msg, 'username');
      return false;
    }
    else if (checkUsername && !checkUsername(user.username)) {
      var msg = formatText(r.error_username);
      showError(msg, 'username');
      return false;
    }
    if (isEmpty(user.contact)) {
      var msg = formatText(r.error_required, r.contact);
      showError(msg, 'contact');
      return false;
    }
    else if (checkContact && !checkContact(user.contact)) {
      var msg = formatText(r.error_contact);
      showError(msg, 'contact');
      return false;
    }
    if (requiredPassword) {
      if (isEmpty(user.password)) {
        var msg = formatText(r.error_required, r.password);
        showError(msg, 'password');
        return false;
      }
      else {
        if (reg && !reg.test(user.password)) {
          var msg = r.error_password_exp;
          showError(msg, 'password');
          return false;
        }
        if (user.password !== confirmPassword) {
          var msg = r.error_confirm_password;
          showError(msg, 'confirmPassword');
          return false;
        }
      }
    }
    return true;
  }
  else {
    var errs = [];
    if (isEmpty(user.username)) {
      var msg = formatText(r.error_required, r.username);
      var e = createError('required', 'username', msg);
      errs.push(e);
    }
    else if (checkUsername) {
      if (!checkUsername(user.username)) {
        var msg = formatText(r.error_username);
        var e = createError('exp', 'username', msg);
        errs.push(e);
      }
    }
    if (isEmpty(user.contact)) {
      var msg = formatText(r.error_required, r.contact);
      var e = createError('required', 'contact', msg);
      errs.push(e);
    }
    else if (checkContact) {
      if (!checkContact(user.contact)) {
        var msg = formatText(r.error_contact);
        var e = createError('exp', 'contact', msg);
        errs.push(e);
      }
    }
    if (requiredPassword) {
      if (isEmpty(user.password)) {
        var msg = formatText(r.error_required, r.password);
        var e = createError('required', 'password', msg);
        errs.push(e);
      }
      else {
        if (reg && !reg.test(user.password)) {
          var msg = formatText(r.error_password_exp, r.password);
          var e = createError('exp', 'password', msg);
          errs.push(e);
        }
        if (user.password !== confirmPassword) {
          var msg = r.error_confirm_password;
          var e = createError('equal', 'confirmPassword', msg);
          errs.push(e);
        }
      }
    }
    return errs;
  }
}
exports.validate = validate;
function getMessage(res, status, r) {
  if (res === status.success) {
    return r.success_sign_up;
  }
  else if (res === status.username) {
    return r.error_sign_up_username;
  }
  else if (res === status.contact) {
    return r.error_sign_up_contact;
  }
  else if (res === status.format_username) {
    return r.error_username;
  }
  else if (res === status.format_contact) {
    return r.error_contact;
  }
  else if (res === status.format_password) {
    return r.error_password_exp;
  }
  else {
    return r.fail_sign_up;
  }
}
exports.getMessage = getMessage;
function signup(register, status, user, r, showMessage, showError, handleError, loading) {
  if (loading) {
    loading.showLoading();
  }
  register(user).then(function (res) {
    var s = (typeof res === 'string' || typeof res === 'number' ? res : res.status);
    var msg = getMessage(s, status, r);
    if (s === status.success) {
      showMessage(msg);
    }
    else {
      showError(msg);
    }
    if (loading) {
      loading.hideLoading();
    }
  }).catch(function (err) {
    handleError(err);
    if (loading) {
      loading.hideLoading();
    }
  });
}
exports.signup = signup;
function validateAndSignup(register, status, user, passRequired, confirmPassword, r, showMessage, showError, hideMessage, chkUsername, chkContact, check, handleError, reg, loading, showCustomError) {
  var s = (showCustomError ? undefined : showError);
  var results = check(user, r, chkUsername, chkContact, passRequired, confirmPassword, reg, s);
  if (results === false) {
    return;
  }
  else if (Array.isArray(results) && results.length > 0) {
    if (showCustomError) {
      showCustomError(results);
    }
    return;
  }
  else {
    hideMessage();
  }
  signup(register, status, user, r, showMessage, showError, handleError, loading);
}
exports.validateAndSignup = validateAndSignup;
