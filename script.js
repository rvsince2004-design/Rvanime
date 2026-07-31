// Helper to pause execution for retries
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function openAnimeModal(animeId, trailerUrl, retries = 2) {
    const modal = document.getElementById('anime-modal');
    const iframe = document.getElementById('trailer-video');
    const epList = document.getElementById('modal-episode-list');
    const loader = document.getElementById('episode-loader');

    // 1. Format Trailer URL Safely
    if (trailerUrl) {
        // Clean up URL and append parameters safely using URL object
        try {
            const urlObj = new URL(trailerUrl);
            urlObj.searchParams.set('enablejsapi', '1');
            iframe.src = urlObj.toString();
            iframe.style.display = 'block';
        } catch (e) {
            // Fallback string manipulation if URL parsing fails
            const cleanUrl = trailerUrl.split('?')[0];
            iframe.src = `${cleanUrl}?enablejsapi=1`;
            iframe.style.display = 'block';
        }
    } else {
        iframe.src = ''; 
        iframe.style.display = 'none'; // Hide iframe container if no trailer
    }

    modal.style.display = "block";

    // 2. Reset UI States
    epList.innerHTML = ''; 
    loader.innerText = 'Loading episodes...'; 
    loader.classList.remove('hidden'); 

    // 3. Fetch Episodes with Retry Logic
    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/episodes`);

        // Handle Jikan Rate Limiting (HTTP 429)
        if (response.status === 429 && retries > 0) {
            console.warn("Rate limited by Jikan. Retrying in 1.5s...");
            await sleep(1500);
            return openAnimeModal(animeId, trailerUrl, retries - 1);
        }

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const result = await response.json();
        const episodes = result.data;

        loader.classList.add('hidden'); 

        if (episodes && episodes.length > 0) {
            episodes.forEach(ep => {
                const li = document.createElement('li');
                // Escaping HTML title to prevent potential XSS issues
                const safeTitle = (ep.title || 'Untitled').replace(/</g, "&lt;").replace(/>/g, "&gt;");
                li.innerHTML = `<strong>${ep.mal_id}.</strong> ${safeTitle}`;
                epList.appendChild(li);
            });
        } else {
            epList.innerHTML = '<li>No episode titles found for this anime.</li>';
        }
    } catch (error) {
        loader.classList.remove('hidden');
        loader.innerText = "Failed to load episodes. Please try again.";
        console.error("Jikan API Error:", error);
    }
    }
        
