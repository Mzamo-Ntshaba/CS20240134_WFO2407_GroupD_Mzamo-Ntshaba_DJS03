// Importing data from an external data module
// This includes arrays of books, authors, genres, and a constant for books displayed per page.
import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

// Creating a data object that holds imported data for easy access throughout the script.
const data = {
    books, // Array of book objects, each containing details like title, author ID, genres, etc.
    authors, // Object mapping author IDs to author names.
    genres, // Object mapping genre IDs to genre names.
    BOOKS_PER_PAGE // Number of books to display per page.
};

/**
 * Creates and returns a new HTML element with specified attributes and inner content.
 * @param {string} tag - The HTML tag to create (e.g., 'div', 'button').
 * @param {string} [classNames] - Class names to add to the element for styling.
 * @param {Object} [attributes] - Additional attributes to set on the element (e.g., data attributes).
 * @param {string} [innerHTML] - The inner HTML content to be placed inside the element.
 * @returns {HTMLElement} The newly created element with applied attributes and content.
 */
function createElement(tag, classNames, attributes, innerHTML) {
    const element = document.createElement(tag); // Create the specified element type.
    if (classNames) element.classList = classNames; // Add class names if provided.
    if (attributes) {
        // Loop through attributes object and set each attribute on the element.
        for (const [key, value] of Object.entries(attributes)) {
            element.setAttribute(key, value);
        }
    }
    if (innerHTML) element.innerHTML = innerHTML; // Set inner HTML if provided.
    return element; // Return the created element.
}

/**
 * Generates and returns a document fragment containing book preview buttons.
 * Each button includes a book image, title, and author name.
 * @param {Array} books - The array of book objects to display as previews.
 * @param {number} start - The starting index for slicing the array.
 * @param {number} end - The ending index for slicing the array.
 * @returns {DocumentFragment} A document fragment containing the generated book previews.
 */
function renderBookList(books, start, end) {
    const fragment = document.createDocumentFragment(); // Create a fragment to improve performance.
    // Loop through a slice of the books array to create book previews.
    for (const { author, id, image, title } of books.slice(start, end)) {
        const element = createElement('button', 'preview', { 'data-preview': id }, `
            <img class="preview__image" src="${image}" alt="${title}" />
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${data.authors[author]}</div>
            </div>
        `);
        fragment.appendChild(element); // Append each preview button to the fragment.
    }
    return fragment; // Return the fragment containing all previews.
}

/**
 * Changes the theme of the application by updating CSS custom properties.
 * @param {string} theme - The chosen theme ('day' or 'night').
 */
function setTheme(theme) {
    if (theme === 'night') {
        // Set properties for night mode (light text on dark background).
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255'); // Text color.
        document.documentElement.style.setProperty('--color-light', '10, 10, 20'); // Background color.
    } else {
        // Set properties for day mode (dark text on light background).
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20'); // Text color.
        document.documentElement.style.setProperty('--color-light', '255, 255, 255'); // Background color.
    }
}

/**
 * Populates a given select element with options generated from a provided object.
 * The first option is customizable and serves as a placeholder or 'any' option.
 * @param {HTMLSelectElement} selectElement - The select element to populate.
 * @param {Object} options - The object containing option values and display names.
 * @param {string} firstOptionText - The text for the first placeholder option.
 */
function populateSelectElement(selectElement, options, firstOptionText) {
    const fragment = document.createDocumentFragment(); // Create a fragment for better performance.
    const firstOption = createElement('option', null, { value: 'any' }, firstOptionText); // Create a placeholder option.
    fragment.appendChild(firstOption); // Add the placeholder option to the fragment.

    // Create and add each option from the options object.
    for (const [id, name] of Object.entries(options)) {
        const option = createElement('option', null, { value: id }, name);
        fragment.appendChild(option); // Add each option to the fragment.
    }
    selectElement.appendChild(fragment); // Append all options to the select element.
}

// Variables for tracking the current page of book previews and filtered search results.
let page = 1; // Start on page 1.
let matches = data.books; // Initialize matches to contain all books initially.

// Initial rendering of book previews for the first page.
document.querySelector('[data-list-items]').appendChild(renderBookList(matches, 0, data.BOOKS_PER_PAGE));

// Populate the genre and author select elements with options.
populateSelectElement(document.querySelector('[data-search-genres]'), data.genres, 'All Genres');
populateSelectElement(document.querySelector('[data-search-authors]'), data.authors, 'All Authors');

// Detect user's preferred color scheme and apply the appropriate theme.
const prefersDarkScheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = prefersDarkScheme ? 'night' : 'day'; // Set theme based on preference.
setTheme(theme); // Apply the theme.
document.querySelector('[data-settings-theme]').value = theme; // Update the theme selection input.

// Update the text and state of the "Show more" button.
const listButton = document.querySelector('[data-list-button]');
listButton.innerText = `Show more (${data.books.length - data.BOOKS_PER_PAGE})`; // Set initial button text.
listButton.disabled = matches.length - (page * data.BOOKS_PER_PAGE) > 0; // Enable/disable based on remaining books.

