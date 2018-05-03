// setup filteredLocations array
// and initialize location id's
var filteredLocations = [];
for (var i = 0; i < locations.length; i++) {
    locations[i].id = i;
    var obj = locations[i];
    filteredLocations[i] = obj;
};

// the variable to be the viewmodel
var theViewModel = null;

// the viewmodel object
var ViewModel = function() {
    this.filterText = ko.observable('');

    this.currentLocations = ko.observableArray();
    for (var i = 0; i < locations.length; i++) {
        var obj = locations[i];
        this.currentLocations.push(obj);
    };

    // toggle leftpane to expand or contract it
    this.clickBurger = function() {
        $('#leftpane').toggleClass('compressed');
        $('#leftpane').toggleClass('uncompressed');
        $('#detailarea').toggleClass('hide');
        if ($('#leftpane').hasClass('uncompressed')) {
            this.filterLocations();
        }
    };

    // filter locations array based on text filter
    this.filterLocations = function () {
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

    // perform actions based on selection of a location, either through
    // marker or list
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

    // perform actions based on selection of a location, either through
    // marker or list - these are the actions done on the list based on 
    // marker selection
    this.selectLocationFromGmap = function () {
        for (var i = 0; i < filteredLocations.length; i++) {
            $('#idx' + filteredLocations[i].id).removeClass('grayback').addClass('blackback')
        }
        if (gmap.current != null) {
            $('#idx' + filteredLocations[gmap.current].id).addClass('grayback').removeClass('blackback')
        }
    };
};
