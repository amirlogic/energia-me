
import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { gql } from "@apollo/client";

import { RetryLink } from "@apollo/client/link/retry";

import { onError } from "@apollo/client/link/error";

import Head from 'next/head';

import Script from 'next/script';

import Header from '../parts/header';
import Footer from '../parts/footer';


export default function Article({title,rows,links}) {
    
    return (

        <>
            <Head>
                <title>{title}</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>

            <Header />

            <main className="container mx-auto min-h-screen mt-2">

                <div className="text-lg font-semibold">{title} </div>

                <div className="my-8 px-6 font-serif">{
                    
                    rows.map((r,indx)=>{

                        if(r.func === 'p'){

                            return <p className="my-2" key={indx}>{r.body}</p>
                        }
                        else{

                            return "";
                        }
                    })
                    
                }</div>

                <div className="my-6 px-6">{

                    links.map((k,indx)=>{

                        return <div key={`dv${indx}`} className="my-2 text-slate-500 hover:text-blue-500"><a href={k} target="_blank" rel="noreferrer" key={indx}>{k}</a></div>
                    })

                }</div>

            </main>

            <Footer />

            <Script id="statcounter-id" strategy="lazyOnload">
                {`var sc_project=12765042; 
                var sc_invisible=1; 
                var sc_security="386e15e2"; `}
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
              rows{
                func
                body
              }
              links
              
            }
        }
        `,
        variables:{ slug:params?.slug }
      });

   
        return {

            props: {
                
                title:data?.sluget.title || 'No title',
                rows:data?.sluget.rows,
                links:data?.sluget.links,
                
            },
        
        }

    
  }

  