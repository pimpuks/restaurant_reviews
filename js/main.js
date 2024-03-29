let restaurants, neighborhoods, cuisines;
let observers = [];
var newMap;
var markers = [];

/**
 *  Register service worker for root scope
 */
if ('serviceWorker' in navigator) {
  let scope = '/';
  if (location.hostname != 'localhost') {
    scope = '/restaurant_reviews/';
  }
  navigator.serviceWorker
    .register('./serviceworker.js', { scope: scope })
    .then(reg => {
      // registration worked
      console.log(
        'Service Worker Registration succeeded. Scope is ' + reg.scope
      );
    })
    .catch(error => {
      // registration failed
      console.log('Service Worker Registration failed with ' + error);
    });
}
/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', event => {
  initMap(); // added
  fetchNeighborhoods();
  fetchCuisines();
});

let restaurantsList = document.querySelector('#restaurants-list');
let observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: [0.01]
};

/**
 *  intersectionCallback function to load the image of the restanrant
 *  when the restaurant element meet the visibility threshold (1%)
 */

intersectionCallback = entries => {
  entries.forEach(entry => {
    let restaurant = entry.target;
    let visiblePct = Math.floor(entry.intersectionRatio * 100);
    if (visiblePct > 0) {
      let restaurantImage = restaurant.querySelector('.restaurant-img');
      if (restaurantImage.src === '') {
        restaurantImage.src = DBHelper.imageUrlForRestaurant(
          self.restaurants[restaurant.id.split('-')[1]]
        );
      }
    }
  });
};
/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) {
      // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
  self.newMap = L.map('map', {
    center: [40.722216, -73.987501],
    zoom: 12,
    scrollWheelZoom: false
  });
  L.tileLayer(
    'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}',
    {
      mapboxToken:
        'pk.eyJ1IjoicGltcHVrcyIsImEiOiJjanltajR1cncwanF3M2lzOHJlbW54cTF3In0.BEqfumdmKy4IpCn1sA-xHw',
      maxZoom: 18,
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox.streets'
    }
  ).addTo(newMap);

  updateRestaurants();
};

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    (error, restaurants) => {
      if (error) {
        // Got an error!
        console.error(error);
      } else {
        resetRestaurants(restaurants);
        fillRestaurantsHTML();
      }
    }
  );
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = restaurants => {
  // Remove all restaurants
  self.restaurants = [];
  self.observers = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach((restaurant, index) => {
    let restaurantElement = createRestaurantHTML(restaurant);
    restaurantElement.id = 'restaurant-' + index;
    ul.append(restaurantElement);
    observers[index] = new IntersectionObserver(
      intersectionCallback,
      observerOptions
    );
    observers[index].observe(restaurantElement);
  });
  addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = restaurant => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  // Use IntersectionObserver to lazy load the image in the intersectionCallback() function
  image.alt = restaurant.name + ' (' + restaurant.neighborhood + ')';
  li.append(image);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.title = restaurant.name;
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);

  return li;
};

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on('click', onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });
};
