// setup filteredLocations array
// and initialize location id's
var filteredLocations = [];
for (var i = 0; i < locations.length; i++) {
    locations[i].id = i;
    var obj = locations[i];
    filteredLocations[i] = obj;
};

var theViewModel = null;

//(function () {
    var ViewModel = function() {
        var self = this;

        this.currentIdx = ko.observable(-1);

        this.filterText = ko.observable('');

        this.currentLocations = ko.observableArray();
        for (var i = 0; i < locations.length; i++) {
            var obj = locations[i];
            this.currentLocations.push(obj);
        };

//        this.mapLoadStatus = ko.observable('');
//        this.mapLoadStatus.subscribe(function (newValue) {
//            self.initMapCode();
//        });

        // map code
        // ********
        this.initMapCode = function() {
        };
        // end map code
        // ************

        this.ajaxGoogleMaps = function() {
            alert('in ajaxGoogleMaps');
        };

        this.ajaxWikipedia = function() {
            alert('in ajaxWikipedia');

            $.ajax({url: "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=description|images&titles=Alamo%20Mission%20in%20San%20Antonio"
                  , success: function(result) {
                        $(".wikipediaResults").html(result);
                }
            });
        };

        this.clickBurger = function() {
            // toggle leftpane to expand or contract it
            $('#leftpane').toggleClass('compressed');
            $('#leftpane').toggleClass('uncompressed');
            $('#detailarea').toggleClass('hide');
            if ($('#leftpane').hasClass('uncompressed')) {
                this.filterLocations();
            }
        };

        this.filterLocations = function () {
//            alert('in filterLocations');

            filteredLocations = [];
            this.currentLocations.removeAll();
            var j = 0;
            for (var i = 0; i < locations.length; i++) {
                if (locations[i].title.toLowerCase().indexOf(this.filterText().toLowerCase()) != -1
                    || this.filterText().trim() == '') {
                    var obj = locations[i];
                    filteredLocations[j++] = obj;
                    this.currentLocations.push(obj);
                };
            };
            gmap.showListings();
            this.selectLocationFromGmap();
        };

        this.selectLocation = function () {
            for (var i = 0; i < filteredLocations.length; i++) {
                $('#idx' + filteredLocations[i].id).removeClass('grayback').addClass('blackback')
                if (filteredLocations[i].title == this.title) {
                    gmap.current = i;
                }
            }
            $('#idx' + filteredLocations[gmap.current].id).addClass('grayback').removeClass('blackback')
            
            gmap.selectLocation();
        };

        this.selectLocationFromGmap = function () {
//            alert('in selectLocationFromGmap')
            for (var i = 0; i < filteredLocations.length; i++) {
                $('#idx' + filteredLocations[i].id).removeClass('grayback').addClass('blackback')
            }
            if (gmap.current != -1) {
                $('#idx' + filteredLocations[gmap.current].id).addClass('grayback').removeClass('blackback')
            }
        };

        this.init = function () {
            alert('in init');
        };

//        this.initMapCode();
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