import { v4 as uuidv4 } from "uuid";
import * as cheerio from "cheerio";
import request from "request";

export function getMovies(req, res, next) {
  let page = req.query.page || 1;
  let category = req.query.category;
  const baseUrl = process.env.BASE_URL;
  let url;
  let url1 = `${baseUrl}?genre=${category}&page=${page}`;
  let url2 = `${baseUrl}?page=${page}`;
  if (category) {
    url = url1;
  } else {
    url = url2;
  }

  request(url, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const $ = cheerio.load(body);
      const data = [];

      // fetching movies
      $("article")
        .find("ul")
        .children()
        .each((index, element) => {
          let item = {
            id: uuidv4(),
            title: $(element).find(".movie-grid-title").text(),
            downloadLink: `http://www.streamlord.com/${$(element)
              .find("a")
              .last()
              .attr("href")}`,
            img_url: `http://www.streamlord.com/${$(element)
              .find("img")
              .attr("src")}`,
          };
          data.push(item);
        });
      // fetching categories
      $("#movies-menu")
        .find("ul")
        .children()
        .each((index, element) => {
          let categories = {
            category: $(element).find("a").text(),
            categoryLink: $(element).find("a").attr("href"),
          };
          data.push(categories);
        });
      data.pop();
      res.send(data);
    } else {
      console.error("Error fetching the webpage:", error);
    }
  });
}
