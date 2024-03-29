// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ObservableSanityClient } from "@sanity/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { createSanityClient } from "../../../sanity";

const config = {
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  apiVersion: "2023-03-26",
  useCdn: process.env.NODE_ENV === "production",
  token: process.env.SANITY_API_TOKEN,
};

const client = createSanityClient(config);

export default async function createComment(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { _id, name, email, comment } = JSON.parse(req.body);

  try {
    await client.create({
      _type: "comment",
      post: {
        _type: "reference",
        _ref: _id,
      },
      name,
      email,
      comment,
    });
  } catch (error) {
    return res.status(500).json({ message: `Couldn't submit comment`, error });
  }
  console.log("comment submitted");
  res.status(200).json({ name: "Comment Submitted" });
}
