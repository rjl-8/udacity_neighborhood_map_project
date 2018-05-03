var gmap = {
    self : this,
    map : null,

    current : null,
    infoWindow : null,

    defaultIcon : null,
    highlightedIcon : null,

    // google maps initial callback function
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
                gmap.selectLocation('gmap');
            });
        };

        this.showListings();

        // initiate the view model and ko bindings
        theViewModel = new ViewModel();
        ko.applyBindings(theViewModel);
    },

    // show all the markers for the filtered list
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

    // perform actions based on selection of a location, either through
    // marker or list
    selectLocation : function(inCaller) {
        for (var i = 0; i < filteredLocations.length; i++) {
            filteredLocations[i].marker.setIcon(defaultIcon);
        }
        filteredLocations[gmap.getCurrentIdx()].marker.setIcon(highlightedIcon);
        gmap.populateInfoWindow();

        if (inCaller == 'ViewModel') {
            map.setCenter(filteredLocations[gmap.getCurrentIdx()].marker.position);
            map.panBy(50, 0);
        }

        if (inCaller == 'gmap') {
            theViewModel.selectLocationFromGmap();
        }
    },

    // This function populates the infowindow when a location is selected, if its
    // not already selected.  We are only allowing one infowindow open at a time.
    populateInfoWindow : function() {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infoWindow.marker != filteredLocations[gmap.getCurrentIdx()].marker) {
            gmap.strGoogleBtn = '+';
            gmap.strWikiBtn = '+';
            gmap.strGoogleRes = '';
            gmap.strWikiRes = '';
            gmap.setContentInfoWindow();
        }
    },

    // this function sets the content of the infowindow
    strGoogleBtn : '+',
    strWikiBtn : '+',
    strGoogleRes : '',
    strWikiRes : '',
    setContentInfoWindow : function() {
        var theContent = '';
        theContent += '<div><strong>' + filteredLocations[gmap.getCurrentIdx()].title + '</strong></div>';
        theContent += '<br/>';

        // area for google places info
        theContent += '<div style="border: solid 1px black">';
        theContent += '<button id="btnAjaxGoogleMaps">' + gmap.strGoogleBtn + '</button> GoogleMaps<br/>';
        theContent += '<div id="googleMapsResults">' + gmap.strGoogleRes + '</div>';
        theContent += '</div>';

        // area for wikipedia info
        theContent += '<div style="border: solid 1px black">';
        theContent += '<button id="btnAjaxWikipedia">' + gmap.strWikiBtn + '</button> Wikipedia<br/>';
        theContent += '<div id="wikipediaResults">' + gmap.strWikiRes + '</div>';
        theContent += '</div>';

        infoWindow.setContent(theContent);
        infoWindow.marker = filteredLocations[gmap.getCurrentIdx()].marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        infoWindow.addListener('closeclick', function() {
            infoWindow.marker = null;
        });
        // Open the infowindow on the correct marker.
        infoWindow.open(map, filteredLocations[gmap.getCurrentIdx()].marker);

        // GooglePlaces call button code
        document.getElementById('btnAjaxGoogleMaps').addEventListener('click', function() {
            if (gmap.strGoogleBtn == '+') {
                gmap.strGoogleBtn = '--';
                gmap.getPlacesDetails();
            }
            else {
                gmap.strGoogleBtn = '+';
                gmap.strGoogleRes = '';
                gmap.setContentInfoWindow();
            }
        });

        // Wikipedia ajax call button code
        document.getElementById('btnAjaxWikipedia').addEventListener('click', function () {
            if (gmap.strWikiBtn == '+') {
                gmap.strWikiBtn = '--'
                gmap.strWikiRes = 'View page in <a target="_blank" href="https://en.wikipedia.org/wiki/' + filteredLocations[gmap.getCurrentIdx()].wikipediaTitle + '">WikiPedia</a>';

                var request = {
                    url: 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=description|images&titles=' + filteredLocations[gmap.getCurrentIdx()].wikipediaTitle,
                    dataType: "jsonp",
                    jsonpCallback: "gmap.wikipediaCallback"
                }
                $.ajax(request)
                    .fail(function(err) {
                        if (gmap.strWikiRes.indexOf('Description') == -1) {
                            gmap.strWikiRes += '<br/><i>Error retrieving Wikipedia data</i>';
                            gmap.setContentInfoWindow();
                        }
                    });
            }
            else {
                gmap.strWikiBtn = '+'
                gmap.strWikiRes = '';
                gmap.setContentInfoWindow();
            }
        })
    },

    // Wikipedia functions
    // *******************
    wikipediaCallback : function(data) {
        var theResults = data.query.pages[Object.keys(data.query.pages)[0]];

        var thehtml = '';
        thehtml += '<br/>Description';
        if (theResults.description) {
            thehtml += '<br/>' + theResults.description;
        }
        else {
            thehtml += '<br/><i>no description available</i>';
        }
        // find a suitable image
        var imgidx = -1;
        for (var i = 0; i < theResults.images.length && imgidx == -1; i++) {
            var fnd = true;
            // avoid selecting the common logo
            if (theResults.images[i].title.indexOf('Commons-logo.svg') != -1) {
                fnd = false;
            }
            // avoid svg's as we are targeting drawings or pictures
            if (theResults.images[i].title.indexOf('.svg') != -1) {
                fnd = false;
            }
            if (fnd) {
                imgidx = i;
            }
        }
        // if an image was found, make ajax call to get image url
        if (imgidx != -1 && theResults.images[imgidx]) {
            thehtml += '<br/>';
            var request = {
                url: 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&titles=' + theResults.images[imgidx].title,
                dataType: "jsonp",
                jsonpCallback: "gmap.wikipediaImgCallback"
            }
            $.ajax(request).fail(function(err) {
                thehtml += '<br/><i>Error retrieving Wikipedia images</i>'
            });;
        }
        else {
            thehtml += '<br/><i>no images available</i>'
        }

        gmap.strWikiRes += thehtml;
        gmap.setContentInfoWindow();
    },

    // callback for wikipedia image url
    wikipediaImgCallback : function(data) {
        var thehtml = '';
        thehtml += '<br/><img style="width: 250px" src="' + data.query.pages[Object.keys(data.query.pages)[0]].imageinfo[0].url + '" alt=""></img>';

        gmap.strWikiRes += thehtml;
        gmap.setContentInfoWindow();
    },
    // end Wikipedia functions
    // ***********************

    // Google Places functions
    // ***********************
    // initial call - just used to find the place_id for a more
    // detailed google places call
    getPlacesDetails : function () {
        var request = {
            location: map.getCenter(),
            radius: '5000',
            query: filteredLocations[gmap.getCurrentIdx()].googleAddress
        };

        var service = new google.maps.places.PlacesService(map);
        service.textSearch(request, gmap.textSearchCallback);
    },

    // textSearch callback - just used to get the place_id and
    // initiate another google places call
    textSearchCallback : function(places, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            var service = new google.maps.places.PlacesService(map);
            var request = {
                placeId : places[0].place_id
            };
            service.getDetails({placeId : places[0].place_id}, gmap.getDetailsCallback);
        }
        else {
            gmap.strGoogleRes = '<i>error in GooglePlaces</i>'
            gmap.setContentInfoWindow();
        }
    },

    // the google places getDetail callback
    getDetailsCallback : function(place, status) {
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
            thehtml = '<br/><i>error in GooglePlaces</i>'
        }

        gmap.strGoogleRes = thehtml;
        gmap.setContentInfoWindow();
//        $("#googleMapsResults").html(thehtml);
    },
    // end Google Places functions
    // ***************************

    // method for keeping track of the currently selected location
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
    },

    // handle errors from loading google maps script
    mapError : function() {
        alert('Error loading Google Map scripts');
    }
}
