import { GetStaticPaths, GetStaticProps } from 'next';

import Prismic from '@prismicio/client'
import { getPrismicClient } from '../../services/prismic';

import Link from "next/link"

import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR';

import { FiUser, FiCalendar, FiClock } from 'react-icons/fi'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';

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

  const { data } = post

  const router = useRouter();

  let total = 0

  for(let i = 0; i < data.content.length; i++){
    const { body, heading } = data.content[i]

    total += heading.split(" ").length

    for(let j = 0; j < body.length; j++){
      total += body[j].text.split(" ").length
    }
  }
  
  const minutes = Math.ceil(total/200)

  if (router.isFallback){
    return (
      <h2>Carregando...</h2>
    )
  }
  
  return (
    <>
      <header className={commonStyles.header}>
        <Link href="/">
          <img src="/logo.svg" alt="logo" />
        </Link>
      </header>
      <main>
        <div className={styles.imageContainer}>
          <img src={data.banner.url} alt="post banner"/>
        </div>
        <div className={styles.container}>
          <div>
            <h1>{data.title}</h1>
            <span><FiCalendar />{format(new Date(post.first_publication_date),'dd MMM yyyy', { locale: ptBR } )}</span>
            <span><FiUser/>{data.author}</span>
            <span><FiClock />{minutes} min</span>
          </div>
          <div className={styles.content}>
            {
              data.content.map((cnt, i) => {
                return (
                  <div key={i}>
                    <h2>{cnt.heading}</h2>
                    {cnt.body.map(body => {
                      return (
                        <p key={body.text}>{body.text}</p>
                      )
                    })}
                  </div>
                )
              })
            }
          </div>
        </div>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(Prismic.Predicates.at('document.type', 'post'));

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid
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
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url
      },
      content: response.data.content.map(cnt => {
        return {
          heading: cnt.heading,
          body: cnt.body
        }})
    }
  } 

  return {
    props : {
      post
    }
  }
};
