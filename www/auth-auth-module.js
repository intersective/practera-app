(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["auth-auth-module"],{

/***/ "./src/app/auth/auth-forgot-password/auth-forgot-password.component.css":
/*!******************************************************************************!*\
  !*** ./src/app/auth/auth-forgot-password/auth-forgot-password.component.css ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".div-logo {\n  margin-top: 10vh;\n  margin-bottom: 7vh;\n}\n.btn-login {\n  width: 50pt;\n  height: 50px;\n  background-color: transparent;\n}"

/***/ }),

/***/ "./src/app/auth/auth-forgot-password/auth-forgot-password.component.html":
/*!*******************************************************************************!*\
  !*** ./src/app/auth/auth-forgot-password/auth-forgot-password.component.html ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<ion-content color=\"light\" text-center>\n  <div class=\"div-logo\">\n    <img src=\"/assets/logo.svg\" width=\"60%\">\n  </div>\n  <div style=\"margin: 0 30px;\">\n    <b>Forgot your password? No worries, mate!</b>\n    <p>Enter your email and we'll send you a link that will let you pick a new password.</p>\n    <ion-item margin-vertical>\n      <ion-input name=\"email\" [(ngModel)]=\"email\" required type=\"text\" placeholder=\"Email\"></ion-input>\n    </ion-item>\n    <div style=\"margin-bottom: 50px;\">\n      <span style=\"margin-right: 10px;\">Remembered it?</span>\n      <a (click)=\"login()\">Login here</a>\n    </div>\n    <div style=\"clear: both;\"></div>\n    <ion-button (click)=\"send()\" shape=\"round\" color=\"primary\" expand=\"full\">Send Email</ion-button>\n  </div>\n  \n</ion-content>"

/***/ }),

/***/ "./src/app/auth/auth-forgot-password/auth-forgot-password.component.ts":
/*!*****************************************************************************!*\
  !*** ./src/app/auth/auth-forgot-password/auth-forgot-password.component.ts ***!
  \*****************************************************************************/
/*! exports provided: AuthForgotPasswordComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AuthForgotPasswordComponent", function() { return AuthForgotPasswordComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ionic/angular */ "./node_modules/@ionic/angular/dist/index.js");
/* harmony import */ var _components_notification_notification_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../components/notification/notification.component */ "./src/app/components/notification/notification.component.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};




var AuthForgotPasswordComponent = /** @class */ (function () {
    function AuthForgotPasswordComponent(router, modalController) {
        this.router = router;
        this.modalController = modalController;
        this.email = '';
    }
    AuthForgotPasswordComponent.prototype.send = function () {
        return __awaiter(this, void 0, void 0, function () {
            var modal;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.modalController.create({
                            component: _components_notification_notification_component__WEBPACK_IMPORTED_MODULE_3__["NotificationComponent"],
                            componentProps: {
                                type: 'forgotPasswordConfirmation',
                                data: {
                                    email: this.email
                                },
                                redirect: "/login"
                            }
                        })];
                    case 1:
                        modal = _a.sent();
                        return [4 /*yield*/, modal.present()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    AuthForgotPasswordComponent.prototype.login = function () {
        this.router.navigate(['/login']);
    };
    AuthForgotPasswordComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-auth-forgot-password',
            template: __webpack_require__(/*! ./auth-forgot-password.component.html */ "./src/app/auth/auth-forgot-password/auth-forgot-password.component.html"),
            styles: [__webpack_require__(/*! ./auth-forgot-password.component.css */ "./src/app/auth/auth-forgot-password/auth-forgot-password.component.css")]
        }),
        __metadata("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"],
            _ionic_angular__WEBPACK_IMPORTED_MODULE_2__["ModalController"]])
    ], AuthForgotPasswordComponent);
    return AuthForgotPasswordComponent;
}());



/***/ }),

/***/ "./src/app/auth/auth-login/auth-login.component.css":
/*!**********************************************************!*\
  !*** ./src/app/auth/auth-login/auth-login.component.css ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".div-logo {\n  margin-top: 10vh;\n  margin-bottom: 7vh;\n}\n.btn-login {\n  width: 50pt;\n  height: 50px;\n  background-color: transparent;\n}"

/***/ }),

