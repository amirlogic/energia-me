
import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { gql } from "@apollo/client";

import { RetryLink } from "@apollo/client/link/retry";

import { onError } from "@apollo/client/link/error";

import md from 'markdown-it';

import Head from 'next/head';
import Script from 'next/script';
import Link from 'next/link';

import Header from '../parts/header';
import Footer from '../parts/footer';


export default function Article({title,rows}) {
    
    return (

        <>
            <Head>
                <title>{title}</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>

            <Header />

            <main className="container mx-auto min-h-screen mt-2">

                <div className="px-6 md:w-2/3 mx-auto text-lg font-semibold">{title} </div>

                <div className="my-8 mx-auto px-6 font-serif w-full md:w-2/3">{
                    
                    rows.map((r,indx)=>{

                        if(r.func === 'p'){

                            return <div className="my-2" key={indx} dangerouslySetInnerHTML={{ __html: md().render(r.payload) }}></div> 
                        }
                        else if(r.func === 'link'){

                            return <div key={`dv${indx}`} className="my-2 text-slate-500 hover:text-blue-500"><a href={r.payload} target="_blank" rel="noreferrer" key={indx}>{r.payload}</a></div>
                        }
                        else if(r.func === 'code'){

                            return <code key={`dv${indx}`} className="my-2">{r.payload}</code>
                        }
                        else{

                            return "";
                        }
                    })
                    
                }</div>

                <div className="px-6 mx-auto md:w-2/3"><Link href="/"><a>back to homepage</a></Link></div>

            </main>

            <Footer />

            <Script id="statcounter-id" strategy="lazyOnload">
                {`var sc_project=12758512; 
                  var sc_invisible=1; 
                  var sc_security="2fc45694";`}
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

        /* */
    ]);
  
    
    const gclient = new ApolloClient({
        link: glink,
        
        cache: new InMemoryCache(),
    });

    const { data } = await gclient.query({
        query: gql`
        query ArticleData($slug: String!) {
            sluget(slug: $slug) {
              title
              rows {
                func
                payload
              }
              
            }
        }
        `,
        variables:{ slug:params?.slug }
      });

   
        return {

            props: {
                
                title:data?.sluget.title || 'No title',
                rows:data?.sluget.rows,
                
            },
        
        }

    
  }

  