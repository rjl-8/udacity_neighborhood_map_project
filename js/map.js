var gmap = {
    self : this,
    map : null,

    current : null,
    infoWindow : null,

    defaultIcon : null,
    highlightedIcon : null,

    initMap : function() {
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 29.426275, lng: -98.492547},
            zoom: 13
        });

        // Style the markers a bit. This will be our listing marker icon.
        defaultIcon = this.makeMarkerIcon('0091ff');

        // Create a "highlighted location" marker color for when the user
        // selects the location.
        highlightedIcon = this.makeMarkerIcon('FFFF24');

        infoWindow = new google.maps.InfoWindow();

        // Set up markers based on filteredLocations
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
                gmap.current = this.id;
                alert('marker clicked = ' + this.id);
                gmap.selectLocation();
                gmap.populateInfoWindow();
            });
        };

        this.showListings();

        // initiate the view model and ko bindings
        var theViewModel = new ViewModel();
        ko.applyBindings(theViewModel);
//        theViewModel.filter.subscribe(function (newValue) {
//            theViewModel.filterLocations();
//        });
    },

    showListings : function() {
        // Remove current markers from map
        for (var i = 0; i < locations.length; i++) {
            locations[i].marker.setMap(null);
        }

        var bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the marker
        for (var i = 0; i < filteredLocations.length; i++) {
            filteredLocations[i].marker.setMap(map);
            bounds.extend(filteredLocations[i].marker.position);
        }
        map.fitBounds(bounds);
    },

    selectLocation : function() {
        for (var i = 0; i < filteredLocations.length; i++) {
            filteredLocations[i].marker.setIcon(defaultIcon);
        }
        filteredLocations[this.current].marker.setIcon(highlightedIcon);
    },

    // This function populates the infowindow when the marker is clicked. We'll only allow
    // one infowindow which will open at the marker that is clicked, and populate based
    // on that markers position.
    populateInfoWindow : function() {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infoWindow.marker != filteredLocations[current].marker) {
            var theContent = '';
            theContent += '<div>' + filteredLocations[current].title + '</div>';
            theContent += '<button data-bind="click : ajaxGoogleMaps">+</button> GoogleMaps<br/>';
            theContent += '<button data-bind="click : ajaxWikipedia">+</button> Wikipedia<br/><div id="wikipediaResults"></div>';
            infoWindow.setContent('put content here, including html' + theContent);
            infoWindow.marker = filteredLocations[current].marker;
            // Make sure the marker property is cleared if the infowindow is closed.
            infoWindow.addListener('closeclick', function() {
                infoWindow.marker = null;
            });
            // Open the infowindow on the correct marker.
            infoWindow.open(map, filteredLocations[current].marker);
        }  
    },

    populateInfoWindow : function(marker) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infoWindow.marker != marker) {
            var theContent = '';
            theContent += '<div>' + '</div>';
            theContent += '<button data-bind="click : ajaxGoogleMaps">+</button> GoogleMaps<br/>';
            theContent += '<button data-bind="click : ajaxWikipedia">+</button> Wikipedia<br/><div id="wikipediaResults"></div>';
            infoWindow.setContent('put content here, including html' + theContent);
            infoWindow.marker = marker;
            // Make sure the marker property is cleared if the infowindow is closed.
            infoWindow.addListener('closeclick', function() {
                infoWindow.marker = null;
            });
            // Open the infowindow on the correct marker.
            infoWindow.open(map, marker);
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
