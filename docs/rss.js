// Get query from URL if coming from results page
    document.addEventListener('DOMContentLoaded', function() {
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get('q');
      if (query) {
        document.getElementById('query').value = query;
        fetchNews();
      } else {
        // Default search for technology
        document.getElementById('query').value = 'technology';
        fetchNews();
      }
    });

    function goBack() {
      const query = document.getElementById('query').value;
      window.location.href = `results.html?q=${encodeURIComponent(query)}`;
    }

    async function fetchNews() {
      const query = document.getElementById("query").value;
      if (!query) {
        alert("Please enter a topic");
        return;
      }

      document.getElementById("results").innerHTML =
        "<div class='spinner'></div><p style='text-align:center'>Loading news...</p>";

      // Build Google News RSS URL
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}`;
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

      try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Array of your 10 custom images
        const customImages = [
          "https://raw.githubusercontent.com/playerauth/Images/refs/heads/main/rss1.jpg",
          "https://raw.githubusercontent.com/playerauth/Images/refs/heads/main/rss2.jpg",
          "https://raw.githubusercontent.com/playerauth/Images/refs/heads/main/rss3.jpg",
          "https://raw.githubusercontent.com/playerauth/Images/refs/heads/main/rss4.jpg",
          "https://raw.githubusercontent.com/playerauth/Images/refs/heads/main/rss5.jpg",
          "https://raw.githubusercontent.com/playerauth/Images/refs/heads/main/rss6.jpg",
          "https://raw.githubusercontent.com/playerauth/Images/refs/heads/main/rss7.jpg",
          "https://raw.githubusercontent.com/playerauth/Images/refs/heads/main/rss8.jpg",
          "https://raw.githubusercontent.com/playerauth/Images/refs/heads/main/rss9.jpg",
          "https://raw.githubusercontent.com/playerauth/Images/refs/heads/main/rss10.jpg"
        ];

        let html = `<h2 class="i">News for: ${query}</h2>`;
        if (data.items && data.items.length > 0) {
          // Limit to 10 items and assign different images
          const itemsToShow = data.items.slice(0, 10);
          itemsToShow.forEach((item, index) => {
            // Cycle through images based on index
            const thumbnail = customImages[index % customImages.length];
            html += `
              <div class="news-item">
                <img src="${thumbnail}" alt="thumbnail">
                <div>
                  <a href="${item.link}" target="_blank">${item.title}</a>
                  <p>${new Date(item.pubDate).toLocaleDateString()}</p>
                </div>
              </div>`;
          });
        } else {
          html += '<p style="text-align:center">No latest news found for this topic.</p>';
        }

        document.getElementById("results").innerHTML = html;
      } catch (err) {
        document.getElementById("results").innerHTML =
          "<p style='color:red'>Failed in loading news. Please try again or check your network connection.</p>";
        console.error(err);
      }
    }