// Event listener for closing the search overlay when the cancel button is clicked.
document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = false; // Close the overlay.
});

// Event listener for closing the settings overlay when the cancel button is clicked.
document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false; // Close the overlay.
});

// Event listener for opening the search overlay when the search icon is clicked.
document.querySelector('[data-header-search]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = true; // Open the overlay.
    document.querySelector('[data-search-title]').focus(); // Focus on the title input field.
});

// Event listener for opening the settings overlay when the settings icon is clicked.
document.querySelector('[data-header-settings]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = true; // Open the overlay.
});

// Event listener for closing the active book details overlay when the close button is clicked.
document.querySelector('[data-list-close]').addEventListener('click', () => {
    document.querySelector('[data-list-active]').open = false; // Close the overlay.
});

/**
 * Event listener for handling the settings form submission.
 * Applies the selected theme and closes the settings overlay.
 */
document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission behavior.
    const formData = new FormData(event.target); // Extract form data.
    const { theme } = Object.fromEntries(formData); // Get the selected theme from the form.
    setTheme(theme); // Apply the new theme.
    document.querySelector('[data-settings-overlay]').open = false; // Close the overlay.
});

/**
 * Event listener for handling the search form submission.
 * Filters the books based on the user's search criteria and updates the display.
 */
document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission behavior.
    const formData = new FormData(event.target); // Extract form data.
    const filters = Object.fromEntries(formData); // Convert form data to an object.
    const result = []; // Array to store matching books.

    // Filter books based on title, author, and genre criteria.
    for (const book of data.books) {
        let genreMatch = filters.genre === 'any'; // Match all genres if 'any' is selected.
        for (const singleGenre of book.genres) {
            if (genreMatch) break; // Stop if genre matches.
            if (singleGenre === filters.genre) genreMatch = true; // Match if book's genre matches the filter.
        }

        // Check if the book matches all filter criteria.
        if (
            (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
            (filters.author === 'any' || book.author === filters.author) &&
            genreMatch
        ) {
            result.push(book); // Add matching book to the result array.
        }
    }

    // Reset the search overlay, update matches, and re-render the book list.
    page = 1; // Reset to the first page for new search results.
    matches = result.length > 0 ? result : data.books; // Update matches or default to all books.
    document.querySelector('[data-list-message]').classList.toggle('list__message_show', result.length === 0); // Show message if no results.
    document.querySelector('[data-list-items]').innerHTML = ''; // Clear current book previews.
    document.querySelector('[data-list-items]').appendChild(renderBookList(matches, 0, data.BOOKS_PER_PAGE)); // Display updated previews.
    document.querySelector('[data-list-button]').disabled = matches.length <= data.BOOKS_PER_PAGE; // Enable/disable "Show more" button.
    document.querySelector('[data-list-button]').innerText = `Show more (${matches.length - data.BOOKS_PER_PAGE})`; // Update button text.
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top smoothly.
    document.querySelector('[data-search-overlay]').open = false; // Close search overlay.
});

/**
 * Event listener for handling clicks on the "Show more" button.
 * Loads and displays additional book previews as needed.
 */
document.querySelector('[data-list-button]').addEventListener('click', () => {
    const startIndex = page * data.BOOKS_PER_PAGE; // Calculate start index for the next batch.
    const endIndex = startIndex + data.BOOKS_PER_PAGE; // Calculate end index for the next batch.
    document.querySelector('[data-list-items]').appendChild(renderBookList(matches, startIndex, endIndex)); // Render additional books.
    page += 1; // Increment the page number.
    // Update button text and disable if no more books to show.
    listButton.innerText = `Show more (${matches.length - page * data.BOOKS_PER_PAGE})`;
    listButton.disabled = matches.length - page * data.BOOKS_PER_PAGE <= 0;
});

/**
 * Event listener for handling clicks on book previews.
 * Displays book details in an overlay when a preview is clicked.
 */
document.querySelector('[data-list-items]').addEventListener('click', (event) => {
    const pathArray = Array.from(event.path || event.composedPath()); // Get the event path for handling.
    let active = null; // Variable to store the active book data.

    // Find the clicked preview element with a 'data-preview' attribute.
    for (const node of pathArray) {
        if (active) break; // Stop if the active book is found.
        if (node?.dataset?.preview) {
            active = data.books.find(book => book.id === node.dataset.preview); // Find the book by ID.
        }
    }

    if (active) {
        // Update the book detail overlay with book information.
        document.querySelector('[data-list-active]').open = true; // Open the overlay.
        document.querySelector('[data-list-blur]').src = active.image; // Set the background image.
        document.querySelector('[data-list-image]').src = active.image; // Set the main image.
        document.querySelector('[data-list-title]').innerText = active.title; // Set the title.
        document.querySelector('[data-list-subtitle]').innerText = `${data.authors[active.author]} (${new Date(active.published).getFullYear()})`; // Set author and year.
        document.querySelector('[data-list-description]').innerText = active.description; // Set the description.
    }
});
