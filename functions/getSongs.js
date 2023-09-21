
//http://localhost:4000/api/search?page=1&query=hello&type=Artist  type(Album,Artist,"")
app.get("/api/search", async function (req, res) {
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
          // res.send({
          //   next: result.continuation[1],
          //   api: result.continuation[0],
          //   c1: JSON.stringify(result.continuation[2]),
          //   c2: JSON.stringify(result.continuation[3]),
          //   result: JSON.stringify(tosend),
          // });
          res.send(result);
        })
        .catch((err) => {
          console.log(err);
          res.send("error");
        });
});

// app.get("/api/suggestions", async function (req, res) {
//   let query = req.query.query;
//   youtubeSuggest(query)
//     .then(function (results) {
//       assert(Array.isArray(results));
//       assert(typeof results[0] === "string");
//       res.send(results);
//     })
//     .catch((err) => {
//       res.send(err);
//     });
// });

app.get("/api/getSong", async (req, res) => {
  var reqId = req.query.audioId;
    ytdl
      .getInfo(reqId, { downloadURL: true })
      .then((info) => {
        const audioFormats = ytdl.filterFormats(info.formats, "audioonly");
        res.set("Cache-Control", "public, max-age=3600"); //6hrs aprox
        let tosend = {
          id: info.videoDetails.videoId,
          song: info.videoDetails.media.song ?? info.videoDetails.title,
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
          image:
            info.videoDetails.thumbnails[
              info.videoDetails.thumbnails.length - 1
            ].url,
          media_url: audioFormats[1].url ? audioFormats[1].url : null,
        };
        res.send({
          result: JSON.stringify(tosend),
        });
      })
      .catch((err) => {
        res.send(err);
      });
  
});

app.get("/api/playlist", async (req, res) => {
  // var playlist = req.query.playlistUrl;
  var playlist = "RDCLAK5uy_ksEjgm3H_7zOJ_RHzRjN1wY-_FFcs7aAU";
  ytpl(playlist)
    .then((info) => {
      res.send(info.items);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/api/link", async function (req, res) {
  const reqLink = req.query.url;
  console.log(reqLink);
  var songId = await getId(reqLink);
  console.log(songId);
  if (songId == "error") res.json({ result: "false" });
  axios({
    method: "get",
    url: `https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0%3F_marker%3D0&_format=json&pids=${songId}`,
  })
    .then(async function (response) {
      var data = JSON.parse(
        JSON.stringify(response.data)
          .replace(songId, "TempID")
          .replace(/&amp;/gi, "&")
          .replace(/&quot;/gi, "'")
          .replace(/&copy;/gi, "©")
      ).TempID;
      res.json({
        id: data.id,
        song: data.song,
        album: data.album,
        year: data.year,
        primary_artists: data.primary_artists,
        singers: data.singers,
        image: data.image.replace("150x150", "500x500"),
        label: data.label,
        albumid: data.albumid,
        language: data.language,
        copyright_text: data.copyright_text,
        has_lyrics: data.has_lyrics,
        media_url: data.media_preview_url
          .replace("preview.saavncdn.com", "aac.saavncdn.com")
          .replace("_96_p", "_160"),
        other_qualities: [
          {
            quality: "96_KBPS",
            url: data.media_preview_url
              .replace("preview.saavncdn.com", "aac.saavncdn.com")
              .replace("_96_p", "_96"),
          },
          {
            quality: "160_KBPS",
            url: data.media_preview_url
              .replace("preview.saavncdn.com", "aac.saavncdn.com")
              .replace("_96_p", "_160"),
          },
          {
            quality: "320_KBPS",
            url: data.media_preview_url
              .replace("preview.saavncdn.com", "aac.saavncdn.com")
              .replace("_96_p", "_320"),
          },
        ],
        perma_url: data.perma_url,
        album_url: data.album_url,
        release_date: data.release_date,
      });
    })
    .catch(function (error) {
      res.json({ result: "false" });
    });

  async function getId(reqLink) {
    return axios({
      method: "get",
      url: reqLink,
    })
      .then(async function (dom) {
        return dom.data
          .split('"song":{"type":"')[1]
          .split('","image":')[0]
          .split('"')[8];
      })
      .catch(function (domError) {
        return "error";
      });
  }
});

let proxy = cors_proxy.createServer({
  originWhitelist: [], // Allow all origins
  requireHeaders: [], // Do not require any headers.
  removeHeaders: [], // Do not remove any headers.
});

app.get("/proxy/:proxyUrl*", (req, res) => {
  req.url = req.url.replace("/proxy/", "/"); // Strip '/proxy' from the front of the URL, else the proxy won't work.
  proxy.emit("request", req, res);
});

app.listen(port, () => {
  console.log("Server Works !!! At port 4000");
});


// export async function getSongs(req, res, next) {
//   const url = "https://www.pagalworld.com.se";
//   const headers = {
//     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
//   };

//   try {
//     const response = await axios.get(url, { headers });

//     if (response.status === 200) {
//       const $ = cheerio.load(response.data);
//       const data = [];

//       // Fetching songs
//       $("main")
//         .find(".heading")
//         .first()
//         .next()
//         .find("ul")
//         .children()
//         .each((index, element) => {
//           const fullUrl = `${url}${$(element).find("img").attr("src")}`;
//           const parts = fullUrl.split("/");
//           const fileName = parts[parts.length - 1];
//           const extractedValue = fileName.split("_")[0];
//           let item = {
//             id: uuidv4(),
//             name: $(element).find("a").find("p").first().text(),
//             artist: $(element).find("a").find("p").first().next().text(),
//             cover: `${url}${$(element).find("img").attr("src")}`,
//             audio: `${url}/files/download/id/${extractedValue}`,
//           };
//           data.push(item);
//         });

//       res.send(data);
//     } else {
//       console.error("Error fetching the webpage. Status code:", response.status);
//       res.status(response.status).send("Error fetching the webpage.");
//     }
//   } catch (error) {
//     console.error("Error fetching the webpage:", error);
//     res.status(500).send("Internal server error");
//   }
// }
