var VWOKit = (function (exports) {
    'use strict';

    function Common() {}

    var common = Common;

    function CommerceHandler(common) {
        this.common = common || {};
    }

    CommerceHandler.prototype.logCommerceEvent = function(event) {
        /*
            Sample ecommerce event schema:
            {
                CurrencyCode: 'USD',
                DeviceId:'a80eea1c-57f5-4f84-815e-06fe971b6ef2', // MP generated
                EventAttributes: { key1: 'value1', key2: 'value2' },
                EventType: 16,
                EventCategory: 10, // (This is an add product to cart event, see below for additional ecommerce EventCategories)
                EventName: "eCommerce - AddToCart",
                MPID: "8278431810143183490",
                ProductAction: {
                    Affiliation: 'aff1',
                    CouponCode: 'coupon',
                    ProductActionType: 7,
                    ProductList: [
                        {
                            Attributes: { prodKey1: 'prodValue1', prodKey2: 'prodValue2' },
                            Brand: 'Apple',
                            Category: 'phones',
                            CouponCode: 'coupon1',
                            Name: 'iPhone',
                            Price: '600',
                            Quantity: 2,
                            Sku: "SKU123",
                            TotalAmount: 1200,
                            Variant: '64GB'
                        }
                    ],
                    TransactionId: "tid1",
                    ShippingAmount: 10,
                    TaxAmount: 5,
                    TotalAmount: 1215,
                },
                UserAttributes: { userKey1: 'userValue1', userKey2: 'userValue2' }
                UserIdentities: [
                    {
                        Identity: 'test@gmail.com', Type: 7
                    }
                ]
            }

            If your SDK has specific ways to log different eCommerce events, see below for
            mParticle's additional ecommerce EventCategory types:

                10: ProductAddToCart, (as shown above)
                11: ProductRemoveFromCart,
                12: ProductCheckout,
                13: ProductCheckoutOption,
                14: ProductClick,
                15: ProductViewDetail,
                16: ProductPurchase,
                17: ProductRefund,
                18: PromotionView,
                19: PromotionClick,
                20: ProductAddToWishlist,
                21: ProductRemoveFromWishlist,
                22: ProductImpression
            */
    };

    var commerceHandler = CommerceHandler;

    function prependSource (name) {
        return `mparticle.${name}`;
    }

    function formatAttributes(attributes) {
        var formattedAttributes = {};
        for (var key in attributes) {
            var sanitisedAttributeKey = prependSource(key);
            formattedAttributes[sanitisedAttributeKey] = attributes[key];
        }
        return formattedAttributes;
    }

    var helpers = {
        formatAttributes,
        prependSource
    };

    function triggerVWOEvent(event) {
        
        var vwoMetaObject = {
            source: 'mparticle.web'
        };

        var attributes = event.EventAttributes || {};
        if (event.CustomFlags && Object.keys(event.CustomFlags).length) {
            attributes = {
                ...attributes,
                ...event.CustomFlags
            };
        } 

        window.VWO = window.VWO || [];
        window.VWO.event = window.VWO.event || function () {window.VWO.push(["event"].concat([].slice.call(arguments)));};
        vwoMetaObject['ogName'] = event.EventName;
        var formatedEventName = helpers.prependSource(event.EventName);
        window.VWO.event(formatedEventName, event.EventAttributes, vwoMetaObject);
            
    }

    function EventHandler(common) {
        this.common = common || {};
    }

    EventHandler.prototype.logEvent = function(event) {
        triggerVWOEvent(event);
    };

    // Not required for our use case

    EventHandler.prototype.logError = function(event) {};
    EventHandler.prototype.logPageView = function(event) {};

    var eventHandler = EventHandler;

    /*
    The 'mParticleUser' is an object with methods get user Identities and set/get user attributes
    Partners can determine what userIds are available to use in their SDK
    Call mParticleUser.getUserIdentities() to return an object of userIdentities --> { userIdentities: {customerid: '1234', email: 'email@gmail.com'} }
    For more identity types, see http://docs.mparticle.com/developers/sdk/javascript/identity#allowed-identity-types
    Call mParticleUser.getMPID() to get mParticle ID
    For any additional methods, see http://docs.mparticle.com/developers/sdk/javascript/apidocs/classes/mParticle.Identity.getCurrentUser().html
    */

    /*
    identityApiRequest has the schema:
    {
      userIdentities: {
        customerid: '123',
        email: 'abc'
      }
    }
    For more userIdentity types, see http://docs.mparticle.com/developers/sdk/javascript/identity#allowed-identity-types
    */

    function IdentityHandler(common) {
        this.common = common || {};
    }
    IdentityHandler.prototype.onUserIdentified = function(mParticleUser) {};
    IdentityHandler.prototype.onIdentifyComplete = function(
        mParticleUser,
        identityApiRequest
    ) {};
    IdentityHandler.prototype.onLoginComplete = function(
        mParticleUser,
        identityApiRequest
    ) {};
    IdentityHandler.prototype.onLogoutComplete = function(
        mParticleUser,
        identityApiRequest
    ) {};
    IdentityHandler.prototype.onModifyComplete = function(
        mParticleUser,
        identityApiRequest
    ) {};

    /*  In previous versions of the mParticle web SDK, setting user identities on
        kits is only reachable via the onSetUserIdentity method below. We recommend
        filling out `onSetUserIdentity` for maximum compatibility
    */
    IdentityHandler.prototype.onSetUserIdentity = function(
        forwarderSettings,
        id,
        type
    ) {};

    var identityHandler = IdentityHandler;

    var initialization = {
        name: 'VWO',
        initForwarder: function(forwarderSettings, testMode, userAttributes, userIdentities, processEvent, eventQueue, isInitialized, common, appVersion, appName, customFlags, clientId) {
            /* `forwarderSettings` contains your SDK specific settings such as apiKey that your customer needs in order to initialize your SDK properly */
            if(forwarderSettings.includeVWOSmartCode){
                if (forwarderSettings.accountId) {
                    window._vwo_code=window._vwo_code || (function() {
                        var account_id=forwarderSettings.accountId,
                        version= 1.5,
                        settings_tolerance=forwarderSettings.settingsTolerance || 2000,
                        library_tolerance=forwarderSettings.libraryTolerance || 2500,
                        use_existing_jquery=forwarderSettings.useExistingJquery || false,
                        is_spa=forwarderSettings.is_spa || 1,
                        hide_element='body',
                        hide_element_style = 'opacity:0 !important;filter:alpha(opacity=0) !important;background:none !important',
                        /* DO NOT EDIT BELOW THIS LINE */
                        f=false,d=document,vwoCodeEl=d.querySelector('#vwoCode'),code={use_existing_jquery:function(){return use_existing_jquery},library_tolerance:function(){return library_tolerance},hide_element_style:function(){return '{'+hide_element_style+'}'},finish:function(){if(!f){f=true;var e=d.getElementById('_vis_opt_path_hides');if(e)e.parentNode.removeChild(e);}},finished:function(){return f},load:function(e){var t=d.createElement('script');t.fetchPriority='high';t.src=e;t.type='text/javascript';t.innerText;t.onerror=function(){_vwo_code.finish();};d.getElementsByTagName('head')[0].appendChild(t);},getVersion:function(){return version},getMatchedCookies:function(e){var t=[];if(document.cookie){t=document.cookie.match(e)||[];}return t},getCombinationCookie:function(){var e=code.getMatchedCookies(/(?:^|;)\s?(_vis_opt_exp_\d+_combi=[^;$]*)/gi);e=e.map(function(e){try{var t=decodeURIComponent(e);if(!/_vis_opt_exp_\d+_combi=(?:\d+,?)+\s*$/.test(t)){return ''}return t}catch(e){return ''}});var i=[];e.forEach(function(e){var t=e.match(/([\d,]+)/g);t&&i.push(t.join('-'));});return i.join('|')},init:function(){if(d.URL.indexOf('__vwo_disable__')>-1)return;window.settings_timer=setTimeout(function(){_vwo_code.finish();},settings_tolerance);var e=d.createElement('style'),t=hide_element+'{'+hide_element_style+'}',i=d.getElementsByTagName('head')[0];e.setAttribute('id','_vis_opt_path_hides');vwoCodeEl&&e.setAttribute('nonce',vwoCodeEl.nonce);e.setAttribute('type','text/css');if(e.styleSheet)e.styleSheet.cssText=t;else e.appendChild(d.createTextNode(t));i.appendChild(e);var n=this.getCombinationCookie();this.load('https://dev.visualwebsiteoptimizer.com/j.php?a='+account_id+'&u='+encodeURIComponent(d.URL)+'&f='+ +is_spa+'&vn='+version+(n?'&c='+n:''));return settings_timer}};window._vwo_settings_timer = code.init();return code;}());
                } else {
                    console.error('Please update proper Event-Arch account to proceed with VWO');
                }
            }
        }
    };

    var initialization_1 = initialization;

    var sessionHandler = {
        onSessionStart: function(event) {
            
        },
        onSessionEnd: function(event) {

        }
    };

    var sessionHandler_1 = sessionHandler;

    function updateVWOVisitorAttributes(key, value) {
        var attributes = {};
        attributes[key] = value;
        var vwoMetaObject = {
            source: 'mparticle.web'
        };
        
        window.VWO = window.VWO || [];
        window.VWO.visitor = window.VWO.visitor || function () {window.VWO.push(["visitor"].concat([].slice.call(arguments)));};
        window.VWO.visitor(attributes, vwoMetaObject);

    }

    function UserAttributeHandler(common) {
        this.common = common || {};
    }

    UserAttributeHandler.prototype.onSetUserAttribute = function(
        key,
        value,
        mParticleUser
    ) {
        var formatedKey = helpers.prependSource(key);
        updateVWOVisitorAttributes(formatedKey, value);
    };

    // Not required

    UserAttributeHandler.prototype.onRemoveUserAttribute = function(
        key,
        mParticleUser
    ) {};

    UserAttributeHandler.prototype.onConsentStateUpdated = function(
        oldState,
        newState,
        mParticleUser
    ) {};

    var userAttributeHandler = UserAttributeHandler;

    // =============== REACH OUT TO MPARTICLE IF YOU HAVE ANY QUESTIONS ===============
    //
    //  Copyright 2018 mParticle, Inc.
    //
    //  Licensed under the Apache License, Version 2.0 (the "License");
    //  you may not use this file except in compliance with the License.
    //  You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    //  Unless required by applicable law or agreed to in writing, software
    //  distributed under the License is distributed on an "AS IS" BASIS,
    //  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    //  See the License for the specific language governing permissions and
    //  limitations under the License.









    var name = initialization_1.name,
        moduleId = initialization_1.moduleId,
        MessageType = {
            SessionStart: 1,
            SessionEnd: 2,
            PageView: 3,
            PageEvent: 4,
            CrashReport: 5,
            OptOut: 6,
            Commerce: 16,
            Media: 20,
        };

    var constructor = function() {
        var self = this,
            isInitialized = false,
            forwarderSettings,
            reportingService,
            eventQueue = [];

        self.name = initialization_1.name;
        self.moduleId = initialization_1.moduleId;
        self.common = new common();

        function initForwarder(
            settings,
            service,
            testMode,
            trackerId,
            userAttributes,
            userIdentities,
            appVersion,
            appName,
            customFlags,
            clientId
        ) {
            forwarderSettings = settings;

            if (
                typeof window !== 'undefined' &&
                window.mParticle.isTestEnvironment
            ) {
                reportingService = function() {};
            } else {
                reportingService = service;
            }

            try {
                initialization_1.initForwarder(
                    settings,
                    testMode,
                    userAttributes,
                    userIdentities,
                    processEvent,
                    eventQueue,
                    isInitialized,
                    self.common,
                    appVersion,
                    appName,
                    customFlags,
                    clientId
                );
                self.eventHandler = new eventHandler(self.common);
                self.identityHandler = new identityHandler(self.common);
                self.userAttributeHandler = new userAttributeHandler(self.common);
                self.commerceHandler = new commerceHandler(self.common);

                isInitialized = true;
            } catch (e) {
                console.log('Failed to initialize ' + name + ' - ' + e);
            }
        }

        function processEvent(event) {
            var reportEvent = false;
            if (isInitialized) {
                try {
                    if (event.EventDataType === MessageType.SessionStart) {
                        reportEvent = logSessionStart(event);
                    } else if (event.EventDataType === MessageType.SessionEnd) {
                        reportEvent = logSessionEnd(event);
                    } else if (event.EventDataType === MessageType.CrashReport) {
                        reportEvent = logError(event);
                    } else if (event.EventDataType === MessageType.PageView) {
                        reportEvent = logPageView(event);
                    } else if (event.EventDataType === MessageType.Commerce) {
                        reportEvent = logEcommerceEvent(event);
                    } else if (event.EventDataType === MessageType.PageEvent) {
                        reportEvent = logEvent(event);
                    } else if (event.EventDataType === MessageType.Media) {
                        // Kits should just treat Media Events as generic Events
                        reportEvent = logEvent(event);
                    }
                    if (reportEvent === true && reportingService) {
                        reportingService(self, event);
                        return 'Successfully sent to ' + name;
                    } else {
                        return (
                            'Error logging event or event type not supported on forwarder ' +
                            name
                        );
                    }
                } catch (e) {
                    return 'Failed to send to ' + name + ' ' + e;
                }
            } else {
                eventQueue.push(event);
                return (
                    "Can't send to forwarder " +
                    name +
                    ', not initialized. Event added to queue.'
                );
            }
        }

        function logSessionStart(event) {
            try {
                sessionHandler_1.onSessionStart(event);
                return true;
            } catch (e) {
                return {
                    error: 'Error starting session on forwarder ' + name + '; ' + e,
                };
            }
        }

        function logSessionEnd(event) {
            try {
                sessionHandler_1.onSessionEnd(event);
                return true;
            } catch (e) {
                return {
                    error: 'Error ending session on forwarder ' + name + '; ' + e,
                };
            }
        }

        function logError(event) {
            try {
                self.eventHandler.logError(event);
                return true;
            } catch (e) {
                return {
                    error: 'Error logging error on forwarder ' + name + '; ' + e,
                };
            }
        }

        function logPageView(event) {
            try {
                self.eventHandler.logPageView(event);
                return true;
            } catch (e) {
                return {
                    error:
                        'Error logging page view on forwarder ' + name + '; ' + e,
                };
            }
        }

        function logEvent(event) {
            try {
                self.eventHandler.logEvent(event);
                return true;
            } catch (e) {
                return {
                    error: 'Error logging event on forwarder ' + name + '; ' + e,
                };
            }
        }

        function logEcommerceEvent(event) {
            try {
                self.commerceHandler.logCommerceEvent(event);
                return true;
            } catch (e) {
                return {
                    error:
                        'Error logging purchase event on forwarder ' +
                        name +
                        '; ' +
                        e,
                };
            }
        }

        function setUserAttribute(key, value) {
            if (isInitialized) {
                try {
                    self.userAttributeHandler.onSetUserAttribute(
                        key,
                        value,
                        forwarderSettings
                    );
                    return 'Successfully set user attribute on forwarder ' + name;
                } catch (e) {
                    return (
                        'Error setting user attribute on forwarder ' +
                        name +
                        '; ' +
                        e
                    );
                }
            } else {
                return (
                    "Can't set user attribute on forwarder " +
                    name +
                    ', not initialized'
                );
            }
        }

        function removeUserAttribute(key) {
            if (isInitialized) {
                try {
                    self.userAttributeHandler.onRemoveUserAttribute(
                        key,
                        forwarderSettings
                    );
                    return (
                        'Successfully removed user attribute on forwarder ' + name
                    );
                } catch (e) {
                    return (
                        'Error removing user attribute on forwarder ' +
                        name +
                        '; ' +
                        e
                    );
                }
            } else {
                return (
                    "Can't remove user attribute on forwarder " +
                    name +
                    ', not initialized'
                );
            }
        }

        function setUserIdentity(id, type) {
            if (isInitialized) {
                try {
                    self.identityHandler.onSetUserIdentity(
                        forwarderSettings,
                        id,
                        type
                    );
                    return 'Successfully set user Identity on forwarder ' + name;
                } catch (e) {
                    return (
                        'Error removing user attribute on forwarder ' +
                        name +
                        '; ' +
                        e
                    );
                }
            } else {
                return (
                    "Can't call setUserIdentity on forwarder " +
                    name +
                    ', not initialized'
                );
            }
        }

        function onUserIdentified(user) {
            if (isInitialized) {
                try {
                    self.identityHandler.onUserIdentified(user);

                    return (
                        'Successfully called onUserIdentified on forwarder ' + name
                    );
                } catch (e) {
                    return {
                        error:
                            'Error calling onUserIdentified on forwarder ' +
                            name +
                            '; ' +
                            e,
                    };
                }
            } else {
                return (
                    "Can't set new user identities on forwader  " +
                    name +
                    ', not initialized'
                );
            }
        }

        function onIdentifyComplete(user, filteredIdentityRequest) {
            if (isInitialized) {
                try {
                    self.identityHandler.onIdentifyComplete(
                        user,
                        filteredIdentityRequest
                    );

                    return (
                        'Successfully called onIdentifyComplete on forwarder ' +
                        name
                    );
                } catch (e) {
                    return {
                        error:
                            'Error calling onIdentifyComplete on forwarder ' +
                            name +
                            '; ' +
                            e,
                    };
                }
            } else {
                return (
                    "Can't call onIdentifyCompleted on forwader  " +
                    name +
                    ', not initialized'
                );
            }
        }

        function onLoginComplete(user, filteredIdentityRequest) {
            if (isInitialized) {
                try {
                    self.identityHandler.onLoginComplete(
                        user,
                        filteredIdentityRequest
                    );

                    return (
                        'Successfully called onLoginComplete on forwarder ' + name
                    );
                } catch (e) {
                    return {
                        error:
                            'Error calling onLoginComplete on forwarder ' +
                            name +
                            '; ' +
                            e,
                    };
                }
            } else {
                return (
                    "Can't call onLoginComplete on forwader  " +
                    name +
                    ', not initialized'
                );
            }
        }

        function onLogoutComplete(user, filteredIdentityRequest) {
            if (isInitialized) {
                try {
                    self.identityHandler.onLogoutComplete(
                        user,
                        filteredIdentityRequest
                    );

                    return (
                        'Successfully called onLogoutComplete on forwarder ' + name
                    );
                } catch (e) {
                    return {
                        error:
                            'Error calling onLogoutComplete on forwarder ' +
                            name +
                            '; ' +
                            e,
                    };
                }
            } else {
                return (
                    "Can't call onLogoutComplete on forwader  " +
                    name +
                    ', not initialized'
                );
            }
        }

        function onModifyComplete(user, filteredIdentityRequest) {
            if (isInitialized) {
                try {
                    self.identityHandler.onModifyComplete(
                        user,
                        filteredIdentityRequest
                    );

                    return (
                        'Successfully called onModifyComplete on forwarder ' + name
                    );
                } catch (e) {
                    return {
                        error:
                            'Error calling onModifyComplete on forwarder ' +
                            name +
                            '; ' +
                            e,
                    };
                }
            } else {
                return (
                    "Can't call onModifyComplete on forwader  " +
                    name +
                    ', not initialized'
                );
            }
        }

        function setOptOut(isOptingOutBoolean) {
            if (isInitialized) {
                try {
                    self.initialization.setOptOut(isOptingOutBoolean);

                    return 'Successfully called setOptOut on forwarder ' + name;
                } catch (e) {
                    return {
                        error:
                            'Error calling setOptOut on forwarder ' +
                            name +
                            '; ' +
                            e,
                    };
                }
            } else {
                return (
                    "Can't call setOptOut on forwader  " +
                    name +
                    ', not initialized'
                );
            }
        }

        this.init = initForwarder;
        this.process = processEvent;
        this.setUserAttribute = setUserAttribute;
        this.removeUserAttribute = removeUserAttribute;
        this.onUserIdentified = onUserIdentified;
        this.setUserIdentity = setUserIdentity;
        this.onIdentifyComplete = onIdentifyComplete;
        this.onLoginComplete = onLoginComplete;
        this.onLogoutComplete = onLogoutComplete;
        this.onModifyComplete = onModifyComplete;
        this.setOptOut = setOptOut;
    };

    function getId() {
        return moduleId;
    }

    function isObject(val) {
        return (
            val != null && typeof val === 'object' && Array.isArray(val) === false
        );
    }

    function register(config) {
        if (!config) {
            console.log(
                'You must pass a config object to register the kit ' + name
            );
            return;
        }

        if (!isObject(config)) {
            console.log(
                "'config' must be an object. You passed in a " + typeof config
            );
            return;
        }

        if (isObject(config.kits)) {
            config.kits[name] = {
                constructor: constructor,
            };
        } else {
            config.kits = {};
            config.kits[name] = {
                constructor: constructor,
            };
        }
        console.log(
            'Successfully registered ' + name + ' to your mParticle configuration'
        );
    }

    if (typeof window !== 'undefined') {
        if (window && window.mParticle && window.mParticle.addForwarder) {
            window.mParticle.addForwarder({
                name: name,
                constructor: constructor,
                getId: getId,
            });
        }
    }

    var webKitWrapper = {
        register: register,
    };
    var webKitWrapper_1 = webKitWrapper.register;

    exports.default = webKitWrapper;
    exports.register = webKitWrapper_1;

    return exports;

}({}));
