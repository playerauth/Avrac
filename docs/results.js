// results.js - Display Google Custom Search results with tabs (relies on cx.js)
document.addEventListener('DOMContentLoaded', function() {
  // Get query from URL
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q');
  
  // Update search box text
  const searchBox = document.querySelector('.box i');
  if (searchBox && query) {
    searchBox.textContent = query;
  } else if (searchBox) {
    searchBox.textContent = 'Tap To Search Anything...';
  }

  // Ensure results container exists
  let container = document.getElementById('googleSearchContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'googleSearchContainer';
    container.className = 'search-results';
    const space = document.querySelector('.space');
    if (space) {
      space.insertAdjacentElement('afterend', container);
    } else {
      document.body.appendChild(container);
    }
  }

  // If no query, show empty state
  if (!query) {
    container.innerHTML = '<div class="no-results"><i class="fa-regular fa-magnifying-glass"></i> Enter a search term</div>';
    return;
  }

  // Wait for cx.js to load CSE, then execute query
  waitForCseAndExecute(query);
  
  // Tab switching
  setupTabs(query);
});

function waitForCseAndExecute(query) {
  // Check if google CSE is ready
  if (window.google && google.search && google.search.cse) {
    executeQuery(query);
  } else {
    // If not ready, wait a bit and check again
    setTimeout(() => waitForCseAndExecute(query), 200);
  }
}

function executeQuery(query) {
  if (window.google && google.search && google.search.cse) {
    // Try to get existing element or create new one
    let element = google.search.cse.element.getElement('musten-results');
    
    if (!element) {
      // Render new results element
      google.search.cse.element.render({
        div: "googleSearchContainer",
        tag: 'searchresults-only',
        gname: 'musten-results',
        attributes: {
          linkTarget: '_blank'
        }
      });
      // Get the element after rendering
      setTimeout(() => {
        const newElement = google.search.cse.element.getElement('musten-results');
        if (newElement) newElement.execute(query);
      }, 200);
    } else {
      element.execute(query);
    }
  }
}

function setupTabs(baseQuery) {
  const allTab = document.getElementById('all');
  const aiTab = document.getElementById('ai');
  const newsTab = document.getElementById('news');

  // Set initial active tab based on URL or default to all
  const urlParams = new URLSearchParams(window.location.search);
  const activeTab = urlParams.get('tab');
  
  if (activeTab === 'ai') {
    setActiveTab(aiTab);
    executeQuery(baseQuery + ' AI');
  } else {
    setActiveTab(allTab);
  }

  if (allTab) {
    allTab.addEventListener('click', function() {
      setActiveTab(allTab);
      document.getElementById('googleSearchContainer').style.display = 'block';
      executeQuery(baseQuery);
      // Update URL without reload
      const url = new URL(window.location);
      url.searchParams.set('tab', 'all');
      window.history.pushState({}, '', url);
    });
  }

  if (aiTab) {
    aiTab.addEventListener('click', function() {
      setActiveTab(aiTab);
      document.getElementById('googleSearchContainer').style.display = 'block';
      executeQuery(baseQuery + ' AI');
      // Update URL without reload
      const url = new URL(window.location);
      url.searchParams.set('tab', 'ai');
      window.history.pushState({}, '', url);
    });
  }

  if (newsTab) {
    newsTab.addEventListener('click', function() {
      // Open test.html with the query in a new tab
      window.open(`rss.html?q=${encodeURIComponent(baseQuery)}`, '_blank');
    });
  }
}

function setActiveTab(activeTab) {
  if (!activeTab) return;
  
  document.querySelectorAll('.tabs span').forEach(tab => {
    tab.classList.remove('active');
    tab.style.background = '';
    tab.style.color = '';
  });
  activeTab.classList.add('active');
  activeTab.style.background = '#007bff';
  activeTab.style.color = 'white';
}