import { useState } from "react";

import PortableText from "react-portable-text";
import Header from "@d20/components/Header";
import { sanityClient, urlFor } from "../../../sanity";
import { Post } from "../../../typings";
import { useForm, SubmitHandler } from "react-hook-form";

interface Props {
  post: Post;
}
interface CommentForm {
  _id: string;
  name: string;
  email: string;
  comment: string;
}

function PostPage({ post }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CommentForm>();

  const onSubmit: SubmitHandler<CommentForm> = async (data) => {
    await fetch("/api/createComment", {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then(() => setSubmitted(true))
      .catch((err) => setSubmitted(false));
  };

  return (
    <main>
      <Header />
      {post.mainImage && (
        <img
          className="w-full h-40 object-cover"
          src={urlFor(post.mainImage).url()}
        />
      )}

      <article className="max-w-3xl mx-auto">
        <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
        <h2 className="text-xl font-light text-gray-500 mb-2">
          {post.description}
        </h2>
        <div className="flex items-center space-x-2">
          {post.author.image && (
            <img
              className="h-10 w-10 rounded-full"
              src={urlFor(post.author.image).url()}
              alt=""
            />
          )}

          <p className="font-extra-light text-sm">
            Blog post by{" "}
            <span className="text-green-600">{post.author.name}</span> —
            Published at {new Date(post._createdAt).toLocaleString("en-GB")}
          </p>
        </div>
        <div className="mt-10">
          {post.body && (
            <PortableText
              dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
              projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
              content={post.body}
              serializers={{
                h1: (props: any) => (
                  <h1 className="text-2xl font-bold my-5" {...props} />
                ),
                h2: (props: any) => (
                  <h2 className="text-xl font-bold my-5" {...props} />
                ),
                li: ({ children }: any) => (
                  <li className="ml-4 list-disc">{children}</li>
                ),
                link: ({ href, children }: any) => (
                  <a className="text-blue-500 hover:underline" href={href}>
                    {children}
                  </a>
                ),
                normal: ({ children }: any) => (
                  <p className="my-5 text-black-700">{children}</p>
                ),
              }}
            />
          )}
        </div>
      </article>
      <hr className="max-w-lg my-5 mx-auto border-yellow-500" />
      {submitted ? (
        <div className="flex flex-col p-10 my-10 bg-yellow-500 text-white max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold">
            Thank you for submitting your comment!
          </h3>
          <p>Once it has been approved, it will appear below!</p>
        </div>
      ) : (
        <form
          className="flex flex-col p-5 max-w-2xl mx-auto mb-10"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h3 className="text-sm  text-yellow-500">Enjoyed this article?</h3>
          <h4 className="text-3xl  font-bold">Leave a comment below!</h4>
          <hr className="py-3 mt-2 " />
          <input
            {...register("_id")}
            type="hidden"
            name="_id"
            value={post._id}
          />
          <label className="block mb-5">
            <span className="text-gray-700">Name</span>
            <input
              {...register("name", { required: true })}
              className="shadow border rounded py-2 px-3 form-input mt-1 block w-full outline-none focus:ring ring-yellow-500"
              placeholder="John Appleseed"
              type="text"
            />
          </label>
          <label className="block mb-5">
            <span className="text-gray-700">Email</span>
            <input
              {...register("email", {
                required: true,
                pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
              })}
              className="shadow border rounded py-2 px-3 form-input mt-1 block w-full outline-none focus:ring ring-yellow-500"
              placeholder="John Appleseed"
              type="email"
            />
          </label>
          <label className="block mb-5">
            <span className="text-gray-700">Comment</span>
            <textarea
              {...register("comment", { required: true })}
              className="shadow border rounded py-2 px-3 form-textarea mt-1 block w-full outline-none focus:ring ring-yellow-500"
              rows={8}
            />
          </label>
          <div className="flex flex-col p-5">
            {errors.name && (
              <span className="text-red-500">Name is required</span>
            )}
            {errors.email && (
              <span className="text-red-500">Email is required</span>
            )}
            {errors.comment && (
              <span className="text-red-500">Comment is required</span>
            )}
          </div>
          <input
            type="submit"
            className="shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold rounded py-2 px-4"
            value={"Submit"}
          />
        </form>
      )}
      <div className="flex flex-col p-10 my-10 max-w-2xl mx-auto shadow-yellow-500 shadow space-y-2">
        <h3 className="text-4xl font-bold">Comments</h3>
        <hr className="pb-2" />
        {post.comments.map((comment) => (
          <div key={comment._id}>
            <p>
              <span className="text-yellow-500">{comment.name}</span>:{" "}
              {comment.comment}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}

export default PostPage;

export const getStaticPaths = async () => {
  const query = `*[_type == "post"]{
        _id,
        slug {
            current
        }
    }`;
  const posts = await sanityClient.fetch(query);

  const paths = posts.map((post: Post) => ({
    params: { slug: post.slug.current },
  }));
  return { paths, fallback: "blocking" };
};

type PageParams = {
  params: {
    slug: string;
  };
};

export const getStaticProps = async ({ params }: PageParams) => {
  const query = `*[_type == "post" && slug.current == $slug][0]{
        _id,
        title,
        _createdAt,
        author -> {
          name,
          image
        },
        'comments': *[
          _type == "comment" && 
          post._ref == ^._id &&
          approved == true
        ],
        description,
        mainImage,
        slug,
        body
      }`;

  const post = await sanityClient.fetch(query, { slug: params.slug });

  if (!post) return { notFound: true };
  console.log("post", post);

  return {
    props: {
      post,
    },
    revalidate: 60,
  };
};
