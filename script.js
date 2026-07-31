async function openAnimeModal(animeId, trailerUrl) {
    const modal = document.getElementById('anime-modal');
    const iframe = document.getElementById('trailer-video');
    const epList = document.getElementById('modal-episode-list');
    const loader = document.getElementById('episode-loader');

    // 1. Format Trailer URL for IFRAME
    if (trailerUrl) {
        let embedUrl = trailerUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/');
        // Optional: add autoplay parameters
        iframe.src = `${embedUrl}?enablejsapi=1`;
    } else {
        iframe.src = ''; // Clear iframe if no trailer
    }

    modal.style.display = "block";

    // 2. Fetch and Display Episodes
    epList.innerHTML = ''; // Clear old data
    loader.innerText = 'Loading episodes...'; // Reset loader text
    loader.classList.remove('hidden'); // Show loading text

    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/episodes`);
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const result = await response.json();
        const episodes = result.data;

        loader.classList.add('hidden'); // Hide loader

        if (episodes && episodes.length > 0) {
            episodes.forEach(ep => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${ep.mal_id}.</strong> ${ep.title || 'Untitled'}`;
                epList.appendChild(li);
            });
        } else {
            epList.innerHTML = '<li>No episode titles found for this anime.</li>';
        }
    } catch (error) {
        loader.classList.remove('hidden');
        loader.innerText = "Failed to load episodes.";
        console.error("Jikan API Error:", error);
    }
            }

