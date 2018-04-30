var populateInfoWindow = function(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != locations[current].marker) {
        infowindow.setContent('put content here, including html');
        infowindow.marker = locations[current].marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
        });
        // Open the infowindow on the correct marker.
        infowindow.open(map, locations[current].marker);
    }  
};


var gmap = {
    self : this,
    map : null,

    current : null,
    infoWindow : null,

//    markers : [],

    initMap : function() {
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 29.426275, lng: -98.492547},
            zoom: 13
        });

        // Style the markers a bit. This will be our listing marker icon.
        var defaultIcon = this.makeMarkerIcon('0091ff');

        // Create a "highlighted location" marker color for when the user
        // mouses over the marker.
        var highlightedIcon = this.makeMarkerIcon('FFFF24');

        infoWindow = new google.maps.InfoWindow();

        // Set up markers based on locations
        for (var i = 0; i < locations.length; i++) {
            // Get the position from the location array.
            var position = locations[i].location;
            var title = locations[i].title;
            // Create a marker per location, and put into markers array.
            locations[i].marker = new google.maps.Marker({
                position: position,
                title: title,
                animation: google.maps.Animation.DROP,
                icon: defaultIcon,
                id: i
            });
            
            // Create an onclick event to open the large infowindow at each marker.
            locations[i].marker.addListener('click', function() {
                current = this.id;
                ViewModel.populateInfoWindow(this, infoWindow);
            });
        };

        this.showListings();

        // initiate the view model and ko bindings
        var theViewModel = new ViewModel(locations);
        ko.applyBindings(theViewModel);
    },

    showListings : function() {
        var bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the marker
        for (var i = 0; i < locations.length; i++) {
            locations[i].marker.setMap(map);
            bounds.extend(locations[i].marker.position);
        }
        map.fitBounds(bounds);
    },

    // This function populates the infowindow when the marker is clicked. We'll only allow
    // one infowindow which will open at the marker that is clicked, and populate based
    // on that markers position.
//    populateInfoWindow : function(marker, infoWindow) {
    populateInfoWindow : function() {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infoWindow.marker != locations[current].marker) {
            infoWindow.setContent('put content here, including html');
            infoWindow.marker = locations[current].marker;
            // Make sure the marker property is cleared if the infowindow is closed.
            infoWindow.addListener('closeclick', function() {
                infoWindow.marker = null;
            });
            // Open the infowindow on the correct marker.
            infoWindow.open(map, locations[current].marker);
        }  
    },

    // This function takes in a COLOR, and then creates a new marker
    // icon of that color. The icon will be 21 px wide by 34 high, have an origin
    // of 0, 0 and be anchored at 10, 34).
    makeMarkerIcon : function(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21,34));
        return markerImage;
    }

}
