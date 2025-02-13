require("dotenv").config();

const express = require("express");
const hbs = require("hbs");
const path = require("path");
// require spotify-web-api-node package here:
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();

app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));
hbs.registerPartials(path.join(__dirname, "views", "partials"));

// setting the spotify-api goes here:

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

// Our routes go here:

app.get("/", (req, res) => res.render("index"));

app.get("/artist-search", (req, res) => {
  spotifyApi
    .searchArtists(req.query.name)
    .then((data) => {
      console.log("The received data from the API: ", data.body);
      // ----> 'HERE'S WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'

      const artistList = data.body.artists.items.map((elem) => {
        let img1 = elem.images.length > 0 ? elem.images[1].url : "#";

        return { name: elem.name, img: img1, artistId: elem.id };
      });

      res.render("artist-search-results", { artistList });
    })
    .catch((err) =>
      console.log("The error while searching artists occurred: ", err)
    );
});

app.get("/albums/:artistId", (req, res, next) => {
  // .getArtistAlbums() code goes here
  spotifyApi
    .getArtistAlbums(req.params.artistId)
    .then((data) => {
      const albumList = data.body.items.map((elem) => {
        let img1 = elem.images.length > 0 ? elem.images[1].url : "#";

        return { name: elem.name, img: img1, albumId: elem.id };
      });

      console.log(albumList);
      res.render("albums", { albumList });
    })

    .catch((error) => console.error(error));
});

app.get("/tracks/:albumId", (req, res, next) => {
  spotifyApi
    .getAlbumTracks(req.params.albumId)
    .then((data) => {
      const trackList = data.body.items.map((element) => {
        return { name: element.name, url: element.preview_url };
      });

      res.render("tracks", { trackList });
    })
    .catch((error) => console.error(error));
});

app.listen(3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);
