import { v4 as uuidv4 } from "uuid";
import * as cheerio from "cheerio";
import request from "request";

export function getMovies(req, res, next) {
  let page = req.query.page || 1;
  let category = req.query.category;
  let finalResults = [];
  
  let url;
  let url1 = `https://moviesflixer.lat/category/${category}/page/${page}`;
  let url2 = `https://moviesflixer.lat`;
  
  if (category) {
    url = url1;
  } else {
    url = url2;
  }
  request(url, (err, result, html) => {
    if (!err) {
      let $ = cheerio.load(html);
      $("#content")
        .find(".content")
        .each((index, element) => {
          let item = {
            id: uuidv4(),
            title: $(element).find(".entry-title").find("a").text(),
            downloadLink: $(element).find(".entry-title").find("a").attr("href"),
            img_url: $(element).find("img").attr("src"),
          };
          finalResults.push(item);
        });
      $(".sub-menu")
        .children()
        .each((index, element) => {
          let item1 = {
            category: $(element).find("a").text(),
            categoryLink: $(element).find("a").attr("href"),
          };
          finalResults.push(item1);
        });
      res.send(finalResults);
    }
  });
}
