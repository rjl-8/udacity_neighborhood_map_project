var filteredLocations = [];
for (var i = 0; i < locations.length; i++) {
    var obj = locations[i];
    filteredLocations[i] = obj;
};

//(function () {
    var ViewModel = function() {
        var self = this;

        this.filterText = ko.observable('');

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
//            alert('clickBurger!');
            this.toggleClass('leftpane', 'compressed');
            if (!document.getElementById('leftpane').className.indexOf('compressed') != -1) {
                this.filterLocations();
            }
        };

        this.toggleClass = function(inId, inClass) {
            if (document.getElementById(inId).className.indexOf(inClass) != -1) {
                document.getElementById(inId).className = document.getElementById(inId).className.replace(inClass, '').trim();
                this.filterLocations();
            }
            else {
                document.getElementById(inId).className = document.getElementById(inId).className.trim() + ' ' + inClass;
            }
        }

        this.filterLocations = function () {
//            alert('in filterLocations');

            filteredLocations = [];
            var j = 0;
            for (var i = 0; i < locations.length; i++) {
                if (locations[i].title.indexOf(this.filterText()) != -1
                    || this.filterText().trim() == '') {
                    var obj = locations[i];
                    filteredLocations[j++] = obj;
                };
            };
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