/***/ "./src/app/auth/auth-login/auth-login.component.html":
/*!***********************************************************!*\
  !*** ./src/app/auth/auth-login/auth-login.component.html ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<ion-content color=\"light\" text-center>\n  <div class=\"div-logo\">\n    <img src=\"./assets/logo.svg\" width=\"60%\">\n  </div>\n  <ion-list margin-horizontal>\n    <ion-item>\n      <ion-input name=\"email\" [(ngModel)]=\"email\" required type=\"text\" placeholder=\"Email\"></ion-input>\n    </ion-item>\n    <ion-item>\n      <ion-input name=\"password\" [(ngModel)]=\"password\" required type=\"password\" placeholder=\"Password\"></ion-input>\n    </ion-item>\n  </ion-list>\n  <button class=\"btn-login\" (click)=\"login()\"><img src=\"/assets/login-button.svg\" width=\"100%\"></button>\n  <div style=\"margin:40px 0;\">\n    <a (click)=\"forgotPassword()\">Problem signing in?</a>\n  </div>\n  <div>\n    <a>Powered by</a><img src=\"./assets/logo.svg\" height=\"25\" style=\"margin-left: 10px;vertical-align: middle;\">\n  </div>\n</ion-content>"

/***/ }),

/***/ "./src/app/auth/auth-login/auth-login.component.ts":
/*!*********************************************************!*\
  !*** ./src/app/auth/auth-login/auth-login.component.ts ***!
  \*********************************************************/
/*! exports provided: AuthLoginComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AuthLoginComponent", function() { return AuthLoginComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var AuthLoginComponent = /** @class */ (function () {
    function AuthLoginComponent(router) {
        this.router = router;
        this.email = '';
        this.password = '';
    }
    AuthLoginComponent.prototype.login = function () {
        // -- todo
        // call API to do authentication
        console.log("Email: ", this.email, "\nPassword: ", this.password);
        this.router.navigate(['/switcher']);
    };
    AuthLoginComponent.prototype.forgotPassword = function () {
        this.router.navigate(['/forgot_password']);
    };
    AuthLoginComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-auth-login',
            template: __webpack_require__(/*! ./auth-login.component.html */ "./src/app/auth/auth-login/auth-login.component.html"),
            styles: [__webpack_require__(/*! ./auth-login.component.css */ "./src/app/auth/auth-login/auth-login.component.css")]
        }),
        __metadata("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"]])
    ], AuthLoginComponent);
    return AuthLoginComponent;
}());



/***/ }),

/***/ "./src/app/auth/auth-routing.module.ts":
/*!*********************************************!*\
  !*** ./src/app/auth/auth-routing.module.ts ***!
  \*********************************************/
/*! exports provided: AuthRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AuthRoutingModule", function() { return AuthRoutingModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _auth_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./auth.component */ "./src/app/auth/auth.component.ts");
/* harmony import */ var _auth_login_auth_login_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./auth-login/auth-login.component */ "./src/app/auth/auth-login/auth-login.component.ts");
/* harmony import */ var _auth_forgot_password_auth_forgot_password_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./auth-forgot-password/auth-forgot-password.component */ "./src/app/auth/auth-forgot-password/auth-forgot-password.component.ts");
/* harmony import */ var _auth_switcher_auth_switcher_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./auth-switcher/auth-switcher.component */ "./src/app/auth/auth-switcher/auth-switcher.component.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};






var routes = [
    {
        path: '',
        component: _auth_component__WEBPACK_IMPORTED_MODULE_2__["AuthComponent"],
        children: [
            {
                path: '',
                redirectTo: '/login',
                pathMatch: 'full',
            },
            {
                path: 'login',
                component: _auth_login_auth_login_component__WEBPACK_IMPORTED_MODULE_3__["AuthLoginComponent"]
            },
            {
                path: 'forgot_password',
                component: _auth_forgot_password_auth_forgot_password_component__WEBPACK_IMPORTED_MODULE_4__["AuthForgotPasswordComponent"]
            },
            {
                path: 'switcher',
                component: _auth_switcher_auth_switcher_component__WEBPACK_IMPORTED_MODULE_5__["AuthSwitcherComponent"]
            }
        ]
    }
];
var AuthRoutingModule = /** @class */ (function () {
    function AuthRoutingModule() {
    }
    AuthRoutingModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"])({
            imports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"].forChild(routes)],
            exports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]]
        })
    ], AuthRoutingModule);
    return AuthRoutingModule;
}());



