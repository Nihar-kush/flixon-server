import { v4 as uuidv4 } from "uuid";
import * as cheerio from "cheerio";
import request from "request";

export function getMovies(req, res, next) {
  let page = req.query.page ? req.query.page : 1;
  let category = req.query.category ? `/category/${req.query.category}/` : "/";
  const url = `https://themoviezflix.co.com${category}page/${page}`;
  let finalResults = [];
  const URL = "https://themoviezflix.co.com/category/netflix/page/1";
  request(url, (err, result, html) => {
    if (!err) {
      let $ = cheerio.load(html);
      //   console.log($("#blog"));
      $(".main-container")
        .find("#page")
        .children("#content_box")
        .children(".excerpt")
        .each((index, element) => {
          let item = {
            id: uuidv4(),
            downloadLink: $(element).find("a").attr("href"),
            img_url: $(element).find("img").attr("src"),
            title: $(element).find(".title").find("a").text(),
          };
          finalResults.push(item);
        });
      $("#menu-item-674")
        .find(".sub-menu")
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
