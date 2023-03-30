import Head from "next/head";
import { sanityClient, urlFor } from "../../sanity";

import Header from "@d20/components/Header";
import Banner from "@d20/components/Banner";
import { Post } from "../../typings";
import Link from "next/link";
import Image from "next/image";

interface Props {
  posts: Post[];
}

export default function Home({ posts }: Props) {
  return (
    <div className="max-w-7xl mx-auto">
      <Head>
        <title>Medium Blog</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <Banner />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 p-2 md:p-6">
        {posts.map(({ _id, title, slug, mainImage, description, author }) => (
          <Link href={`/post/${slug.current}`} key={_id}>
            <div className="group cursor-pointer border rounded-lg overflow-hidden">
              {mainImage && (
                <Image
                  className="h-60 w-full object-cover group-hover:scale-105 transition-transform ease-out"
                  src={urlFor(mainImage).url()}
                  alt={title}
                  width={400}
                  height={240}
                />
              )}
              <div className="flex justify-between p-5 bg-white">
                <div>
                  <p className="text-lg font-bold">{title}</p>
                  <p className="text-xs">{`${description} by ${author.name}`}</p>
                </div>
                {author.image && (
                  <Image
                    className="h-12 w-12 rounded-full"
                    src={urlFor(author.image).url()}
                    alt={author.name}
                    width={48}
                    height={48}
                  />
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export const getStaticProps = async () => {
  const query = `* [_type == "post"] {
    _id,
    _createdAt,
    title,
    author -> {
      name,
      image
    },
    description,
    mainImage,
    slug,
    body,
  }`;

  const posts = await sanityClient.fetch(query);

  return {
    props: {
      posts,
    },
    revalidate: 60,
  };
};
