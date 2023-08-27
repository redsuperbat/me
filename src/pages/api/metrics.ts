import { NextApiHandler } from "next";

const handler: NextApiHandler = (req, res) => {
  const timestamp = new Date();
  const metric = JSON.parse(req.body);
  const stdout = JSON.stringify({ metric, timestamp });
  console.log(stdout);
  res.end();
};

export default handler;
