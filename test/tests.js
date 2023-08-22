/* eslint-disable no-undef*/
describe('VWO Forwarder', function () {
    // -------------------DO NOT EDIT ANYTHING BELOW THIS LINE-----------------------
    var MessageType = {
            SessionStart: 1,
            SessionEnd: 2,
            PageView: 3,
            PageEvent: 4,
            CrashReport: 5,
            OptOut: 6,
            AppStateTransition: 10,
            Profile: 14,
            Commerce: 16
        },
        EventType = {
            Unknown: 0,
            Navigation: 1,
            Location: 2,
            Search: 3,
            Transaction: 4,
            UserContent: 5,
            UserPreference: 6,
            Social: 7,
            Other: 8,
            Media: 9,
            getName: function() {
                return 'blahblah';
            }
        },
        ProductActionType = {
            Unknown: 0,
            AddToCart: 1,
            RemoveFromCart: 2,
            Checkout: 3,
            CheckoutOption: 4,
            Click: 5,
            ViewDetail: 6,
            Purchase: 7,
            Refund: 8,
            AddToWishlist: 9,
            RemoveFromWishlist: 10
        },
        IdentityType = {
            Other: 0,
            CustomerId: 1,
            Facebook: 2,
            Twitter: 3,
            Google: 4,
            Microsoft: 5,
            Yahoo: 6,
            Email: 7,
            Alias: 8,
            FacebookCustomAudienceId: 9,
        },
        ReportingService = function () {
            var self = this;

            this.id = null;
            this.event = null;

            this.cb = function (forwarder, event) {
                self.id = forwarder.id;
                self.event = event;
            };

            this.reset = function () {
                this.id = null;
                this.event = null;
            };
        },
        reportService = new ReportingService();

// -------------------DO NOT EDIT ANYTHING ABOVE THIS LINE-----------------------
// -------------------START EDITING BELOW:-----------------------
// -------------------mParticle stubs - Add any additional stubbing to our methods as needed-----------------------
    // mParticle.Identity = {
    //     getCurrentUser: function() {
    //         return {
    //             getMPID: function() {
    //                 return '123';
    //             }

    //         };
    //     }
    // };
// -------------------START EDITING BELOW:-----------------------
    var VWOMockForwarder = function() {
        var self = this;
        this.resultQueue = [];
        this.event = function(eventName, eventProperties = null, metaData = null) {
            self.resultQueue.push({
                eventName,
                eventProperties,
                metaData
            })
        }
        this.visitor = function(visitorAttributes, metaData = null) {
            self.resultQueue.push({
                visitorAttributes,
                metaData
            })
        }
    };

    beforeEach(function() {
        window.VWO = new VWOMockForwarder();
        // Include any specific settings that is required for initializing your SDK here
        var sdkSettings = {
            accountId: 654331, // Mandatory field
            settingsTolerance: 2000,
            libraryTolerance: 2500,
            useExistingJquery: false,
            includeVWOSmartCode: true
        };
        // You may require userAttributes or userIdentities to be passed into initialization
        var userAttributes = {
            color: 'green'
        };
        var userIdentities = [{
            Identity: 'customerId',
            Type: IdentityType.CustomerId
        }, {
            Identity: 'email',
            Type: IdentityType.Email
        }, {
            Identity: 'facebook',
            Type: IdentityType.Facebook
        }];

        mParticle.forwarder.init(sdkSettings, reportService.cb, true, null, userAttributes, userIdentities);
    });
    describe('Custom Events', function() {
        it('should track custom event', function(done) {
            mParticle.forwarder.process({
                EventDataType: MessageType.PageEvent,
                EventName: 'Test Event',
                EventAttributes: {
                    label: 'label',
                    value: 200,
                    category: 'category'
                }
            });
            
            window.VWO.resultQueue[0].eventName.should.equal("mparticle.Test Event");
            window.VWO.resultQueue[0].eventProperties.should.eql({
                label: 'label',
                value: 200,
                category: 'category'
            });
            window.VWO.resultQueue[0].metaData.should.eql({
                ogName: 'Test Event',
                source: 'mparticle.web'
            });
            
            done();
        });    
    })

    describe('User Attributes', function() {
        it('should set visitor attributes on setting user attribute', function(done) {
            mParticle.forwarder.setUserAttribute('key', 'value');
            window.VWO.resultQueue[0].visitorAttributes.should.eql({
                'mparticle.key': 'value'
            });
            window.VWO.resultQueue[0].metaData.should.eql({
                source: 'mparticle.web'
            });
            done();
        });
    })
    
});
