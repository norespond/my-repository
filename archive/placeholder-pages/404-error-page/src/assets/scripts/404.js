// This file contains JavaScript code for the 404 error page.
// It enhances user experience by providing dynamic content and tracking user interactions.

document.addEventListener("DOMContentLoaded", function() {
    // Function to handle the back button click
    const backButton = document.getElementById("back-button");
    if (backButton) {
        backButton.addEventListener("click", function() {
            window.history.back();
        });
    }

    // Function to load dynamic content or suggestions
    function loadSuggestions() {
        const suggestionsContainer = document.getElementById("suggestions");
        if (suggestionsContainer) {
            suggestionsContainer.innerHTML = `
                <h2>Here are some helpful links:</h2>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/contact">Contact Us</a></li>
                    <li><a href="/help">Help Center</a></li>
                </ul>
            `;
        }
    }

    // Load suggestions on page load
    loadSuggestions();
});