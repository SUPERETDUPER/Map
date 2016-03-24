// Copyright 2016, Martin Staadecker, All rights reserved.
var map;
var markers = [];
function initialize() {
	//Build map
	map = new google.maps.Map(document.getElementById('map'), {
			mapTypeId : google.maps.MapTypeId.ROADMAP
		});
	// Create a <script> tag and set the map_data.js as the source.
	var script = document.createElement('script');
	script.src = 'map_data.js';
	document.getElementsByTagName('head')[0].appendChild(script);
	//Push different elements (legend,info,rights) in position
	map.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById('legend'));
	map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('info'));
	map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(document.getElementById('rights'));
	//map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(document.getElementById('sources'));
}
//When user clicks on item in legend
select = function (id) {
	//loop through all infowindows
	for (var i = 0; i < markers.length; i++) {
		//close all infowindows
		markers[i].info.close();
	}
	//Get marker coords
	var latLng = markers[id].getPosition();
	//Center on marker
	map.panTo(latLng);
	//Set zoom
	map.setZoom(15);
	//Open infowindow for marker
	markers[id].info.open(map, markers[id]);
}
//When user clicks on category
toggle = function (id) {
	//Get container to collapse/expand
	var container = document.getElementById("items_container_" + id);
	//Get image (arrow) to change
	var image = document.getElementById("image_" + id);
	//If container colapsed
	if (container.style.display == "none") {
		//Expand container
		container.style.display = "initial";
		//Point arrow down
		image.src = "markers\\arrow_down.png";
	}
	//If container expanded
	else {
		//Colapse container
		container.style.display = "none";
		//Point arrow right
		image.src = "markers\\arrow_right.png";
	}
}
display_sources = function () {}
window.eqfeed_callback = function (results) {
	//Get lengenf
	var legend = document.getElementById("legend");
	//Number of markers with locations (will be incremented)
	var items_added = 0;
	//Loop through all categories
	for (var a = 0; a < results.categories.length; a++) {
		//Get category info
		var category = results.categories[a];
		//Build outer div
		category_container = document.createElement('div');
		category_container.className = "category_container";

		//Build title if exists
		if (category.name != null) {
			category_title = document.createElement("p");
			category_title.className = "category_title";
			category_title.innerHTML = "<img src='markers\\arrow_down.png' width='17' height='17' id='image_" + a + "' />" + category.name;
			category_title.style.cursor = "pointer";
			category_title.setAttribute("onclick", "toggle(" + a + ")")
			//Add element to outer div
			category_container.appendChild(category_title);
		}
		//Build item container
		items_container = document.createElement("div");
		items_container.className = "item_container";
		items_container.id = "items_container_" + a;
		//Add item container to outer div
		category_container.appendChild(items_container);
		//Loop through every item in category
		for (b = 0; b < category.items.length; b++) {
			//Define item
			var item = category.items[b];
			//Initialize path to marker icon
			var icon_path;
			//Create item container
			var item_container = document.createElement("div");
			//Add icon to item_container if required
			if (item.icon == null) {
				icon_path = "markers\\" + category.icon_color + "_Marker" + String.fromCharCode(65 + b) + ".png";
				item_container.innerHTML = "<img src='" + icon_path + "' width='20' height='34'>";
			}

			//If item has coordinates
			if (item.coordinates != null) {
				//Add onclick action to item_container and modify cursor
				item_container.style.cursor = "pointer";
				item_container.setAttribute("onclick", "select(" + items_added + ",'" + item.type + "')");
				//Find coordinates of marker
				var latLng = new google.maps.LatLng(item.coordinates[0], item.coordinates[1]);
				//Build and display marker
				var marker = new google.maps.Marker({
						position : latLng,
						map : map,
						icon : icon_path
					});
				//Add marker to marker array
				markers[items_added] = marker;
				//Build infowindow text
				var details = "<h5>"+item.title+"</h5>";
				if (item.website != null && item.website != "") {
					details+= "<a href='" + item.website + "' target='_blank'>Website</a>";
				}
				if (item.address != null && item.address != "") {
					details += "<p>" + item.address + "</p>";
				}
				if (item.details != null && item.details != "") {
					details += "<p>" + item.details + "</p>";
				}
				marker.info = new google.maps.InfoWindow({
						maxWidth : 250,
						content:details
					});
				google.maps.event.addListener(marker, 'click', function () {
					//loop through all infowindows and close them
					for (var i = 0; i < markers.length; i++) {
						markers[i].info.close();
					}
					//Center on marker, setZoom and open infowindow
					map.panTo(this.position);
					map.setZoom(15);
					this.info.open(map, this);
				});
				//Increment items_added
				items_added += 1;
			}
			//Append title to item
			item_container.innerHTML += item.title;

			//Append item to items_container
			items_container.appendChild(item_container);

		}
		//Append category to legend
		legend.appendChild(category_container)
	}
	//center map on first marker (ABYC)
	select(0, "point");
}
google.maps.event.addDomListener(window, 'load', initialize)
