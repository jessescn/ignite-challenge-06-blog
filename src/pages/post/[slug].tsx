import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

import Prismic from '@prismicio/client'
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  console.log(post);
  
  return (
    <>
      {/* <Head>
        <title></title>
      </Head> */}
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(Prismic.Predicates.at('document.type', 'post'));

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.slugs[0]
      }
    }
  })

  return {
    paths,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {

  const { slug } = params;
  
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});
  
  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content.map(cnt => {
        return {
          heading: cnt.heading,
          body: cnt.body.map(data => ({ text: data.text }))
        }
      })
    }
  }  

  return {
    props : {
      post
    }
  }
};
