import * as cheerio from "cheerio";
import request from "request";

export function getMovieLink(req, res, next) {
  let link = req.query.movieUrl;
  let streamLink;

  request(link, (err, result, html) => {
    if (!err) {
      let $ = cheerio.load(html);
      streamLink = $(".container").find("iframe").attr("src");
      res.send(streamLink);
    }
  });
}
