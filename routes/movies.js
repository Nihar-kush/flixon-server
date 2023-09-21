import express from "express";
import { getMovies } from "../functions/getMovies.js";
// import { getSongs } from "../functions/getSongs.js";
import { getMovieLink } from "../functions/getMovieLink.js";
import ytpl from "ytpl";
import ytdl from "ytdl-core";
import ytsr from "ytsr";

const router = express.Router();

router.get("/", async (req, res, next) => {
  res.send("Welcome to Flixon.");
});

router.get("/api/movies", getMovies);
router.get("/api/songs/getSong", async (req, res) => {
  var reqId = req.query.audioId;
    ytdl
      .getInfo(reqId, { downloadURL: true })
      .then((info) => {
        const audioFormats = ytdl.filterFormats(info.formats, "audioonly");
        res.set("Cache-Control", "public, max-age=3600"); //6hrs aprox
        let tosend = {
          id: info.videoDetails.videoId,
          title: info.videoDetails.media.song || info.videoDetails.title,
          duration: info.videoDetails.lengthSeconds,
          album: info.videoDetails.media.album,
          year: info.videoDetails.uploadDate.split("-")[0],
          primary_artists:
            info.videoDetails.media.artist ||
            info.ownerChannelName ||
            info.videoDetails.author.name,
          singers:
            info.videoDetails.media.artist ||
            info.ownerChannelName ||
            info.videoDetails.author.name,
          imageUrl:
            info.videoDetails.thumbnails[
              info.videoDetails.thumbnails.length - 1
            ].url,
          audio: audioFormats[1].url ? audioFormats[1].url : null,
        };
        res.send(tosend);
      })
      .catch((err) => {
        res.send(err);
      });
  
});
router.get("/api/songs/playlist", async (req, res) => {
  var playlist = "RDCLAK5uy_ksEjgm3H_7zOJ_RHzRjN1wY-_FFcs7aAU";
  ytpl(playlist)
    .then((info) => {
      const songs = info.items.map((item) => ({
        title: item.title,
        id: item.id,
        videoUrl: item.shortUrl,
        imageUrl: item.bestThumbnail.url,
        duration: item.duration,
        durationSec: item.durationSec,
      }));
      res.send(songs);
    })
    .catch((err) => {
      console.log(err);
    });
});
router.get("/api/songs/search", async function (req, res) {
  var call = req.query.call;
  var reqQuery = req.query.query;
  var page = req.query.page || 1;
  var type = req.query.type || "";
  var next = req.query.next;
  var c1 = req.query.c1;
  var c2 = req.query.c2;
  var api = req.query.api;
    if (next) {
      let parsedc1 = JSON.parse(c1);
      let parsedc2 = JSON.parse(c2);
      parsedc2.limit = Infinity;
      let nextarr = [api, next, parsedc1, parsedc2];
      console.log(nextarr);
      ytsr
        .continueReq(nextarr)
        .then(async (result) => {
          let tosend = [];
          result.items.forEach((item, index) => {
            if (item.type === "video")
              tosend.push({
                from: "yt",
                id: item.id,
                title: item.title,
                image: item.bestThumbnail.url,
                album: "_not_available",
                duration: item.duration || "_not_available",
                description: item.description,
                more_info: {
                  vlink:
                    item.url || `https://www.youtube.com/watch?v=${item.id}`,
                  singers: item.author?.name || "_not_available",
                  language: "_not_available",
                  album_id: "_not_available",
                },
              });
          });
          res.send({
            next: result.continuation[1],
            api: result.continuation[0],
            c1: JSON.stringify(result.continuation[2]),
            c2: JSON.stringify(result.continuation[3]),
            result: JSON.stringify(tosend),
          });
        })
        .catch((err) => {
          console.log(err);
          res.send("error");
        });
    } else
      ytsr(reqQuery, { gl: "IN", limit: 20, pages: 1 })
        .then(async (result) => {
          let tosend = [];
          result.items.forEach((item, index) => {
            if (item.type === "video")
              tosend.push({
                id: item.id,
                title: item.title,
                imageUrl: item.bestThumbnail.url,
              });
          });
          // res.send({
          //   next: result.continuation[1],
          //   api: result.continuation[0],
          //   c1: JSON.stringify(result.continuation[2]),
          //   c2: JSON.stringify(result.continuation[3]),
          //   result: tosend,
          // });
          res.send(result)
        })
        .catch((err) => {
          console.log(err);
          res.send("error");
        });
});
router.get("/api/movies/link", getMovieLink);

export default router;
