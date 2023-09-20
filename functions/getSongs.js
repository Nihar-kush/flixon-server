import { v4 as uuidv4 } from "uuid";
import * as cheerio from "cheerio";
import axios from "axios";

export async function getSongs(req, res, next) {
  const url = "https://www.pagalworld.com.se";
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
  };

  try {
    const response = await axios.get(url, { headers });

    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const data = [];

      // Fetching songs
      $("main")
        .find(".heading")
        .first()
        .next()
        .find("ul")
        .children()
        .each((index, element) => {
          const fullUrl = `${url}${$(element).find("img").attr("src")}`;
          const parts = fullUrl.split("/");
          const fileName = parts[parts.length - 1];
          const extractedValue = fileName.split("_")[0];
          let item = {
            id: uuidv4(),
            name: $(element).find("a").find("p").first().text(),
            artist: $(element).find("a").find("p").first().next().text(),
            cover: `${url}${$(element).find("img").attr("src")}`,
            audio: `${url}/files/download/id/${extractedValue}`,
          };
          data.push(item);
        });

      res.send(data);
    } else {
      console.error("Error fetching the webpage. Status code:", response.status);
      res.status(response.status).send("Error fetching the webpage.");
    }
  } catch (error) {
    console.error("Error fetching the webpage:", error);
    res.status(500).send("Internal server error");
  }
}
