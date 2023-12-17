const BASE_API_URL = "https://jio-saavn-api-rouge.vercel.app/result/";
const searchButton = document.getElementById("search-button");
const resultsContainer = document.getElementById("results-container");
const loadingDiv = document.getElementById("loading");
const musicPlayer = document.getElementById("music-player");
const progressElement = document.getElementById("progress");

const debounceTime = 500; // milliseconds
let timer;

const handleError = (error) => {
  if (error.message === "404 Not Found") {
    alert("No songs found for your search. Try something else!");
  } else {
    console.error(error);
    alert("An unexpected error occurred. Please try again later.");
  }
};

function createSongItem(song) {
  const songItem = document.createElement("div");
  songItem.classList.add("song-item");

  const songTitleElement = document.createElement("span");
  songTitleElement.classList.add("title");
  songTitleElement.textContent = song.song;

  const artistElement = document.createElement("span");
  artistElement.classList.add("artist");
  artistElement.textContent = song.singers;

  const playButton = document.createElement("button");
  playButton.classList.add("play-button");
  playButton.textContent = "Play";

  songItem.appendChild(songTitleElement);
  songItem.appendChild(artistElement);
  songItem.appendChild(playButton);

  songItem.dataset.song = JSON.stringify(song);

  playButton.addEventListener("click", () => {
    const songData = JSON.parse(songItem.dataset.song);
    musicPlayer.src = songData.media_url;
    musicPlayer.play();
  });

  return songItem;
}

searchButton.addEventListener("click", async function () {
  clearTimeout(timer);

  const songName = document.getElementById("song-name").value.trim();
  if (!songName) {
    alert("Please enter a song name.");
    return;
  }

  loadingDiv.classList.add("active");
  resultsContainer.innerHTML = "";

  timer = setTimeout(async () => {
    try {
      // Replace BASE_API_URL with the actual API endpoint you want to use
      const response = await fetch(`${BASE_API_URL}?query=${songName}&lyrics=true`);
      const data = await response.json();

      if (data.error) {
        handleError(data.error);
        return;
      }

      if (data.length === 0) {
        resultsContainer.innerHTML = "No songs found. Try a different tune!";
        return;
      }

      data.forEach(song => {
        const songItem = createSongItem(song);
        resultsContainer.appendChild(songItem);
      });

      document.querySelectorAll(".song-item").forEach(item => {
        const songData = JSON.parse(item.dataset.song);

        musicPlayer.addEventListener("timeupdate", () => {
          if (progressElement) {
            const progress = musicPlayer.currentTime / musicPlayer.duration;
            progressElement.style.width = `${progress * 100}%`;
          }
        });
      });
    } catch (error) {
      handleError(error);
    } finally {
      loadingDiv.classList.remove("active");
    }
  }, debounceTime);
});