/***/ }),

/***/ "./src/app/auth/auth-switcher/auth-switcher.component.css":
/*!****************************************************************!*\
  !*** ./src/app/auth/auth-switcher/auth-switcher.component.css ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".img-icon {\n  vertical-align: middle; \n  margin-right: 10px;\n  width: auto;\n}\n.div-card {\n  margin-left: 0;\n  margin-right: 0;\n}"

/***/ }),

/***/ "./src/app/auth/auth-switcher/auth-switcher.component.html":
/*!*****************************************************************!*\
  !*** ./src/app/auth/auth-switcher/auth-switcher.component.html ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<ion-header>\n  <ion-toolbar>\n    <ion-title>Select A Program</ion-title>\n  </ion-toolbar>\n</ion-header>\n\n<ion-content padding color=\"light\">\n  <ion-card class=\"div-card\">\n    <ion-list *ngFor=\"let program of programs\">\n      <ion-item (click)=\"switch(program.id)\" color=\"light\">\n        <img src=\"./assets/thumbs/practera_icon.png\" height=\"25\" width=\"25\" class=\"img-icon\"> {{ program.name }}\n      </ion-item>\n    </ion-list>\n  </ion-card>\n  <ion-card class=\"div-card\">\n    <ion-item (click)=\"logout()\">\n      <ion-icon name=\"log-out\" margin-end></ion-icon> Logout\n    </ion-item>\n  </ion-card>\n</ion-content>"

/***/ }),

/***/ "./src/app/auth/auth-switcher/auth-switcher.component.ts":
/*!***************************************************************!*\
  !*** ./src/app/auth/auth-switcher/auth-switcher.component.ts ***!
  \***************************************************************/
/*! exports provided: AuthSwitcherComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AuthSwitcherComponent", function() { return AuthSwitcherComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var AuthSwitcherComponent = /** @class */ (function () {
    function AuthSwitcherComponent(router) {
        this.router = router;
        this.programs = [
            {
                id: 1,
                name: 'Global Scope'
            },
            {
                id: 2,
                name: 'Next'
            },
            {
                id: 3,
                name: 'Demo Program'
            }
        ];
    }
    AuthSwitcherComponent.prototype.switch = function (id) {
        // -- todo
        // call API to get program detail
        console.log("Program Choosen, Id: ", id);
        this.router.navigate(['/pages/tabs']);
    };
    AuthSwitcherComponent.prototype.logout = function () {
        // -- todo
        // clear local storage data, log user out
        console.log("User logged out");
        this.router.navigate(['/login']);
    };
    AuthSwitcherComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-auth-switcher',
            template: __webpack_require__(/*! ./auth-switcher.component.html */ "./src/app/auth/auth-switcher/auth-switcher.component.html"),
            styles: [__webpack_require__(/*! ./auth-switcher.component.css */ "./src/app/auth/auth-switcher/auth-switcher.component.css")]
        }),
        __metadata("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"]])
    ], AuthSwitcherComponent);
    return AuthSwitcherComponent;
}());



/***/ }),

/***/ "./src/app/auth/auth.component.ts":
/*!****************************************!*\
  !*** ./src/app/auth/auth.component.ts ***!
  \****************************************/
/*! exports provided: AuthComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AuthComponent", function() { return AuthComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var AuthComponent = /** @class */ (function () {
    function AuthComponent() {
    }
    AuthComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-auth',
            template: '<ion-router-outlet></ion-router-outlet>'
        })
    ], AuthComponent);
    return AuthComponent;
}());



/***/ }),

/***/ "./src/app/auth/auth.module.ts":
/*!*************************************!*\
  !*** ./src/app/auth/auth.module.ts ***!
  \*************************************/
