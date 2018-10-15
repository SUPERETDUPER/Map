// Copyright 2016, Martin Staadecker, All rights reserved.
var map;

function load() {
	// Adding the script tag to the head
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');

	var api_key = "AIzaSyAtv-3nm8KNFXYXNn2gkSnAsaTLeSlLqO8"; //YOUR API KEY HERE

	script.type = 'text/javascript';
	script.src = 'https://maps.googleapis.com/maps/api/js'
		if (api_key != "") {
			script.src += '?key=' + api_key;
		}

		// Then bind the event to the callback function.
		// There are several events for cross browser compatibility.
		script.onreadystatechange = initialize;
	script.onload = initialize;

	// Fire the loading
	head.appendChild(script);
}
function initialize() {
	//Build map
	map = new google.maps.Map(document.getElementById('map'), {
			mapTypeId : google.maps.MapTypeId.ROADMAP,
			zoomControlOptions : {
				position : google.maps.ControlPosition.LEFT_TOP
			},
			streetViewControl : false
		});

	// Create a <script> tag and set the map_data.js as the source.
	var script = document.createElement('script');
	script.src = 'map_data.js';
	document.getElementsByTagName('head')[0].appendChild(script);

	//Push different elements (legend,info,rights) in position
	map.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById('open_legend'));
	map.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById('legend'));
	map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('info'));
	map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(document.getElementById('rights'));
	map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(document.getElementById('image'));
}

window.eqfeed_callback = function (results) {

	//Array of Google Map API markers
	var markers = [];
	
	//Runs when arrow button is pressed
	hide_legend = function(){
		legend=document.getElementById("legend");
		arrow=document.getElementById("open_legend");
		info=document.getElementById("info");
		legend.style.display="none";
		arrow.style.display="";
		info.style.display="none";
	}
	unhide_legend = function(){
		legend=document.getElementById("legend");
		arrow=document.getElementById("open_legend");
		info=document.getElementById("info");
		legend.style.display="";
		arrow.style.display="none";
		info.style.display="";
	}
	//Runs when user clicks on item in legend
	select = function (id) {
		//Close all info windows
		for (var i = 0; i < markers.length; i++) {
			markers[i].info.close();
		}

		//Center and zoom on marker
		var latLng = markers[id].getPosition();
		map.panTo(latLng);
		map.setZoom(15);

		//Open infowindow for marker
		markers[id].info.open(map, markers[id]);
	}

	//Runs when user clicks on category title
	toggle = function (id) {
		//Get container and arrow objects
		var container = document.getElementById("items_container_" + id);
		var image = document.getElementById("image_" + id);

		//If container is colapsed expand container and point arrow down
		if (container.style.display == "none") {
			container.style.display = "";
			image.src = "markers\\arrow_down.png";
		}

		//If container is expanded collapse container and point arrow right
		else {
			container.style.display = "none";
			image.src = "markers\\arrow_right.png";
		}
	}

	//Get legend
	var legend = document.getElementById("legend");

	//Declare number of markers
	var markers_added = 0;

	//Loop through categories
	for (var a = 0; a < results.categories.length; a++) {

		//Get category info
		var category = results.categories[a];

		//Build category outer div
		category_container = document.createElement('div');
		category_container.className = "category_container";

		//Build title with arrow
		if (category.name != null) {
			category_title = document.createElement("p");
			category_title.className = "category_title";
			category_title.innerHTML = "<img src='markers\\arrow_down.png' width='17' height='17' id='image_" + a + "' />" + category.name;
			category_title.style.cursor = "pointer";
			category_title.setAttribute("onclick", "toggle(" + a + ")")
			category_container.appendChild(category_title);
		}

		//Build item container
		items_container = document.createElement("div");
		items_container.className = "item_container";
		items_container.id = "items_container_" + a;
		category_container.appendChild(items_container);

		//Loop through every item in the category
		for (b = 0; b < category.items.length; b++) {
			//Get item info
			var item = category.items[b];
			//Initialize path to marker icon
			var icon_path;

			//Create item container
			var item_container = document.createElement("div");

			//Add icon to item
			if (item.icon == null) {
				icon_path = "markers\\" + category.icon_color + "_Marker" + String.fromCharCode(65 + b) + ".png";
				item_container.innerHTML = "<img src='" + icon_path + "' width='20' height='34'>";
			}

			//Add title to item
			item_container.innerHTML += item.title;

			//If item has coordinates
			if (item.coordinates != null) {
				//Add link to item on the legend
				item_container.style.cursor = "pointer";
				item_container.setAttribute("onclick", "select(" + markers_added + ",'" + item.type + "')");

				//Build and display marker
				var latLng = new google.maps.LatLng(item.coordinates[0], item.coordinates[1]);
				var marker = new google.maps.Marker({
						position : latLng,
						map : map,
						icon : icon_path
					});

				//Add marker to marker array
				markers[markers_added] = marker;

				//Build infowindow text
				var details = "<h5>" + item.title + "</h5>";
				if (item.website != null && item.website != "") {
					details += "<a href='" + item.website + "' target='_blank'>Website</a>";
				}
				if (item.address != null && item.address != "") {
					details += "<p>" + item.address + "</p>";
				}
				if (item.details != null && item.details != "") {
					details += "<p>" + item.details + "</p>";
				}
				marker.info = new google.maps.InfoWindow({
						maxWidth : 250,
						content : details
					});

				//Runs when user clicks on marker
				google.maps.event.addListener(marker, 'click', function () {
					//Close all info windows
					for (var i = 0; i < markers.length; i++) {
						markers[i].info.close();
					}
					//Center and zoom on marker
					map.panTo(this.position);
					map.setZoom(15);

					//Open marker infowindow
					this.info.open(map, this);
				});

				//Increment markers_added
				markers_added += 1;
			}

			//Append item to items_container
			items_container.appendChild(item_container);

		}
		//Append category to legend
		legend.appendChild(category_container)
	}
	//center map on First marker
	select(0, "point");
}
load();
