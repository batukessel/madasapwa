const CACHE_NAME =
  'almukhtar-pwa-v100';

const OFFLINE_URL =
  'https://madasadzikir.blogspot.com/offline.html';

const BLOG_URL =
  'https://madasadzikir.blogspot.com/';

// FILE AWAL
const PRECACHE = [

  BLOG_URL,

  OFFLINE_URL,

  'https://batukessel.github.io/blog-pwa/icon-192.png',

  'https://batukessel.github.io/blog-pwa/icon-512.png'

];

// INSTALL
self.addEventListener(
  'install',
  function(event){

    self.skipWaiting();

    event.waitUntil(

      caches.open(CACHE_NAME)

        .then(function(cache){

          return cache.addAll(PRECACHE);

        })

    );

  }
);

// ACTIVATE
self.addEventListener(
  'activate',
  function(event){

    event.waitUntil(

      Promise.all([

        self.clients.claim(),

        caches.keys()

          .then(function(keys){

            return Promise.all(

              keys.map(function(key){

                if(key !== CACHE_NAME){

                  return caches.delete(key);

                }

              })

            );

          })

      ])

    );

  }
);

// FETCH
self.addEventListener(
  'fetch',
  function(event){

    if(
      event.request.method !== 'GET'
    ){
      return;
    }

    // NAVIGATION PAGE
    if(
      event.request.mode === 'navigate'
    ){

      event.respondWith(

        fetch(event.request)

          .then(function(response){

            const clone =
              response.clone();

            caches.open(CACHE_NAME)

              .then(function(cache){

                cache.put(
                  event.request,
                  clone
                );

              });

            return response;

          })

          .catch(function(){

            return caches.match(
              event.request
            )

            .then(function(resp){

              return resp ||

                caches.match(
                  OFFLINE_URL
                );

            });

          })

      );

      return;

    }

    // STATIC FILES
    event.respondWith(

      caches.match(event.request)

        .then(function(cached){

          return cached ||

            fetch(event.request)

              .then(function(response){

                if(
                  response &&
                  response.status===200
                ){

                  const clone=
                    response.clone();

                  caches.open(CACHE_NAME)

                    .then(function(cache){

                      cache.put(
                        event.request,
                        clone
                      );

                    });

                }

                return response;

              })

              .catch(function(){

                return caches.match(
                  OFFLINE_URL
                );

              });

        })

    );

  }
);
