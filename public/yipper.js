/*
 * Name: Tatsuhiko Araki
 * Date: May 23, 2023
 * Section: CSE 154 AA
 *
 * This is the client side JS file to implement the UI for yipper application.
 * This program includes all of actions of yipper.
 *
 */

"use strict";
(function() {

  const TIMEOUT = 2000;
  window.addEventListener("load", init);

  /**
   * Initialize page and event listeners
   */
  function init() {
    requestAllYips();
    id("search-term").addEventListener("input", handleSearchInputChange);
    id("search-btn").addEventListener("click", handleSearchButtonClick);
    id("home-btn").addEventListener("click", handleHomeButtonClick);
    id("yip-btn").addEventListener("click", handleYipButtonClick);
  }

  /**
   * Handle Home button click events.
   */
  function handleHomeButtonClick() {
    id("user").classList.add("hidden");
    id("new").classList.add("hidden");
    id("home").classList.remove("hidden");
    id("search-term").value = "";
    let card = document.querySelectorAll('main article section .card');
    for (let i = 0; i < card.length; i++) {
      card[i].classList.remove('hidden');
    }
  }

  /**
   * Handle Yip button click events.
   */
  function handleYipButtonClick() {
    id("user").classList.add("hidden");
    id("home").classList.add("hidden");
    id("new").classList.remove("hidden");
    qs('form').addEventListener('submit', handleFormSubmit);
  }

  /**
   * Handle form submission events.
   *
   * @param {Event} event - The form submission event
   */
  function handleFormSubmit(event) {
    event.preventDefault();
    let form = new FormData(qs("form"));
    fetch("/yipper/new", {method: "POST", body: form})
      .then(statusCheck)
      .then(res => (res.json()))
      .then(newYip)
      .catch(handleError);
  }

  /**
   * Create a new Yip.
   *
   * @param {Object} res - The response object from the server
   */
  function newYip(res) {
    qs("form").reset();
    let yip = makeYip(res);
    id("home").prepend(yip);
    setTimeout(() => {
      id("home").classList.remove("hidden");
      id("new").classList.add("hidden");
    }, TIMEOUT);
  }

  /**
   * Handle an increment of a like.
   */
  function incrementLike() {
    let sibling = this.nextElementSibling;
    let params = new FormData();
    let id = this.parentNode.parentNode.parentNode.id;
    params.append("id", id);
    fetch('/yipper/likes', {method: "POST", body: params})
      .then(statusCheck)
      .then(resp => resp.text())
      .then(response => {
        sibling.textContent = response;
      })
      .catch(handleError);
  }

  /**
   * Send a request to get all Yips.
   */
  function requestAllYips() {
    fetch('/yipper/yips')
      .then(statusCheck)
      .then(response => response.json())
      .then(allYip)
      .catch(handleError);
  }

  /**
   * Handle a successful response to a request for all Yips.
   *
   * @param {Object} res - The response object from the server
   */
  function allYip(res) {
    for (let i = 0; i < res.yips.length; i++) {
      let cardResponse = res.yips[i];
      let article = makeYip(cardResponse);
      qs("#home").appendChild(article);
    }
  }

  /**
   * Create a new Yip element.
   *
   * @param {Object} yip - The yip data to use in creating the element
   * @returns {HTMLElement} - The new Yip element
   */
  function makeYip(yip) {
    let yipCard = gen("article");
    yipCard.classList.add("card");
    yipCard.id = yip.id;
    let img = gen("img");
    img.src = "img/" + yip.name.toLowerCase().replace(/\s+/g, "-") + ".png";
    let firstDiv = gen("div");
    let namePara = gen("p");
    namePara.classList.add("individual");
    namePara.textContent = yip.name;
    namePara.addEventListener("click", showYip);
    let yipTextPara = gen("p");
    yipTextPara.textContent = yip.yip + " #" + yip.hashtag;
    firstDiv.appendChild(namePara);
    firstDiv.appendChild(yipTextPara);
    let secondDiv = gen("div");
    secondDiv.classList.add("meta");
    let datePara = gen("p");
    let date = new Date(yip.date);
    datePara.textContent = date.toLocaleString();
    let likesDiv = gen("div");
    let heartImg = gen("img");
    heartImg.src = "img/heart.png";
    heartImg.addEventListener('click', incrementLike);
    let likesPara = gen("p");
    likesPara.textContent = yip.likes;
    likesDiv.append(heartImg, likesPara);
    secondDiv.append(datePara, likesDiv);
    yipCard.append(img, firstDiv, secondDiv);
    return yipCard;
  }

  /**
   * Display a Yip.
   */
  function showYip() {
    id("home").classList.add("hidden");
    id("new").classList.add("hidden");
    id("user").classList.remove("hidden");
    id("user").innerHTML = "";
    let userName = this.textContent;
    fetch("/yipper/user/" + userName)
      .then(statusCheck)
      .then(res => (res.json()))
      .then(cardHandle)
      .catch(handleError);
  }

  /**
   * Handle a user's Yips.
   *
   * @param {Array} userYips - An array of a user's Yips
   */
  function cardHandle(userYips) {
    let yipsArticle = gen("article");
    yipsArticle.classList.add("single");
    let header = gen("h2");
    header.textContent = "Yips shared by " + userYips[0].name + ":";
    yipsArticle.appendChild(header);
    for (let i = 0; i < userYips.length; i++) {
      let yipPara = gen("p");
      yipPara.textContent = "Yip " + i + ": " + userYips[i].yip + " #" + userYips[i].hashtag;
      yipsArticle.appendChild(yipPara);
    }
    id("user").appendChild(yipsArticle);
  }

  /**
   * Handle changes to the search input field.
   */
  function handleSearchInputChange() {
   let trimmedSearchTerm = id("search-term").value.trim();
    if (trimmedSearchTerm === "") {
      id("search-btn").disabled = true;
    } else {
      id("search-btn").disabled = false;
    }
  }

  /**
   * Handle clicks on the search button.
   */
  function handleSearchButtonClick() {
    id('home').classList.remove("hidden");
    id('user').classList.add("hidden");
    id('new').classList.add("hidden");
    let trimmedSearchTerm = id("search-term").value.trim();
    let request = "/yipper/yips?search=" + trimmedSearchTerm;
    fetch(request)
      .then(statusCheck)
      .then(res => (res.json()))
      .then(searchResult)
      .catch(handleError);
  }

  /**
   * Handle search results.
   *
   * @param {Object} res - The response object from the server
   */
  function searchResult(res) {
    id('search-btn').disabled = true;
    let card = document.querySelectorAll('main article section .card');
    for (let i = 0; i < card.length; i++) {
      card[i].classList.add('hidden');
    }
    for (let i = 0; i < res.yips.length; i++) {
      let searchId = res.yips[i].id;
      id(searchId).classList.remove('hidden');
    }
  }

  /**
   * Check the status of a response.
   *
   * @param {Response} res - The response to check
   * @returns {Promise} - A promise that resolves to the response, if the status was ok
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Handle an error.
   *
   * @param {Error} error - The error to handle
   */
  function handleError(error) {
    console.error(error);
    id("yipper-data").style.display = "none";
    id("error").style.display = "block";
    for (let button of qsa("nav button")) {
      button.disabled = true;
    }
  }

  /**
   * Finds the element with the specified ID attribute.
   *
   * @param {string} id - element ID
   * @returns {HTMLElement} DOM object associated with id.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Finds the first element matching the selector
   *
   * @param {string} selector - CSS selector
   * @returns {HTMLElement} - the first element matching the selector
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Finds the all of elements matching the selector
   *
   * @param {string} selector - CSS selector
   * @returns {HTMLElement} - all of elements matching the selector
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * This function creates a new HTML element with the specified tag name.
   *
   * @param {string} tagName - The tag name of the HTML
   * @returns {HTMLElement} - A new HTML element with the tag name specified
   * by the tagName parameter.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

})();
