"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

// show submit story form above all stories list when "submit" clicked in navbar
function navSubmitClick() {
  hidePageComponents();
  putStoriesOnPage();
  $("#submit-story-form").show();
}

$navSubmit.on("click", navSubmitClick);


function navFavoritesClick() {
  makeFavoritesList();
  hidePageComponents();
  $favoriteStoriesList.show();
}

$navFavorites.on("click", navFavoritesClick);

function navMyStoriesClick() {
  makeMyStoriesList();
  hidePageComponents();
  $submmittedStoriesList.show();
}

$navMyStories.on("click", navMyStoriesClick);





/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $loginForm.hide();
  $signupForm.hide();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

