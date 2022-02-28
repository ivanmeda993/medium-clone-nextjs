import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Posts from '../components/Posts'
import { sanityClient, urlFor } from '../sanity'
import { Post } from './../typings.d'
import Link from 'next/link'

interface Props {
  posts: [Post]
}

const Home = ({ posts }: Props) => {
  console.log(posts)

  return (
    <div className="mx-auto max-w-7xl">
      <Head>
        <title>Medium Blog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <Hero />
      {/* Posts */}
      <Posts posts={posts} />
    </div>
  )
}

export default Home

export const getServerSideProps = async () => {
  const query = `*[_type =="post"]{
  _id,title,slug,
  author->{
  name,image
},
description,
mainImage,
slug
}`

  const posts = await sanityClient.fetch(query)
  return { props: { posts } }
}
