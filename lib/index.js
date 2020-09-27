"use strict";
var __awaiter=(this && this.__awaiter) || function(thisArg, _arguments, P, generator){
  function adopt(value){ return value instanceof P ? value : new P(function(resolve){ resolve(value); }); }
  return new (P || (P=Promise))(function(resolve, reject){
    function fulfilled(value){ try { step(generator.next(value)); } catch (e){ reject(e); } }
    function rejected(value){ try { step(generator["throw"](value)); } catch (e){ reject(e); } }
    function step(result){ result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator=generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator=(this && this.__generator) || function(thisArg, body){
  var _={ label: 0, sent: function(){ if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
  return g={ next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol==="function" && (g[Symbol.iterator]=function(){ return this; }), g;
  function verb(n){ return function(v){ return step([n, v]); }; }
  function step(op){
    if (f) throw new TypeError("Generator is already executing.");
    while (_) try {
      if (f=1, y && (t=op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t=y["return"]) && t.call(y), 0) : y.next) && !(t=t.call(y, op[1])).done) return t;
      if (y=0, t) op=[op[0] & 2, t.value];
      switch (op[0]){
        case 0: case 1: t=op; break;
        case 4: _.label++; return { value: op[1], done: false };
        case 5: _.label++; y=op[1]; op=[0]; continue;
        case 7: op=_.ops.pop(); _.trys.pop(); continue;
        default:
          if (!(t=_.trys, t=t.length > 0 && t[t.length - 1]) && (op[0]===6 || op[0]===2)){ _=0; continue; }
          if (op[0]===3 && (!t || (op[1] > t[0] && op[1] < t[3]))){ _.label=op[1]; break; }
          if (op[0]===6 && _.label < t[1]){ _.label=t[1]; t=op; break; }
          if (t && _.label < t[2]){ _.label=t[2]; _.ops.push(op); break; }
          if (t[2]) _.ops.pop();
          _.trys.pop(); continue;
      }
      op=body.call(thisArg, _);
    } catch (e){ op=[6, e]; y=0; } finally { f=t=0; }
    if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
  }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.simplePassword=/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
exports.mediumPassword=/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
exports.strongPassword=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
var resources=(function(){
  function resources(){
  }
  resources.phonecodes=null;
  resources.email=/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,4})$/i;
  resources.phone=/^\d{5,14}$/;
  return resources;
}());
exports.resources=resources;
var SignupStatus;
(function(SignupStatus){
  SignupStatus[SignupStatus["Success"]=0]="Success";
  SignupStatus[SignupStatus["UserNameError"]=1]="UserNameError";
  SignupStatus[SignupStatus["ContactError"]=2]="ContactError";
  SignupStatus[SignupStatus["Error"]=4]="Error";
})(SignupStatus=exports.SignupStatus || (exports.SignupStatus={}));
var SignupClient=(function(){
  function SignupClient(http, url, url2){
    this.http=http;
    this.url=url;
    this.url2=url2;
    this.signup=this.signup.bind(this);
    this.verifyUser=this.verifyUser.bind(this);
    this.verifyUserAndSavePassword=this.verifyUserAndSavePassword.bind(this);
  }
  SignupClient.prototype.signup=function(signupInfo){
    return this.http.post(this.url, signupInfo);
  };
  SignupClient.prototype.verifyUser=function(id, code){
    var s=this.url2 + '/' + id + '/' + code;
    return this.http.get(s);
  };
  SignupClient.prototype.verifyUserAndSavePassword=function(id, code, password){
    var s=this.url2 + '/' + id + '/' + code;
    return this.http.post(s, password);
  };
  return SignupClient;
}());
exports.SignupClient=SignupClient;
function isPhone(str){
  if (!str || str.length===0 || str==='+'){
    return false;
  }
  if (str.charAt(0) !== '+'){
    return resources.phone.test(str);
  }
  else {
    var phoneNumber=str.substring(1);
    if (!resources.phonecodes){
      return resources.phone.test(phoneNumber);
    }
    else {
      if (resources.phone.test(phoneNumber)){
        for (var degit=1; degit <= 3; degit++){
          var countryCode=phoneNumber.substr(0, degit);
          if (countryCode in resources.phonecodes){
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
exports.isPhone=isPhone;
function isEmail(email){
  if (!email || email.length===0){
    return false;
  }
  return resources.email.test(email);
}
exports.isEmail=isEmail;
function isValidUsername(s){
  if (isEmpty(s)){
    return false;
  }
  if (isEmail(s)){
    return true;
  }
  if (isPhone(s)){
    return true;
  }
  var s2=s + '@gmail.com';
  return isEmail(s2);
}
exports.isValidUsername=isValidUsername;
function isEmpty(str){
  return (!str || str==='');
}
exports.isEmpty=isEmpty;
function createError(code, field, msg){
  return { code: code, field: field, message: msg };
}
exports.createError=createError;
function validate(user, r, checkUsername, checkContact, requiredPassword, confirmPassword, reg, showError){
  if (showError){
    if (isEmpty(user.username)){
      var msg=r.format(r.value('error_required'), r.value('username'));
      showError(msg, 'username');
      return false;
    }
    else if (checkUsername && !checkUsername(user.username)){
      var msg=r.format(r.value('error_username'));
      showError(msg, 'username');
      return false;
    }
    if (isEmpty(user.contact)){
      var msg=r.format(r.value('error_required'), r.value('contact'));
      showError(msg, 'contact');
      return false;
    }
    else if (checkContact && !checkContact(user.contact)){
      var msg=r.format(r.value('error_contact'));
      showError(msg, 'contact');
      return false;
    }
    if (requiredPassword){
      if (isEmpty(user.password)){
        var msg=r.format(r.value('error_required'), r.value('password'));
        showError(msg, 'password');
        return false;
      }
      else {
        if (reg && !reg.test(user.password)){
          var msg=r.value('error_password_exp');
          showError(msg, 'password');
          return false;
        }
        if (user.password !== confirmPassword){
          var msg=r.value('error_confirm_password');
          showError(msg, 'confirmPassword');
          return false;
        }
      }
    }
    return true;
  }
  else {
    var errs=[];
    if (isEmpty(user.username)){
      var msg=r.format(r.value('error_required'), r.value('username'));
      var e=createError('required', 'username', msg);
      errs.push(e);
    }
    else if (checkUsername){
      if (!checkUsername(user.username)){
        var msg=r.format(r.value('error_username'));
        var e=createError('exp', 'username', msg);
        errs.push(e);
      }
    }
    if (isEmpty(user.contact)){
      var msg=r.format(r.value('error_required'), r.value('contact'));
      var e=createError('required', 'contact', msg);
      errs.push(e);
    }
    else if (checkContact){
      if (!checkContact(user.contact)){
        var msg=r.format(r.value('error_contact'));
        var e=createError('exp', 'contact', msg);
        errs.push(e);
      }
    }
    if (requiredPassword){
      if (isEmpty(user.password)){
        var msg=r.format(r.value('error_required'), r.value('password'));
        var e=createError('required', 'password', msg);
        errs.push(e);
      }
      else {
        if (reg && !reg.test(user.password)){
          var msg=r.format(r.value('error_password_exp'), r.value('password'));
          var e=createError('exp', 'password', msg);
          errs.push(e);
        }
        if (user.password !== confirmPassword){
          var msg=r.value('error_confirm_password');
          showError(msg, 'confirmPassword');
          return false;
        }
      }
    }
    return errs;
  }
}
exports.validate=validate;
function getMessage(status, r){
  if (status===SignupStatus.Success){
    return r.value('success_sign_up');
  }
  else if (status===SignupStatus.UserNameError){
    return r.value('error_sign_up_username');
  }
  else if (status===SignupStatus.ContactError){
    return r.value('error_sign_up_contact');
  }
  else {
    return r.value('fail_sign_up');
  }
}
exports.getMessage=getMessage;
function signup(register, user, r, showMessage, showError, handleError, loading){
  return __awaiter(this, void 0, void 0, function(){
    var result, msg, err_1;
    return __generator(this, function(_a){
      switch (_a.label){
        case 0:
          _a.trys.push([0, 2, 3, 4]);
          if (loading){
            loading.showLoading();
          }
          return [4, register(user)];
        case 1:
          result=_a.sent();
          msg=getMessage(result.status, r);
          if (result.status===SignupStatus.Success){
            showMessage(msg);
          }
          else {
            showError(msg);
          }
          return [3, 4];
        case 2:
          err_1=_a.sent();
          handleError(err_1);
          return [3, 4];
        case 3:
          if (loading){
            loading.hideLoading();
          }
          return [7];
        case 4: return [2];
      }
    });
  });
}
exports.signup=signup;
function validateAndSignup(register, user, passRequired, confirmPassword, r, showMessage, showError, hideMessage, chkUsername, chkContact, check, handleError, reg, loading, showCustomError){
  return __awaiter(this, void 0, void 0, function(){
    var s, results;
    return __generator(this, function(_a){
      s=(showCustomError ? null : showError);
      results=check(user, r, chkUsername, chkContact, passRequired, confirmPassword, reg, s);
      if (results===false){
        return [2];
      }
      else if (Array.isArray(results) && results.length > 0){
        if (showCustomError){
          showCustomError(results);
        }
        return [2];
      }
      else {
        hideMessage();
      }
      signup(register, user, r, showMessage, showError, handleError, loading);
      return [2];
    });
  });
}
exports.validateAndSignup=validateAndSignup;
