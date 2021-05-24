import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'

import Link from "next/link"

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR';


import { FiUser, FiCalendar } from 'react-icons/fi'
import { useState } from 'react';

interface Post {
  uid?: string;
  slug: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

interface PaginationResponse {
  next_page: string;
  results: Post[];
}

export default function Home({ postsPagination }: HomeProps) {

  const [posts, setPosts] = useState(postsPagination.results);


  const loadNewPage = () => {
    fetch(postsPagination.next_page).then(res => {
      return res.json()
    }).then((response: PaginationResponse) => {
      
      postsPagination.next_page = response.next_page;

      response.results.map(result => {
        
        const post: Post  = {
          uid: result.uid,
          slug: result.slug,
          first_publication_date: result.first_publication_date,
          data: {
            title: result.data.title,
            subtitle: result.data.subtitle,
            author: result.data.author,
          }
        }

        setPosts([...posts, post])
      })
    })
  }

  return(
    <div className={styles.container}>
      <div>
        {
          posts.map(post => (
            <Link key={post.uid} href={`/post/${post.slug}`}>
              <div className={styles.post}>
                <h3>{post.data.title}</h3>
                <p>{post.data.subtitle}</p>
                <div>
                  <span><FiCalendar />{format(new Date(post.first_publication_date),'dd MMM yyyy', { locale: ptBR } )}</span>
                  <span><FiUser />{post.data.author}</span>
                </div>
              </div>
            </Link>
          ))
        }
      </div>
      { postsPagination.next_page && <button onClick={loadNewPage}>Carregar mais posts</button> }
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const res = await prismic.query([Prismic.Predicates.at('document.type', 'post')], {
    pageSize: 10
  })

  const results = res.results.map(result => {

    return {
      uid: result.uid,
      slug: result.slugs[0],
      first_publication_date: result.first_publication_date,
      data: {
        title: result.data.title,
        subtitle: result.data.subtitle,
        author: result.data.author,
      }
    }
  })
  
  const postsPagination = {
    next_page: res.next_page,
    results
  }

  return {
    props:{
      postsPagination
    }
  }
};
