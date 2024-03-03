document.addEventListener("DOMContentLoaded", function () {
    const clientID = 'b794b40a28e240649301391e7638d847';
    const redirectURI = 'https://projects.jessehoekema.com/now-playing-on-spotify/';
    const authorizeEndpoint = 'https://accounts.spotify.com/authorize';
    const nowPlayingEndpoint = 'https://api.spotify.com/v1/me/player/currently-playing';
    const scopes = 'user-read-currently-playing';

    let accessToken = '';

    function loginWithSpotify() {
        const authURL = `${authorizeEndpoint}?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}&scope=${scopes}&response_type=token`;
        window.location = authURL;
    }

    function updateNowPlayingData(data) {
        const albumCover = document.getElementById('album-cover');
        const trackName = document.getElementById('track-name');
        const artistName = document.getElementById('artist-name');
        const timeline = document.getElementById('timeline');
        const progressBar = document.getElementById('progress-bar');

        albumCover.src = data.item.album.images[0].url;
        trackName.textContent = data.item.name;
        artistName.textContent = data.item.artists.map(artist => artist.name).join(', ');

        // Bereken de voortgangspercentage en pas de voortgangsbalk aan
        const progressPercentage = (data.progress_ms / data.item.duration_ms) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        // Bereken de tijd in uren, minuten en seconden
        const durationInSeconds = Math.floor(data.item.duration_ms / 1000);
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = durationInSeconds % 60;

        // Weergave van tijd in uur:minuut:seconde-formaat
        const durationText = minutes >= 60 ? `${Math.floor(minutes / 60)}:${(minutes % 60).toString().padStart(2, '0')}` : `${minutes}:${seconds.toString().padStart(2, '0')}`;
        timeline.textContent = `Progress: ${millisecondsToTime(data.progress_ms)} of ${durationText}`;
    }

    function millisecondsToTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}` : `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    function getNowPlayingData() {
        fetch(nowPlayingEndpoint, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            updateNowPlayingData(data);
        })
        .catch(error => {
            console.error('Error fetching data from Spotify API:', error);
        })
        .finally(() => {
            // Plan de volgende update na 1 seconde
            setTimeout(getNowPlayingData, 1000);
        });
    }

    const urlParams = new URLSearchParams(window.location.hash.substr(1));
    accessToken = urlParams.get('access_token');

    if (accessToken) {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('spotify-info').style.display = 'block';
        getNowPlayingData();
    } else {
        document.getElementById('login-btn').addEventListener('click', loginWithSpotify);
    }
});
