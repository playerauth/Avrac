// search.js - Custom search with Google Suggest and redirect to results
const input = document.getElementById("search");
const suggestions = document.getElementById("suggestions");
const suggestionsWrapper = document.querySelector(".suggestions-wrapper");
const clearBtn = document.getElementById("clearBtn");
let timeout;
let currentFocus = -1; // for keyboard navigation

// Auto focus on page load
window.addEventListener("load", function() {
  input.focus();
  if (suggestionsWrapper) {
    suggestionsWrapper.classList.remove("visible");
  }
});

// Toggle clear button visibility
function toggleClearButton() {
  if (!clearBtn) return;
  if (input.value.trim().length > 0) {
    clearBtn.classList.add("visible");
  } else {
    clearBtn.classList.remove("visible");
  }
}

// Clear search
function clearSearch() {
  input.value = "";
  suggestions.innerHTML = "";
  if (suggestionsWrapper) {
    suggestionsWrapper.classList.remove("visible");
  }
  if (clearBtn) {
    clearBtn.classList.remove("visible");
  }
  input.focus();
}

// Escape HTML
function escapeHTML(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Fetch suggestions from Google Suggest API via JSONP
function fetchSuggestions(query) {
  if (query.length < 2) {
    hideSuggestions();
    return;
  }

  // Use JSONP to bypass CORS
  const script = document.createElement('script');
  const callbackName = 'jsonp_callback_' + Date.now();
  window[callbackName] = function(data) {
    // data[1] contains array of suggestions
    const suggestionsList = data[1] || [];
    showSuggestions(suggestionsList);
    delete window[callbackName];
    document.body.removeChild(script);
  };

  script.src = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}&callback=${callbackName}`;
  document.body.appendChild(script);
}

// Display suggestions in dropdown
function showSuggestions(suggestionsList) {
  if (!suggestionsList || suggestionsList.length === 0) {
    hideSuggestions();
    return;
  }

  let html = '';
  suggestionsList.forEach((s, index) => {
    html += `<li data-index="${index}"><i class="fa-solid fa-magnifying-glass"></i>${escapeHTML(s)}</li>`;
  });
  suggestions.innerHTML = html;
  suggestionsWrapper.classList.add("visible");
  currentFocus = -1;
}

function hideSuggestions() {
  suggestions.innerHTML = "";
  suggestionsWrapper.classList.remove("visible");
}

// Handle input with debounce
input.addEventListener("input", function() {
  clearTimeout(timeout);
  const query = this.value.trim();
  toggleClearButton();

  if (query.length === 0) {
    hideSuggestions();
    return;
  }

  timeout = setTimeout(() => fetchSuggestions(query), 200);
});

// Keyboard navigation
input.addEventListener("keydown", function(e) {
  const items = suggestions.querySelectorAll('li');
  if (!items.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    currentFocus = (currentFocus + 1) % items.length;
    updateSelected(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    currentFocus = (currentFocus - 1 + items.length) % items.length;
    updateSelected(items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (currentFocus > -1 && items[currentFocus]) {
      const selectedText = items[currentFocus].textContent.trim();
      input.value = selectedText;
      hideSuggestions();
      performSearch();
    } else {
      performSearch(); // normal search
    }
  }
});

function updateSelected(items) {
  items.forEach((item, i) => {
    if (i === currentFocus) item.classList.add('selected');
    else item.classList.remove('selected');
  });
  // scroll into view if needed
  if (items[currentFocus]) items[currentFocus].scrollIntoView({ block: 'nearest' });
}

// Click on suggestion
suggestions.addEventListener("click", function(e) {
  const li = e.target.closest('li');
  if (!li) return;
  
  const text = li.textContent.trim();
  input.value = text;
  hideSuggestions();
  performSearch();
});

// Perform search and redirect to results page
function performSearch() {
  const query = input.value.trim();
  if (!query) return;
  
  // Redirect to results.html with query parameter
  window.location.href = `results.html?q=${encodeURIComponent(query)}`;
}

// Hide dropdown when clicking outside
document.addEventListener("click", function(e) {
  if (!input.contains(e.target) && !suggestionsWrapper.contains(e.target)) {
    hideSuggestions();
  }
});

// Focus on input
input.addEventListener("focus", function() {
  if (input.value.trim().length > 0) {
    suggestionsWrapper.classList.add("visible");
  }
});

// Initial state
toggleClearButton();
hideSuggestions();