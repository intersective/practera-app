'use strict';


customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">practera-app-v2 documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                        <li class="link">
                            <a href="license.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>LICENSE
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AchievementsModule.html" data-type="entity-link">AchievementsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AchievementsModule-603ca949d838c866e97ba7f5cdbd3191"' : 'data-target="#xs-components-links-module-AchievementsModule-603ca949d838c866e97ba7f5cdbd3191"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AchievementsModule-603ca949d838c866e97ba7f5cdbd3191"' :
                                            'id="xs-components-links-module-AchievementsModule-603ca949d838c866e97ba7f5cdbd3191"' }>
                                            <li class="link">
                                                <a href="components/AchievementsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AchievementsComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-AchievementsModule-603ca949d838c866e97ba7f5cdbd3191"' : 'data-target="#xs-injectables-links-module-AchievementsModule-603ca949d838c866e97ba7f5cdbd3191"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AchievementsModule-603ca949d838c866e97ba7f5cdbd3191"' :
                                        'id="xs-injectables-links-module-AchievementsModule-603ca949d838c866e97ba7f5cdbd3191"' }>
                                        <li class="link">
                                            <a href="injectables/AchievementsService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>AchievementsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AchievementsRoutingModule.html" data-type="entity-link">AchievementsRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/ActivityModule.html" data-type="entity-link">ActivityModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ActivityModule-89e17a6c82ef90020bf1405e8ea0335a"' : 'data-target="#xs-components-links-module-ActivityModule-89e17a6c82ef90020bf1405e8ea0335a"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ActivityModule-89e17a6c82ef90020bf1405e8ea0335a"' :
                                            'id="xs-components-links-module-ActivityModule-89e17a6c82ef90020bf1405e8ea0335a"' }>
                                            <li class="link">
                                                <a href="components/ActivityComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ActivityComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ActivityRoutingComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ActivityRoutingComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-ActivityModule-89e17a6c82ef90020bf1405e8ea0335a"' : 'data-target="#xs-injectables-links-module-ActivityModule-89e17a6c82ef90020bf1405e8ea0335a"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ActivityModule-89e17a6c82ef90020bf1405e8ea0335a"' :
                                        'id="xs-injectables-links-module-ActivityModule-89e17a6c82ef90020bf1405e8ea0335a"' }>
                                        <li class="link">
                                            <a href="injectables/ActivityService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>ActivityService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ActivityRoutingModule.html" data-type="entity-link">ActivityRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link">AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppModule-81f0b22998ad6115fe80ec5159028f95"' : 'data-target="#xs-components-links-module-AppModule-81f0b22998ad6115fe80ec5159028f95"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-81f0b22998ad6115fe80ec5159028f95"' :
                                            'id="xs-components-links-module-AppModule-81f0b22998ad6115fe80ec5159028f95"' }>
                                            <li class="link">
                                                <a href="components/AppComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AppComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DeviceInfoComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DeviceInfoComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/IconComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">IconComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PageNotFoundComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PageNotFoundComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UnlockingComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">UnlockingComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-AppModule-81f0b22998ad6115fe80ec5159028f95"' : 'data-target="#xs-injectables-links-module-AppModule-81f0b22998ad6115fe80ec5159028f95"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-81f0b22998ad6115fe80ec5159028f95"' :
                                        'id="xs-injectables-links-module-AppModule-81f0b22998ad6115fe80ec5159028f95"' }>
                                        <li class="link">
                                            <a href="injectables/UtilsService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>UtilsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/VersionCheckService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>VersionCheckService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link">AppRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AssessmentModule.html" data-type="entity-link">AssessmentModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AssessmentModule-9f1e6e50ba097230cdc7795006123fd5"' : 'data-target="#xs-components-links-module-AssessmentModule-9f1e6e50ba097230cdc7795006123fd5"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AssessmentModule-9f1e6e50ba097230cdc7795006123fd5"' :
                                            'id="xs-components-links-module-AssessmentModule-9f1e6e50ba097230cdc7795006123fd5"' }>
                                            <li class="link">
                                                <a href="components/AssessmentComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AssessmentComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AssessmentRoutingModule.html" data-type="entity-link">AssessmentRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link">AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AuthModule-ee68c6af374ad670d1d411ee5e28e504"' : 'data-target="#xs-components-links-module-AuthModule-ee68c6af374ad670d1d411ee5e28e504"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AuthModule-ee68c6af374ad670d1d411ee5e28e504"' :
                                            'id="xs-components-links-module-AuthModule-ee68c6af374ad670d1d411ee5e28e504"' }>
                                            <li class="link">
                                                <a href="components/AuthComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AuthComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AuthDirectLoginComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AuthDirectLoginComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AuthForgotPasswordComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AuthForgotPasswordComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AuthLoginComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AuthLoginComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AuthLogoutComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AuthLogoutComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AuthRegistrationComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AuthRegistrationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AuthResetPasswordComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AuthResetPasswordComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TermsConditionsPreviewComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">TermsConditionsPreviewComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-AuthModule-ee68c6af374ad670d1d411ee5e28e504"' : 'data-target="#xs-injectables-links-module-AuthModule-ee68c6af374ad670d1d411ee5e28e504"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-ee68c6af374ad670d1d411ee5e28e504"' :
                                        'id="xs-injectables-links-module-AuthModule-ee68c6af374ad670d1d411ee5e28e504"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>AuthService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthRoutingModule.html" data-type="entity-link">AuthRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/ChatModule.html" data-type="entity-link">ChatModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ChatModule-b8e6941bfb18ebc7e4efd4bfb435a950"' : 'data-target="#xs-components-links-module-ChatModule-b8e6941bfb18ebc7e4efd4bfb435a950"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ChatModule-b8e6941bfb18ebc7e4efd4bfb435a950"' :
                                            'id="xs-components-links-module-ChatModule-b8e6941bfb18ebc7e4efd4bfb435a950"' }>
                                            <li class="link">
                                                <a href="components/ChatComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ChatComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ChatListComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ChatListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ChatPreviewComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ChatPreviewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ChatRoomComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ChatRoomComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ChatViewComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ChatViewComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-ChatModule-b8e6941bfb18ebc7e4efd4bfb435a950"' : 'data-target="#xs-directives-links-module-ChatModule-b8e6941bfb18ebc7e4efd4bfb435a950"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-ChatModule-b8e6941bfb18ebc7e4efd4bfb435a950"' :
                                        'id="xs-directives-links-module-ChatModule-b8e6941bfb18ebc7e4efd4bfb435a950"' }>
                                        <li class="link">
                                            <a href="directives/AutoresizeDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">AutoresizeDirective</a>
                                        </li>
                                    </ul>
                                </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-ChatModule-b8e6941bfb18ebc7e4efd4bfb435a950"' : 'data-target="#xs-injectables-links-module-ChatModule-b8e6941bfb18ebc7e4efd4bfb435a950"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ChatModule-b8e6941bfb18ebc7e4efd4bfb435a950"' :
                                        'id="xs-injectables-links-module-ChatModule-b8e6941bfb18ebc7e4efd4bfb435a950"' }>
                                        <li class="link">
                                            <a href="injectables/ChatService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>ChatService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ChatRoutingModule.html" data-type="entity-link">ChatRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/EventDetailModule.html" data-type="entity-link">EventDetailModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-EventDetailModule-b1cba56ff27efbe440e726cb1c02bd30"' : 'data-target="#xs-components-links-module-EventDetailModule-b1cba56ff27efbe440e726cb1c02bd30"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-EventDetailModule-b1cba56ff27efbe440e726cb1c02bd30"' :
                                            'id="xs-components-links-module-EventDetailModule-b1cba56ff27efbe440e726cb1c02bd30"' }>
                                            <li class="link">
                                                <a href="components/EventDetailComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">EventDetailComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-EventDetailModule-b1cba56ff27efbe440e726cb1c02bd30"' : 'data-target="#xs-injectables-links-module-EventDetailModule-b1cba56ff27efbe440e726cb1c02bd30"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-EventDetailModule-b1cba56ff27efbe440e726cb1c02bd30"' :
                                        'id="xs-injectables-links-module-EventDetailModule-b1cba56ff27efbe440e726cb1c02bd30"' }>
                                        <li class="link">
                                            <a href="injectables/EventDetailService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>EventDetailService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/EventListModule.html" data-type="entity-link">EventListModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-EventListModule-fb317fc531acc52a20a36a6feb277087"' : 'data-target="#xs-components-links-module-EventListModule-fb317fc531acc52a20a36a6feb277087"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-EventListModule-fb317fc531acc52a20a36a6feb277087"' :
                                            'id="xs-components-links-module-EventListModule-fb317fc531acc52a20a36a6feb277087"' }>
                                            <li class="link">
                                                <a href="components/EventListComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">EventListComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-EventListModule-fb317fc531acc52a20a36a6feb277087"' : 'data-target="#xs-injectables-links-module-EventListModule-fb317fc531acc52a20a36a6feb277087"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-EventListModule-fb317fc531acc52a20a36a6feb277087"' :
                                        'id="xs-injectables-links-module-EventListModule-fb317fc531acc52a20a36a6feb277087"' }>
                                        <li class="link">
                                            <a href="injectables/EventListService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>EventListService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/EventsModule.html" data-type="entity-link">EventsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-EventsModule-2efdd7495d10041d8b53e249cd92fbbf"' : 'data-target="#xs-components-links-module-EventsModule-2efdd7495d10041d8b53e249cd92fbbf"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-EventsModule-2efdd7495d10041d8b53e249cd92fbbf"' :
                                            'id="xs-components-links-module-EventsModule-2efdd7495d10041d8b53e249cd92fbbf"' }>
                                            <li class="link">
                                                <a href="components/EventsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">EventsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EventsRoutingComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">EventsRoutingComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/EventsRoutingModule.html" data-type="entity-link">EventsRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/FastFeedbackModule.html" data-type="entity-link">FastFeedbackModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-FastFeedbackModule-4a8c9a8683808af178371513911c2e20"' : 'data-target="#xs-components-links-module-FastFeedbackModule-4a8c9a8683808af178371513911c2e20"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-FastFeedbackModule-4a8c9a8683808af178371513911c2e20"' :
                                            'id="xs-components-links-module-FastFeedbackModule-4a8c9a8683808af178371513911c2e20"' }>
                                            <li class="link">
                                                <a href="components/FastFeedbackComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">FastFeedbackComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/QuestionComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">QuestionComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-FastFeedbackModule-4a8c9a8683808af178371513911c2e20"' : 'data-target="#xs-injectables-links-module-FastFeedbackModule-4a8c9a8683808af178371513911c2e20"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-FastFeedbackModule-4a8c9a8683808af178371513911c2e20"' :
                                        'id="xs-injectables-links-module-FastFeedbackModule-4a8c9a8683808af178371513911c2e20"' }>
                                        <li class="link">
                                            <a href="injectables/FastFeedbackService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>FastFeedbackService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/FilestackModule.html" data-type="entity-link">FilestackModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-FilestackModule-5d76f9712e2e3681ef97065a9982c71b"' : 'data-target="#xs-components-links-module-FilestackModule-5d76f9712e2e3681ef97065a9982c71b"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-FilestackModule-5d76f9712e2e3681ef97065a9982c71b"' :
                                            'id="xs-components-links-module-FilestackModule-5d76f9712e2e3681ef97065a9982c71b"' }>
                                            <li class="link">
                                                <a href="components/FilestackComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">FilestackComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PreviewComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PreviewComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-FilestackModule-5d76f9712e2e3681ef97065a9982c71b"' : 'data-target="#xs-injectables-links-module-FilestackModule-5d76f9712e2e3681ef97065a9982c71b"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-FilestackModule-5d76f9712e2e3681ef97065a9982c71b"' :
                                        'id="xs-injectables-links-module-FilestackModule-5d76f9712e2e3681ef97065a9982c71b"' }>
                                        <li class="link">
                                            <a href="injectables/FilestackService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>FilestackService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/GoMobileModule.html" data-type="entity-link">GoMobileModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-GoMobileModule-7c69df90e88343fc5be7000eca7e70e0"' : 'data-target="#xs-components-links-module-GoMobileModule-7c69df90e88343fc5be7000eca7e70e0"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-GoMobileModule-7c69df90e88343fc5be7000eca7e70e0"' :
                                            'id="xs-components-links-module-GoMobileModule-7c69df90e88343fc5be7000eca7e70e0"' }>
                                            <li class="link">
                                                <a href="components/GoMobileComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">GoMobileComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-GoMobileModule-7c69df90e88343fc5be7000eca7e70e0"' : 'data-target="#xs-injectables-links-module-GoMobileModule-7c69df90e88343fc5be7000eca7e70e0"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-GoMobileModule-7c69df90e88343fc5be7000eca7e70e0"' :
                                        'id="xs-injectables-links-module-GoMobileModule-7c69df90e88343fc5be7000eca7e70e0"' }>
                                        <li class="link">
                                            <a href="injectables/GoMobileService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>GoMobileService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/NewRelicModule.html" data-type="entity-link">NewRelicModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-NewRelicModule-2230ae541de3350115e5d5b77b5cde4b"' : 'data-target="#xs-injectables-links-module-NewRelicModule-2230ae541de3350115e5d5b77b5cde4b"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-NewRelicModule-2230ae541de3350115e5d5b77b5cde4b"' :
                                        'id="xs-injectables-links-module-NewRelicModule-2230ae541de3350115e5d5b77b5cde4b"' }>
                                        <li class="link">
                                            <a href="injectables/NewRelicService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>NewRelicService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/NotificationModule.html" data-type="entity-link">NotificationModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-NotificationModule-bb7dd33ad5a00cf6b29c918b0b935b64"' : 'data-target="#xs-components-links-module-NotificationModule-bb7dd33ad5a00cf6b29c918b0b935b64"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-NotificationModule-bb7dd33ad5a00cf6b29c918b0b935b64"' :
                                            'id="xs-components-links-module-NotificationModule-bb7dd33ad5a00cf6b29c918b0b935b64"' }>
                                            <li class="link">
                                                <a href="components/AchievementPopUpComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AchievementPopUpComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ActivityCompletePopUpComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ActivityCompletePopUpComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LockTeamAssessmentPopUpComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">LockTeamAssessmentPopUpComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PopUpComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PopUpComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-NotificationModule-bb7dd33ad5a00cf6b29c918b0b935b64"' : 'data-target="#xs-injectables-links-module-NotificationModule-bb7dd33ad5a00cf6b29c918b0b935b64"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-NotificationModule-bb7dd33ad5a00cf6b29c918b0b935b64"' :
                                        'id="xs-injectables-links-module-NotificationModule-bb7dd33ad5a00cf6b29c918b0b935b64"' }>
                                        <li class="link">
                                            <a href="injectables/NotificationService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>NotificationService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/OverviewModule.html" data-type="entity-link">OverviewModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-OverviewModule-24bca9da1dd935bcf9b1279cb3c31be4"' : 'data-target="#xs-components-links-module-OverviewModule-24bca9da1dd935bcf9b1279cb3c31be4"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-OverviewModule-24bca9da1dd935bcf9b1279cb3c31be4"' :
                                            'id="xs-components-links-module-OverviewModule-24bca9da1dd935bcf9b1279cb3c31be4"' }>
                                            <li class="link">
                                                <a href="components/HomeComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">HomeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OverviewComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">OverviewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProjectComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ProjectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SlidableComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">SlidableComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TodoCardComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">TodoCardComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-OverviewModule-24bca9da1dd935bcf9b1279cb3c31be4"' : 'data-target="#xs-injectables-links-module-OverviewModule-24bca9da1dd935bcf9b1279cb3c31be4"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-OverviewModule-24bca9da1dd935bcf9b1279cb3c31be4"' :
                                        'id="xs-injectables-links-module-OverviewModule-24bca9da1dd935bcf9b1279cb3c31be4"' }>
                                        <li class="link">
                                            <a href="injectables/HomeService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>HomeService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ProjectService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>ProjectService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/OverviewRoutingModule.html" data-type="entity-link">OverviewRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/PusherModule.html" data-type="entity-link">PusherModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-PusherModule-893ca724851c17dd841c75505367ad00"' : 'data-target="#xs-injectables-links-module-PusherModule-893ca724851c17dd841c75505367ad00"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PusherModule-893ca724851c17dd841c75505367ad00"' :
                                        'id="xs-injectables-links-module-PusherModule-893ca724851c17dd841c75505367ad00"' }>
                                        <li class="link">
                                            <a href="injectables/PusherService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>PusherService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/QuestionsModule.html" data-type="entity-link">QuestionsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-QuestionsModule-2ce8cd0aad75665a4269d25895307541"' : 'data-target="#xs-components-links-module-QuestionsModule-2ce8cd0aad75665a4269d25895307541"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-QuestionsModule-2ce8cd0aad75665a4269d25895307541"' :
                                            'id="xs-components-links-module-QuestionsModule-2ce8cd0aad75665a4269d25895307541"' }>
                                            <li class="link">
                                                <a href="components/FileComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">FileComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FileDisplayComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">FileDisplayComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MultipleComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">MultipleComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OneofComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">OneofComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/QuestionsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">QuestionsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TeamMemberSelectorComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">TeamMemberSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TextComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">TextComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/RequestModule.html" data-type="entity-link">RequestModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-RequestModule-925901226f0d4f2f1bf718cde1303d22"' : 'data-target="#xs-injectables-links-module-RequestModule-925901226f0d4f2f1bf718cde1303d22"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-RequestModule-925901226f0d4f2f1bf718cde1303d22"' :
                                        'id="xs-injectables-links-module-RequestModule-925901226f0d4f2f1bf718cde1303d22"' }>
                                        <li class="link">
                                            <a href="injectables/RequestService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>RequestService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ReviewListModule.html" data-type="entity-link">ReviewListModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ReviewListModule-714aa4500d79e7d0d8a4e505cae7f5f5"' : 'data-target="#xs-components-links-module-ReviewListModule-714aa4500d79e7d0d8a4e505cae7f5f5"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ReviewListModule-714aa4500d79e7d0d8a4e505cae7f5f5"' :
                                            'id="xs-components-links-module-ReviewListModule-714aa4500d79e7d0d8a4e505cae7f5f5"' }>
                                            <li class="link">
                                                <a href="components/ReviewListComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ReviewListComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-ReviewListModule-714aa4500d79e7d0d8a4e505cae7f5f5"' : 'data-target="#xs-injectables-links-module-ReviewListModule-714aa4500d79e7d0d8a4e505cae7f5f5"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ReviewListModule-714aa4500d79e7d0d8a4e505cae7f5f5"' :
                                        'id="xs-injectables-links-module-ReviewListModule-714aa4500d79e7d0d8a4e505cae7f5f5"' }>
                                        <li class="link">
                                            <a href="injectables/ReviewListService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>ReviewListService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ReviewRatingModule.html" data-type="entity-link">ReviewRatingModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ReviewRatingModule-a15a64c5590339b51ff7b4a21c79d9bb"' : 'data-target="#xs-components-links-module-ReviewRatingModule-a15a64c5590339b51ff7b4a21c79d9bb"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ReviewRatingModule-a15a64c5590339b51ff7b4a21c79d9bb"' :
                                            'id="xs-components-links-module-ReviewRatingModule-a15a64c5590339b51ff7b4a21c79d9bb"' }>
                                            <li class="link">
                                                <a href="components/ReviewRatingComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ReviewRatingComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-ReviewRatingModule-a15a64c5590339b51ff7b4a21c79d9bb"' : 'data-target="#xs-injectables-links-module-ReviewRatingModule-a15a64c5590339b51ff7b4a21c79d9bb"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ReviewRatingModule-a15a64c5590339b51ff7b4a21c79d9bb"' :
                                        'id="xs-injectables-links-module-ReviewRatingModule-a15a64c5590339b51ff7b4a21c79d9bb"' }>
                                        <li class="link">
                                            <a href="injectables/ReviewRatingService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>ReviewRatingService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ReviewsModule.html" data-type="entity-link">ReviewsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ReviewsModule-52c9dbc0f706644e6eeed35b3f53921e"' : 'data-target="#xs-components-links-module-ReviewsModule-52c9dbc0f706644e6eeed35b3f53921e"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ReviewsModule-52c9dbc0f706644e6eeed35b3f53921e"' :
                                            'id="xs-components-links-module-ReviewsModule-52c9dbc0f706644e6eeed35b3f53921e"' }>
                                            <li class="link">
                                                <a href="components/ReviewsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ReviewsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReviewsRoutingComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ReviewsRoutingComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ReviewsRoutingModule.html" data-type="entity-link">ReviewsRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/SettingsModule.html" data-type="entity-link">SettingsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-SettingsModule-b4fe9e0e41616d555817ceb0c8c93c58"' : 'data-target="#xs-components-links-module-SettingsModule-b4fe9e0e41616d555817ceb0c8c93c58"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-SettingsModule-b4fe9e0e41616d555817ceb0c8c93c58"' :
                                            'id="xs-components-links-module-SettingsModule-b4fe9e0e41616d555817ceb0c8c93c58"' }>
                                            <li class="link">
                                                <a href="components/SettingsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">SettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SettingsRoutingComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">SettingsRoutingComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/SettingsRoutingModule.html" data-type="entity-link">SettingsRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/SharedModule.html" data-type="entity-link">SharedModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-SharedModule-564b01b4489231a6806bf005c8b51d7f"' : 'data-target="#xs-components-links-module-SharedModule-564b01b4489231a6806bf005c8b51d7f"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-SharedModule-564b01b4489231a6806bf005c8b51d7f"' :
                                            'id="xs-components-links-module-SharedModule-564b01b4489231a6806bf005c8b51d7f"' }>
                                            <li class="link">
                                                <a href="components/AchievementBadgeComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AchievementBadgeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ActivityCardComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ActivityCardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BrandingLogoComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">BrandingLogoComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CircleProgressComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">CircleProgressComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ClickableItemComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ClickableItemComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ContactNumberFormComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ContactNumberFormComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DescriptionComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DescriptionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ImgComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ImgComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ListItemComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ListItemComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-SharedModule-564b01b4489231a6806bf005c8b51d7f"' : 'data-target="#xs-directives-links-module-SharedModule-564b01b4489231a6806bf005c8b51d7f"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-SharedModule-564b01b4489231a6806bf005c8b51d7f"' :
                                        'id="xs-directives-links-module-SharedModule-564b01b4489231a6806bf005c8b51d7f"' }>
                                        <li class="link">
                                            <a href="directives/DragAndDropDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">DragAndDropDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/FloatDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">FloatDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SwitcherModule.html" data-type="entity-link">SwitcherModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-SwitcherModule-4936cf4bc68d2da110b1a907d1a35525"' : 'data-target="#xs-components-links-module-SwitcherModule-4936cf4bc68d2da110b1a907d1a35525"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-SwitcherModule-4936cf4bc68d2da110b1a907d1a35525"' :
                                            'id="xs-components-links-module-SwitcherModule-4936cf4bc68d2da110b1a907d1a35525"' }>
                                            <li class="link">
                                                <a href="components/SwitcherComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">SwitcherComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SwitcherProgramComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">SwitcherProgramComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/SwitcherRoutingModule.html" data-type="entity-link">SwitcherRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/TabsModule.html" data-type="entity-link">TabsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-TabsModule-06f68bbb4f8aab2bc8154522b746c193"' : 'data-target="#xs-components-links-module-TabsModule-06f68bbb4f8aab2bc8154522b746c193"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-TabsModule-06f68bbb4f8aab2bc8154522b746c193"' :
                                            'id="xs-components-links-module-TabsModule-06f68bbb4f8aab2bc8154522b746c193"' }>
                                            <li class="link">
                                                <a href="components/TabsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">TabsComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/TabsRoutingModule.html" data-type="entity-link">TabsRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/TasksModule.html" data-type="entity-link">TasksModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-TasksModule-32ed9d5a6f10af9e5420ab11ca562c8a"' : 'data-target="#xs-components-links-module-TasksModule-32ed9d5a6f10af9e5420ab11ca562c8a"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-TasksModule-32ed9d5a6f10af9e5420ab11ca562c8a"' :
                                            'id="xs-components-links-module-TasksModule-32ed9d5a6f10af9e5420ab11ca562c8a"' }>
                                            <li class="link">
                                                <a href="components/TasksComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">TasksComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TasksRoutingComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">TasksRoutingComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/TasksRoutingModule.html" data-type="entity-link">TasksRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/TopicModule.html" data-type="entity-link">TopicModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-TopicModule-1eb70b4643026d52bed8e1f7cfaa122c"' : 'data-target="#xs-components-links-module-TopicModule-1eb70b4643026d52bed8e1f7cfaa122c"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-TopicModule-1eb70b4643026d52bed8e1f7cfaa122c"' :
                                            'id="xs-components-links-module-TopicModule-1eb70b4643026d52bed8e1f7cfaa122c"' }>
                                            <li class="link">
                                                <a href="components/TopicComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">TopicComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-TopicModule-1eb70b4643026d52bed8e1f7cfaa122c"' : 'data-target="#xs-injectables-links-module-TopicModule-1eb70b4643026d52bed8e1f7cfaa122c"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-TopicModule-1eb70b4643026d52bed8e1f7cfaa122c"' :
                                        'id="xs-injectables-links-module-TopicModule-1eb70b4643026d52bed8e1f7cfaa122c"' }>
                                        <li class="link">
                                            <a href="injectables/TopicService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>TopicService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/TopicRoutingModule.html" data-type="entity-link">TopicRoutingModule</a>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#components-links"' :
                            'data-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AchievementBadgeComponent.html" data-type="entity-link">AchievementBadgeComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ActivityCardComponent.html" data-type="entity-link">ActivityCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BrandingLogoComponent.html" data-type="entity-link">BrandingLogoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CircleProgressComponent.html" data-type="entity-link">CircleProgressComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ClickableItemComponent.html" data-type="entity-link">ClickableItemComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ContactNumberFormComponent.html" data-type="entity-link">ContactNumberFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DescriptionComponent.html" data-type="entity-link">DescriptionComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/IconComponent.html" data-type="entity-link">IconComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ImgComponent.html" data-type="entity-link">ImgComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ListItemComponent.html" data-type="entity-link">ListItemComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UnlockingComponent.html" data-type="entity-link">UnlockingComponent</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/ActivatedRouteStub.html" data-type="entity-link">ActivatedRouteStub</a>
                            </li>
                            <li class="link">
                                <a href="classes/BrowserStorageServiceMock.html" data-type="entity-link">BrowserStorageServiceMock</a>
                            </li>
                            <li class="link">
                                <a href="classes/FastFeedbackServiceMock.html" data-type="entity-link">FastFeedbackServiceMock</a>
                            </li>
                            <li class="link">
                                <a href="classes/MockNewRelicService.html" data-type="entity-link">MockNewRelicService</a>
                            </li>
                            <li class="link">
                                <a href="classes/MockNgZone.html" data-type="entity-link">MockNgZone</a>
                            </li>
                            <li class="link">
                                <a href="classes/MockRouter.html" data-type="entity-link">MockRouter</a>
                            </li>
                            <li class="link">
                                <a href="classes/MockRouterEnterService.html" data-type="entity-link">MockRouterEnterService</a>
                            </li>
                            <li class="link">
                                <a href="classes/MockSwitcherService.html" data-type="entity-link">MockSwitcherService</a>
                            </li>
                            <li class="link">
                                <a href="classes/PusherChannel.html" data-type="entity-link">PusherChannel</a>
                            </li>
                            <li class="link">
                                <a href="classes/PusherConfig.html" data-type="entity-link">PusherConfig</a>
                            </li>
                            <li class="link">
                                <a href="classes/QueryEncoder.html" data-type="entity-link">QueryEncoder</a>
                            </li>
                            <li class="link">
                                <a href="classes/RequestConfig.html" data-type="entity-link">RequestConfig</a>
                            </li>
                            <li class="link">
                                <a href="classes/RouterEnter.html" data-type="entity-link">RouterEnter</a>
                            </li>
                            <li class="link">
                                <a href="classes/SpyObject.html" data-type="entity-link">SpyObject</a>
                            </li>
                            <li class="link">
                                <a href="classes/TestUtils.html" data-type="entity-link">TestUtils</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AssessmentService.html" data-type="entity-link">AssessmentService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BrowserStorageService.html" data-type="entity-link">BrowserStorageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FastFeedbackSubmitterService.html" data-type="entity-link">FastFeedbackSubmitterService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OverviewService.html" data-type="entity-link">OverviewService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SettingService.html" data-type="entity-link">SettingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SharedService.html" data-type="entity-link">SharedService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SwitcherService.html" data-type="entity-link">SwitcherService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TabsService.html" data-type="entity-link">TabsService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interceptors-links"' :
                            'data-target="#xs-interceptors-links"' }>
                            <span class="icon ion-ios-swap"></span>
                            <span>Interceptors</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="interceptors-links"' : 'id="xs-interceptors-links"' }>
                            <li class="link">
                                <a href="interceptors/RequestInterceptor.html" data-type="entity-link">RequestInterceptor</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#guards-links"' :
                            'data-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/AuthGuard.html" data-type="entity-link">AuthGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/CanDeactivateGuard.html" data-type="entity-link">CanDeactivateGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/ProgramSelectedGuard.html" data-type="entity-link">ProgramSelectedGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/UnauthorizedGuard.html" data-type="entity-link">UnauthorizedGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/Achievement.html" data-type="entity-link">Achievement</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Activity.html" data-type="entity-link">Activity</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Activity-1.html" data-type="entity-link">Activity</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Activity-2.html" data-type="entity-link">Activity</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Answer.html" data-type="entity-link">Answer</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Assessment.html" data-type="entity-link">Assessment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AssessmentSubmitParams.html" data-type="entity-link">AssessmentSubmitParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CanComponentDeactivate.html" data-type="entity-link">CanComponentDeactivate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChatChannel.html" data-type="entity-link">ChatChannel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Choice.html" data-type="entity-link">Choice</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Choice-1.html" data-type="entity-link">Choice</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Config.html" data-type="entity-link">Config</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConfigParams.html" data-type="entity-link">ConfigParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CustomTostOptions.html" data-type="entity-link">CustomTostOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Enrolment.html" data-type="entity-link">Enrolment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Event.html" data-type="entity-link">Event</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EventGroup.html" data-type="entity-link">EventGroup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ExperienceConfig.html" data-type="entity-link">ExperienceConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FilestackUploaded.html" data-type="entity-link">FilestackUploaded</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Group.html" data-type="entity-link">Group</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MarkAsSeenParams.html" data-type="entity-link">MarkAsSeenParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Message.html" data-type="entity-link">Message</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MessageListParams.html" data-type="entity-link">MessageListParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Meta.html" data-type="entity-link">Meta</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Metadata.html" data-type="entity-link">Metadata</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Milestone.html" data-type="entity-link">Milestone</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NewMessageParam.html" data-type="entity-link">NewMessageParam</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Profile.html" data-type="entity-link">Profile</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Program.html" data-type="entity-link">Program</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProgramConfig.html" data-type="entity-link">ProgramConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProgramObj.html" data-type="entity-link">ProgramObj</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Project.html" data-type="entity-link">Project</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Question.html" data-type="entity-link">Question</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Question-1.html" data-type="entity-link">Question</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RegisterData.html" data-type="entity-link">RegisterData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Review.html" data-type="entity-link">Review</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Review-1.html" data-type="entity-link">Review</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReviewRating.html" data-type="entity-link">ReviewRating</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Submission.html" data-type="entity-link">Submission</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Task.html" data-type="entity-link">Task</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TeamMember.html" data-type="entity-link">TeamMember</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Timeline.html" data-type="entity-link">Timeline</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TodoItem.html" data-type="entity-link">TodoItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Topic.html" data-type="entity-link">Topic</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UnreadMessageParams.html" data-type="entity-link">UnreadMessageParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/User.html" data-type="entity-link">User</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserProfile.html" data-type="entity-link">UserProfile</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VerifyParams.html" data-type="entity-link">VerifyParams</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});