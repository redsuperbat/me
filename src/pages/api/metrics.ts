import { NextApiHandler } from "next";

const handler: NextApiHandler = (req, res) => {
  console.log(req.body);
  res.end();
};

export default handler;
