import { GetStaticProps } from 'next/types'
import React, { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import PortableText from 'react-portable-text'
import Header from '../../components/Header'
import { sanityClient, urlFor } from '../../sanity'
import { Post } from '../../typings'
import Comments from '../../components/Comments'

interface Props {
  post: Post
}
interface IFormInput {
  _id: string
  name: string
  email: string
  comment: string
}
function Post({ post }: Props) {
  const [submited, setSubmited] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  console.log(post)
  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    await fetch('/api/createComment', {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then((res) => {
        console.log(res)
        setSubmited(true)
      })
      .catch((err) => {
        console.log(err)
        setSubmited(false)
      })
  }
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  return (
    <main>
      <Header />
      <img
        src={urlFor(post.mainImage).url()!}
        alt={post.description}
        className="h-40 w-full object-cover"
      />
      <article className="mx-auto max-w-3xl p-5">
        <h1 className="mb-3 text-3xl ">{post.title}</h1>
        <h2 className="mb-2 text-xl font-light text-gray-500">
          {post.description}
        </h2>
        <div className="flex items-center space-x-2">
          <img
            className="h-10 w-10 rounded-full"
            src={urlFor(post.author.image).url()!}
            alt=""
          />
          <p className="text-sm font-extralight">
            Blog post bt{' '}
            <span className="text-green-600">{post.author.name}</span> -
            Published at {new Date(post._createdAt).toLocaleString()}
          </p>
        </div>
        <div className="mt-10">
          <PortableText
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
            content={post.body}
            serializers={{
              h1: (props: any) => (
                <h1 className="my-5 text-2xl font-bold" {...props} />
              ),
              h2: (props: any) => (
                <h2 className="my-5 text-xl font-bold" {...props} />
              ),
              normal: (props: any) => (
                <p className="my-5 text-sm text-gray-500" {...props} />
              ),
              li: ({ children }: any) => (
                <li className="ml-4 list-disc">{children}</li>
              ),
              link: ({ children, href }: any) => (
                <a className="text-blue-500 hover:underline" href={href}>
                  {children}
                </a>
              ),
            }}
          />
        </div>
      </article>
      <hr className="my-5 mx-auto max-w-lg border-yellow-500" />
      {submited ? (
        <div className="flex flex-col py-10 my-10 bg-yellow-500 text-white max-w-2xl mx-auto p-5">
          <h3 className="text-3xl font-bold">
            Thank you for submitting your comment!
          </h3>
          <p>Once it has been approved, it will appear below!</p>
        </div>
      ) : (
        <form
          className="my-10 mx-auto mb-10 flex max-w-2xl flex-col p-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h3 className="text-sm text-yellow-500">Enjoyed this article?</h3>
          <h4 className="text-3xl font-bold">Leave a comment below</h4>
          <hr className="mt-2 py-3" />

          <input type="hidden" value={post._id} {...register('_id')} />
          <label className="mb-5 block">
            <span className="text-gray-700">Name</span>
            <input
              className="form-input block w-full rounded border py-2 px-3 shadow outline-none ring-yellow-500 focus:ring-[1px]"
              placeholder="John appleseed"
              type="text"
              {...register('name', { required: true })}
            />
          </label>
          <label className="mb-5 block">
            <span className="text-gray-700">Email</span>
            <input
              {...register('email', { required: true })}
              className="form-input block w-full rounded border py-2 px-3 shadow outline-none ring-yellow-500 focus:ring-[1px]"
              placeholder="John appleseed"
              type="email"
            />
          </label>
          <label className="mb-5 block">
            <span className="text-gray-700">Comment</span>
            <textarea
              {...register('comment', { required: true })}
              className="form-textarea mt-1 block w-full rounded border py-2 px-3 shadow outline-none ring-yellow-500 focus:ring-[1px]"
              placeholder="John appleseed"
              rows={8}
            />
          </label>
          <div className="flex flex-col p-5">
            {errors.name && (
              <span className="text-red-500">- The Name Field is required</span>
            )}{' '}
            {errors.comment && (
              <span className="text-red-500">
                - The Comment Field is required
              </span>
            )}{' '}
            {errors.email && (
              <span className="text-red-500">
                - The Email Field is required
              </span>
            )}
          </div>
          <input
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded cursor:default"
          />
        </form>
      )}

      <div className="flex flex-col p-10 my-10 max-w-2xl mx-auto shadow-yellow-500 shadow space-y-2">
        <h3 className="text-4xl">Comments</h3>
        <hr className="pb-2" />
        {post.comments.map((comment) => (
          <div key={comment._id}>
            <p>
              <span className="text-yellow-500">{comment.name}</span>:{' '}
              {comment.comment}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}

export default Post

export const getStaticPaths = async () => {
  const query = `*[_type =='post']{
                _id,
                slug{
                    current
                }
  }`

  const posts = await sanityClient.fetch(query)

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }))

  return {
    paths,
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type =='post' && slug.current == $slug][0]{
  _id,
  _createdAt,
  title,
  author->{
  name,
  image
},
"comments":*[
  _type == "comment" &&
  post._ref == ^._id &&
  approved == true
],
description,
mainImage,
slug,
body
}`

  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  })

  if (!post) {
    return {
      notFound: true,
    }
  }
  return {
    props: { post },
    revalidate: 60, // after 60sec
  }
}