/*! exports provided: AuthModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AuthModule", function() { return AuthModule; });
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ionic/angular */ "./node_modules/@ionic/angular/dist/index.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var _auth_routing_module__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./auth-routing.module */ "./src/app/auth/auth-routing.module.ts");
/* harmony import */ var _auth_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./auth.component */ "./src/app/auth/auth.component.ts");
/* harmony import */ var _auth_login_auth_login_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./auth-login/auth-login.component */ "./src/app/auth/auth-login/auth-login.component.ts");
/* harmony import */ var _auth_forgot_password_auth_forgot_password_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./auth-forgot-password/auth-forgot-password.component */ "./src/app/auth/auth-forgot-password/auth-forgot-password.component.ts");
/* harmony import */ var _auth_switcher_auth_switcher_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./auth-switcher/auth-switcher.component */ "./src/app/auth/auth-switcher/auth-switcher.component.ts");
/* harmony import */ var _components_notification_notification_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../components/notification/notification.component */ "./src/app/components/notification/notification.component.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};










var AuthModule = /** @class */ (function () {
    function AuthModule() {
    }
    AuthModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
            imports: [
                _ionic_angular__WEBPACK_IMPORTED_MODULE_0__["IonicModule"],
                _angular_common__WEBPACK_IMPORTED_MODULE_2__["CommonModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormsModule"],
                _auth_routing_module__WEBPACK_IMPORTED_MODULE_4__["AuthRoutingModule"]
            ],
            declarations: [
                _auth_component__WEBPACK_IMPORTED_MODULE_5__["AuthComponent"],
                _auth_login_auth_login_component__WEBPACK_IMPORTED_MODULE_6__["AuthLoginComponent"],
                _auth_forgot_password_auth_forgot_password_component__WEBPACK_IMPORTED_MODULE_7__["AuthForgotPasswordComponent"],
                _auth_switcher_auth_switcher_component__WEBPACK_IMPORTED_MODULE_8__["AuthSwitcherComponent"],
                _components_notification_notification_component__WEBPACK_IMPORTED_MODULE_9__["NotificationComponent"]
            ],
            entryComponents: [
                _components_notification_notification_component__WEBPACK_IMPORTED_MODULE_9__["NotificationComponent"]
            ]
        })
    ], AuthModule);
    return AuthModule;
}());



/***/ }),

/***/ "./src/app/components/notification/notification.component.css":
/*!********************************************************************!*\
  !*** ./src/app/components/notification/notification.component.css ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/components/notification/notification.component.html":
/*!*********************************************************************!*\
  !*** ./src/app/components/notification/notification.component.html ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<ion-content color=\"light\" text-center>\n  <div style=\"margin: 50px 30px 0;\">\n\n    <div *ngIf=\"type == 'forgotPasswordConfirmation'\">\n      <p>We have sent an email to \"<i>{{ data.email }}</i>\" with a link to log into the system - please check your inbox. \n      <p style=\"margin: 20px 0 50px;\">If you haven't received an email in a few minutes, please make sure the email you entered is correct and check your spam folder. Thank you.</p>\n    </div>\n    \n    <ion-button (click)=\"confirmed()\" shape=\"round\" color=\"primary\" expand=\"full\">OK</ion-button>\n  </div>\n</ion-content>"

/***/ }),

/***/ "./src/app/components/notification/notification.component.ts":
/*!*******************************************************************!*\
  !*** ./src/app/components/notification/notification.component.ts ***!
  \*******************************************************************/
/*! exports provided: NotificationComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NotificationComponent", function() { return NotificationComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ionic/angular */ "./node_modules/@ionic/angular/dist/index.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var NotificationComponent = /** @class */ (function () {
    function NotificationComponent(router, modalController) {
        this.router = router;
        this.modalController = modalController;
        this.type = '';
        this.redirect = '/pages/tabs';
        this.data = {};
    }
    NotificationComponent.prototype.confirmed = function () {
        this.modalController.dismiss();
        this.router.navigate([this.redirect]);
    };
    NotificationComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-notification',
            template: __webpack_require__(/*! ./notification.component.html */ "./src/app/components/notification/notification.component.html"),
            styles: [__webpack_require__(/*! ./notification.component.css */ "./src/app/components/notification/notification.component.css")]
        }),
        __metadata("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"],
            _ionic_angular__WEBPACK_IMPORTED_MODULE_2__["ModalController"]])
    ], NotificationComponent);
    return NotificationComponent;
}());



/***/ })

}]);
//# sourceMappingURL=auth-auth-module.js.map