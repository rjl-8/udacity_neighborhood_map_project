//(function () {
    var ViewModel = function(inLocations) {
        var self = this;

        var filteredLocations = [];
        for (var i = 0; i < inLocations.length; i++) {
            var obj = inLocations[i];
            filteredLocations[i] = obj;
        };

        var markers = [];

        var filter = ko.observable('');

//        this.mapLoadStatus = ko.observable('');
//        this.mapLoadStatus.subscribe(function (newValue) {
//            self.initMapCode();
//        });

        // map code
        // ********
        this.initMapCode = function() {


//            self.showListings();
        };

        // end map code
        // ************



        this.clickBurger = function() {
            // toggle leftpane to expand or contract it
            alert('clickBurger!');
        };

        this.filterLocations = function () {
            alert('');
        };

        this.init = function () {
            alert('in init');
        };

        this.initMapCode();
    };

//    var theViewModel = new ViewModel(locations);
/*    
    theViewModel.mapLoadStatus.subscribe(function (newValue) {
        theViewModel.initMapCode();
    });
*/
//    ko.applyBindings(theViewModel);
//    theViewModel.mapLoadStatus('something');
//}());