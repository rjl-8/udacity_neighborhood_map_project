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
            theContent += '<div><strong>' + filteredLocations[gmap.getCurrentIdx()].title + '</strong></div>';
            theContent += '<br/>';

            theContent += '<div style="border: solid 1px black">';
            theContent += '<button id="btnAjaxGoogleMaps">+</button> GoogleMaps<br/>';
            theContent += '<div id="googleMapsResults"></div>';
            theContent += '</div>';

            theContent += '<div style="border: solid 1px black">';
            theContent += '<button id="btnAjaxWikipedia">+</button> Wikipedia<br/>';
            theContent += '<div id="wikipediaResults"></div>';
            theContent += '</div>';

            infoWindow.setContent(theContent);
            infoWindow.marker = filteredLocations[gmap.getCurrentIdx()].marker;
            // Make sure the marker property is cleared if the infowindow is closed.
            infoWindow.addListener('closeclick', function() {
                infoWindow.marker = null;
            });
            // Open the infowindow on the correct marker.
            infoWindow.open(map, filteredLocations[gmap.getCurrentIdx()].marker);

            // GooglePlaces ajax call button code
            document.getElementById('btnAjaxGoogleMaps').addEventListener('click', function() {
                gmap.getPlacesDetails();
            });

            // Wikipedia ajax call button code
            document.getElementById('btnAjaxWikipedia').addEventListener('click', function () {
//                alert('in ajaxWikipedia');
                var thehtml = 'View page in <a target="_blank" href="https://en.wikipedia.org/wiki/' + filteredLocations[gmap.getCurrentIdx()].wikipediaTitle + '">WikiPedia</a>';

                $.ajax({
                    url: 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=description|images&titles=' + filteredLocations[gmap.getCurrentIdx()].wikipediaTitle,
                    dataType: "jsonp",
                    jsonpCallback: "gmap.wikipediaCallback"
                });
            })
        }  
    },

    wikipediaCallback : function(data) {
//        console.log(data);
//        console.log(data.query.pages[Object.keys(data.query.pages)[0]])
        var theResults = data.query.pages[Object.keys(data.query.pages)[0]];

        var thehtml = '';
        thehtml += 'Description<br/>';
        if (theResults.description) {
            thehtml += theResults.description;
        }
        else {
            thehtml += '<i>no description available</i>';
        }
        thehtml += '<br/>';
        if (theResults.images[0]) {
            thehtml += '<div id="wikiImg"></div>'
            $.ajax({
                url: 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&titles=' + theResults.images[0].title,
                dataType: "jsonp",
                jsonpCallback: "gmap.wikipediaImgCallback"
            });
        }
        else {
            thehtml += '<i>no images available</i>'
        }

        $("#wikipediaResults").html(thehtml);
    },

    wikipediaImgCallback : function(data) {
        var thehtml = '';
        thehtml += '<img style="width: 250px" src="' + data.query.pages[Object.keys(data.query.pages)[0]].imageinfo[0].url + '" alt=""></img>';
        $("#wikiImg").html(thehtml);
    },

    // Google Places functions
    // ***********************
    getPlacesDetails : function () {
        var request = {
            location: map.getCenter(),
            radius: '5000',
            query: filteredLocations[gmap.getCurrentIdx()].googleAddress
        };

        var service = new google.maps.places.PlacesService(map);
        service.textSearch(request, gmap.textSearchCallback);
    },

    textSearchCallback : function(places, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            var service = new google.maps.places.PlacesService(map);
            var request = {
                placeId : places[0].place_id
            };
            service.getDetails({placeId : places[0].place_id}, gmap.getDetailsCallback);
        }
        else {
            $("#googleMapsResults").html('<i>error in GooglePlaces</i>');
        }
    },

    getDetailsCallback : function(place, status) {
        console.log(place)
        console.log(status)
        var thehtml = '';
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            if (place.formatted_address) {
                thehtml += '<br/>Address'
                thehtml += '<br/>' + place.formatted_address;
            }
            if (place.website) {
                thehtml += '<br><a href="' + place.website + '">' + place.website + '</a>';
            }
        }
        else {
            thehtml = '<i>error in GooglePlaces</i>'
        }

        $("#googleMapsResults").html(thehtml);
    },
    // end Google Places functions
    // ***************************

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
