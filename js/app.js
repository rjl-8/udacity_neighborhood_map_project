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

        this.mapLoadStatus = ko.observable('');
        this.mapLoadStatus.subscribe(function (newValue) {
            self.initMapCode();
        });

        this.initMapCode = function() {
            alert('initializing MapCode');

            // Style the markers a bit. This will be our listing marker icon.
            var defaultIcon = makeMarkerIcon('0091ff');

            // Create a "highlighted location" marker color for when the user
            // mouses over the marker.
            var highlightedIcon = makeMarkerIcon('FFFF24');

            var infoWindow = new google.maps.InfoWindow();

            // Set up markers based on locations
            for (var i = 0; i < locations.length; i++) {
                // Get the position from the location array.
                var position = locations[i].location;
                var title = locations[i].title;
                // Create a marker per location, and put into markers array.
                var marker = new google.maps.Marker({
                    position: position,
                    title: title,
                    animation: google.maps.Animation.DROP,
                    icon: defaultIcon,
                    id: i
                });
                // Push the marker to our array of markers.
                markers.push(marker);
                // Create an onclick event to open the large infowindow at each marker.
/*                
                marker.addListener('click', function() {
                    populateInfoWindow(this, infoWindow);
                });
*/
            };

            self.showListings();
        };

function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent('');
        infowindow.marker = marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
        });
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
    }  
};

this.showListings = function() {
//    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
//      bounds.extend(markers[i].position);
    }
//    map.fitBounds(bounds);
};

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21,34));
    return markerImage;
};




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
    };

    var theViewModel = new ViewModel(locations);
/*    
    theViewModel.mapLoadStatus.subscribe(function (newValue) {
        theViewModel.initMapCode();
    });
*/
    ko.applyBindings(theViewModel);
//    theViewModel.mapLoadStatus('something');
//}());