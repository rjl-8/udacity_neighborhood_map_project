function logResults(jsonresults) {
    console.log(jsonresults)
}

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
        defaultIcon = this.makeMarkerIcon('ff3333');

        // Create a "highlighted location" marker color for when the user
        // selects the location.
        highlightedIcon = this.makeMarkerIcon('0091ff');

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
                gmap.selectLocation();
            });
        };

        this.showListings();

        // initiate the view model and ko bindings
        theViewModel = new ViewModel();
        ko.applyBindings(theViewModel);
//        theViewModel.filter.subscribe(function (newValue) {
//            theViewModel.filterLocations();
//        });
    },

    showListings : function() {
//        alert('in gmap.showListings')
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
        gmap.populateInfoWindow();

        theViewModel.selectLocationFromGmap();
    },

    // This function populates the infowindow when the marker is clicked. We'll only allow
    // one infowindow which will open at the marker that is clicked, and populate based
    // on that markers position.
    populateInfoWindow : function() {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infoWindow.marker != filteredLocations[gmap.getCurrentIdx()].marker) {
            var theContent = '';
            theContent += '<div>' + filteredLocations[gmap.getCurrentIdx()].title + '</div>';
//            theContent += '<button data-bind="click : ajaxGoogleMaps">+</button> GoogleMaps<br/>';
//            theContent += '<button data-bind="click : ajaxWikipedia">+</button> Wikipedia<br/><div id="wikipediaResults"></div>';
            theContent += '<button id="btnAjaxGoogleMaps">+</button> GoogleMaps<br/><div id="googleMapsResults"></div>';
            theContent += '<button id="btnAjaxWikipedia">+</button> Wikipedia<br/><div id="wikipediaResults"></div>';
            infoWindow.setContent('put content here, including html' + theContent);
            infoWindow.marker = filteredLocations[gmap.getCurrentIdx()].marker;
            // Make sure the marker property is cleared if the infowindow is closed.
            infoWindow.addListener('closeclick', function() {
                infoWindow.marker = null;
            });
            // Open the infowindow on the correct marker.
            infoWindow.open(map, filteredLocations[gmap.getCurrentIdx()].marker);
            document.getElementById('btnAjaxWikipedia').addEventListener('click', function () {
                alert('in ajaxWikipedia');
                var thehtml = 'View page in <a target="_blank" href="https://en.wikipedia.org/wiki/' + filteredLocations[gmap.getCurrentIdx()].wikipediaTitle + '">WikiPedia</a>';

/*
$.ajax( {
    url: 'https://en.wikipedia.org/w/api.php',
    data: {
        action: 'query',
        meta: 'userinfo',
        format: 'json',
        origin: 'https://www.mediawiki.org'
    },
    xhrFields: {
        withCredentials: true
    },
    dataType: 'json'
} ).done( function ( data ) {
    alert( 'Foreign user ' + data.query.userinfo.name +
        ' (ID ' + data.query.userinfo.id + ')' );
} );
*/
/*
$.ajax( {
    url: 'https://en.wikipedia.org/w/api.php',
    data: {
        action: 'query',
        prop: 'description|images',
        format: 'json',
        titles: filteredLocations[gmap.getCurrentIdx()].wikipediaTitle,
        origin: 'http://localhost/udacity/FEND/advintsites/proj2/'
    },
    xhrFields: {
        withCredentials: true
    },
    dataType: 'json'
} ).done( function ( data ) {
    alert( 'successtest' );
} );
*/

/*
function logResults(json){
  console.log(json);
}

$.ajax({
  url: 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=description|images&titles=' + filteredLocations[gmap.getCurrentIdx()].wikipediaTitle,
  dataType: "jsonp",
  jsonpCallback: "logResults"
});
*/
$.ajax({
  url: 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=description|images&titles=' + filteredLocations[gmap.getCurrentIdx()].wikipediaTitle,
  dataType: "jsonp",
  jsonpCallback: "logResults"
});

                var ajaxSettings = {
                    xhrFields: {withCredentials: true},
                    success: function(result) {
                        alert('success')
//                            thehtml += '<br />Description: ' + result.query.pages.143087.description + '<br/>';
//                            if (result.query.pages.143087.images[0]) {
//                                thehtml += '"https://en.wikipedia.org/wiki/' + result.query.pages.143087.images[0].title.replace(' ', '_') + '"'
//                            }
                        
                    },
                    error: function(result) {
                        thehtml += '<br />Error retrieving Wikipedia data';
                    }
                }
                // temporary position of this line
//                $("#wikipediaResults").html(thehtml);
//                $.ajax('https://en.wikipedia.org/w/api.php?action=query&format=json&prop=description|images&titles=' + filteredLocations[gmap.getCurrentIdx()].wikipediaTitle,
//                        ajaxSettings);
/*
                $.ajax("https://en.wikipedia.org/w/api.php?action=query&format=json&prop=description|images&titles=Alamo%20Mission%20in%20San%20Antonio"
                        , {success: function(result) {
                            var thehtml = 'View page in <a href="">WikiPedia</a>';
                            
//                            thehtml += 'Description: ' + result.query.pages.143087.description + '<br/>';
//                            if (result.query.pages.143087.images[0]) {
//                                thehtml += '"https://en.wikipedia.org/wiki/' + result.query.pages.143087.images[0].title.replace(' ', '_') + '"'
//                            }

                            $(".wikipediaResults").html(thehtml);
                }})
*/            
            })
        }  
    },

    getCurrentIdx : function() {
        var retval = gmap.current;
        for (var i = 0; i < filteredLocations.length; i++) {
            if (filteredLocations[i].id == gmap.current) {
                retval = i;
            }
        }

        return retval;
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
