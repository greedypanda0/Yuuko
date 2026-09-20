import http from "node:http";

const port = Number(process.env.PORT ?? 3000);

http
  .createServer((_req, res) => {
    res.writeHead(200);
    res.end("OK");
  })
  .listen(port);
