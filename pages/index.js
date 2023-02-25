
import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { gql } from "@apollo/client";

import { RetryLink } from "@apollo/client/link/retry";

import { onError } from "@apollo/client/link/error";

import Head from 'next/head';
import Script from 'next/script';

import Header from '../parts/header';
import Footer from '../parts/footer';



export default function Home({list}) {

  return (

    <>

      <Head>

        <title>Amir Hachaichi</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content="Functional biology by SynergyLaunch" />
        <link rel="icon" href="/favicon.ico" />

      </Head>

      <Header />

      <main className="w-full mx-auto min-h-screen mt-6 text-lg">

        <h1 className="my-4 text-2xl text-center text-blue-500">
          Welcome to my website!
        </h1>

        <div className="py-8 text-slate-600">

          <p>---</p>

        </div>

        <div className="container" id="articles">

          <div className="mx-auto md:w-2/3">
          {
            list.map((r,indx)=>{

              return <div key={`dv${indx}`} className="py-1 text-lg"><a href={r.slug} key={indx}>{r.title}</a></div>

            })
          }
          </div>

        </div>

      </main>

      <Footer />

      <Script id="statcounter-id" strategy="lazyOnload">
        {`var sc_project=12758512; 
          var sc_invisible=1; 
          var sc_security="2fc45694"; `}
      </Script>

      <Script id="statcounter-js" strategy="lazyOnload" src="https://www.statcounter.com/counter/counter.js" />

    </>
  )
}

export async function getServerSideProps({ params }) {

  const glink = from([
      
      onError(({ graphQLErrors, networkError }) => {
          if (graphQLErrors)
           graphQLErrors.forEach(({ message, locations, path }) =>
             console.log(
               `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
             )
           );
         if (networkError) console.log(`[Network error]: ${networkError}`);
       }), 

      new RetryLink({
              delay: {
              initial: 800,
              max: Infinity,
              jitter: false
          },
          attempts: {
              max: 10,
              retryIf: (error, _operation) => !!error
          }
      }),

      new HttpLink({
          uri: process.env.GRAPHQL_SERVER
      }),

  ]);

  
  const gclient = new ApolloClient({
      link: glink,
      
      cache: new InMemoryCache(),
  });

  const { data } = await gclient.query({
      query: gql`
      query ArticleList {
          list {
            title
            slug
          }
      }
      `,
    });

 
      return {

          props: {
              
              list:data?.list || [],
              //slug:data?.list.slug,
              
          },
      
      }

  
}