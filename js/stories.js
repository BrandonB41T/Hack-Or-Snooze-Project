"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */
async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}


/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  let isFavorite;
  let starStatus = "hidden";
  let checked = " unchecked";
  // if logged in, check to see if a story is a favorite
  if (currentUser) {
    isFavorite = Story.isFavorite(story, currentUser);
    if (isFavorite) {
      checked = " checked";
    }
    starStatus = `fa fa-star${checked}`;
  };
  // starStatus variable uses class to make favorite stars show or hide based on if a user is logged in
  
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <div>
          <span class="${starStatus}"></span>
          <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
          </a>
          <small class="story-hostname">(${hostName})</small>
          <small class="story-author">by ${story.author}</small>
          <small class="story-user">posted by ${story.username}</small>
        </div>
      </li>
    `);
}

// appends new story to main list, and pushes it to user's "ownStories" list through addStory method on storyList

async function handleStorySubmit(evt) {
  evt.preventDefault();
  const author = $("#author").val();
  const title = $("#title").val();
  const url = $("#url").val();
  const story = await storyList.addStory(currentUser, {author, title, url});

  const storyEl = generateStoryMarkup(story);
  $submitStoryForm.hide();
  $submitStoryForm.trigger("reset");
  $allStoriesList.prepend(storyEl);
}

$submitStoryForm.on("submit", handleStorySubmit);

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

// iterates over user's favorites list to create a list of those stories only, called by a click on the favorites tab in navbar
function makeFavoritesList() {
  $favoriteStoriesList.empty();
  currentUser.favorites.forEach(s => {
    const story = generateStoryMarkup(s);
    $favoriteStoriesList.append(story);
  })
  if (currentUser.favorites.length < 1) {
    $favoriteStoriesList.html(`<h5>No favorites added!</h5>`);
  }
}

// iterates over user's "my stories" list to create a list of those stories only, called by a click on the "my stories" tab in navbar
function makeMyStoriesList() {
  $submmittedStoriesList.empty();
  currentUser.ownStories.forEach(s => {
    const story = generateStoryMarkup(s);
    $submmittedStoriesList.append(story);
  })
  
  // add delete button to all stories on "my stories" list
  $("#submitted-stories-list li div").prepend('<i class="fa fa-trash-o delete-btn"></i>');
  if (currentUser.ownStories.length === 0) {
    $submmittedStoriesList.html(`<h5>You have no added stories yet!</h5>`);
  }
}

// function to remove an element from an array
function removeEl(elementToRemove, arr) {
  arr.forEach((item, index) => {
      if (item === elementToRemove) {
          arr.splice(index, 1);
      }
  });
  return arr;
}

// delete a selected story from the DOM and API when delete icon clicked
async function deleteStory(evt) {
  const li = evt.target.parentElement.parentElement;
  const storyId = li.id;
  const story = currentUser.ownStories.find(s => (s.storyId == storyId));
  await axios({
    url: `${BASE_URL}/stories/${storyId}`,
    method: "DELETE",
    data: {token: currentUser.loginToken}
  })
  
  // iterate through each list of stories and remove selected story
  const lists = [currentUser.ownStories, currentUser.favorites, storyList.stories]
  lists.forEach(list => (removeEl(story, list)));
  li.remove();
  
  // resets list
  makeMyStoriesList();
}

$submmittedStoriesList.on("click", ".delete-btn", deleteStory);


// toggle favorite status of a story by changing its star color through checked class and pushing/removing it from user's favorite's list; removeFavorite and addFavorite are methods from the User class
function toggleFavorite(evt) {
  const star = evt.target;
  const storyId = star.parentElement.parentElement.id;
  let story;
  if (star.classList.contains("checked")) {
    star.classList.replace("checked", "unchecked");
    story = currentUser.favorites.find(s => (s.storyId === storyId));
    currentUser.removeFavorite(story);
  } else {
    star.classList.replace("unchecked", "checked");
    story = storyList.stories.find(s => (s.storyId === storyId));
    currentUser.addFavorite(story);
  }
}

$everyList.on("click", "span", toggleFavorite);